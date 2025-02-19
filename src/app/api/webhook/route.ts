import { db } from "@/db";
import { subscription } from "@/db/schema";
import dayjs from "dayjs";
import { DrizzleError, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface PriceDetail {
  [key: string]: {
    amount: number;
    label: string;
    queries: number;
    questionCount: number;
  };
}

const priceList: PriceDetail = {
  price_1QGKzxBpYrMQUMR178WJADpc: {
    amount: 0,
    label: "Starter",
    queries: 4,
    questionCount: 10,
  },
  price_1QGL1DBpYrMQUMR1brEMeTuH: {
    amount: 4999,
    label: "Premium",
    queries: 200,
    questionCount: 30,
  },
  price_1QSjqgBpYrMQUMR1erxLlufq: {
    amount: 9999,
    label: "Integrated",
    queries: -1,
    questionCount: -1,
  },
};

async function handleInvoiceEvent(event: any) {
  const {
    id,
    hosted_invoice_url,
    invoice_pdf,
    amount_paid,
    subscription: subscriptionId,
    amount_due,
    status,
  } = event.data.object as any;

  try {
    await db
      .update(subscription)
      .set({
        amountPaid: amount_paid,
        invoiceUrl: hosted_invoice_url,
        invoiceId: id,
        invoicePdfUrl: invoice_pdf,
        status: status,
        amountDue: amount_due,
      })
      .where(eq(subscription.id, subscriptionId));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: `Error inserting invoice (payment ${status})`,
      },
      { status: 500 }
    );
  }
  return NextResponse.json({
    status: 200,
    message: `Invoice payment ${status}`,
  });
}

async function handlePlanChange(
  planId: string,
  amount: number,
  currency: string,
  subsId: string,
  planStart: number,
  planEnd: number
) {
  try {
    const { rowsAffected } = await db
      .update(subscription)
      .set({
        planId: planId,
        id: subsId,
        planName: priceList[planId as keyof typeof priceList] ? priceList[planId as keyof typeof priceList].label : "Unknown",
        queries: priceList[planId as keyof typeof priceList]? priceList[planId as keyof typeof priceList].queries: 0,
        currency: currency,
        amountPaid: amount,
        startDate: dayjs(planStart * 1000).toISOString(),
        endDate: dayjs(planEnd * 1000).toISOString(),
      })
      .where(eq(subscription.id, subsId));
    if (rowsAffected > 0) {
      console.log("Plan details updated");
    } else {
      throw new Error("UPDATE_PLAN_ERROR", { cause: "user not found" });
    }
  } catch (err) {
    console.error("UPDATE_PLAN_ERROR: ", err);
  }
}

async function updateSubscriptionCancellationDetail(customerId: string) {
  try {
    const { rowsAffected } = await db
      .delete(subscription)
      .where(eq(subscription.customerId, customerId));

    if (rowsAffected === 0) {
      throw new Error("USER_NOT_FOUND");
    }
  } catch (err) {
    console.error("SUBS_CANCEL_ERROR: ", err);
    throw new Error("Something went wrong");
  }
}

async function handleSubscriptionCreateEvent(event: any) {
  const {
    id: subscriptionId,
    current_period_end,
    current_period_start,
    customer,
    metadata: { userId },
    plan: { id, amount, currency },
  } = event.data.object;

  try {
    const { rowsAffected } = await db.insert(subscription).values({
      id: subscriptionId,
      userId: userId,
      status: "active",
      amountPaid: amount,
      currency: currency,
      planId: id,
      planName: priceList[id] ? priceList[id].label: "Unknown",
      queries: priceList[id]? priceList[id].queries: 0,
      startDate: dayjs(current_period_start * 1000).toISOString(),
      endDate: dayjs(current_period_end * 1000).toISOString(),
      customerId: customer,
      amountDue: amount,
    });

    if (rowsAffected === 0) {
      return NextResponse.json(
        {
          message: "Failed to create a subscription",
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.log("create subscription error: ", err);
    if (err instanceof DrizzleError) {
      const { cause, message } = err;
      console.log("create subscription error: ", message, cause);

      return NextResponse.json(
        {
          message,
        },
        { status: 500, statusText: cause as string }
      );
    }
    return NextResponse.json(
      {
        message: "Failed to create a subscription",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const reqText = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  console.log(dayjs().format("MMM-DD-YYYY | hh:mm a"));

  try {
    event = stripe.webhooks.constructEvent(
      reqText,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.log("Webhook Error: ", err);
    return NextResponse.json({ message: `Webhook Error` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "invoice.payment_succeeded": {
      console.log("signature: ", sig);
      await handleInvoiceEvent(event);
      break;
    }
    case "invoice.payment_failed": {
      await handleInvoiceEvent(event);
      break;
    }
    case "customer.subscription.created": {
      await handleSubscriptionCreateEvent(event);
      break;
    }
    case "customer.subscription.updated": {
      const data = event.data.object as any;
      const {
        id: subsId,
        plan: { id, amount, currency },
        current_period_end,
        current_period_start,
        product,
      } = data;
      await handlePlanChange(
        id,
        amount,
        currency,
        subsId,
        current_period_start,
        current_period_end
      );
      break;
    }
    case "customer.subscription.deleted": {
      const {
        object: { customer },
      } = event.data as Stripe.CustomerSubscriptionDeletedEvent.Data;

      if (typeof customer === "string") {
        await updateSubscriptionCancellationDetail(customer);
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return NextResponse.json({}, { status: 200 });
}
