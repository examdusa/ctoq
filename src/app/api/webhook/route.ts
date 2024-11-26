import { db } from "@/db";
import { subscription } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  price_1QGNbZBpYrMQUMR14RX1iZVQ: {
    amount: 0,
    label: "Starter",
    queries: 4,
    questionCount: 10,
  },
  price_1QH7gtBpYrMQUMR1GNUV8E6W: {
    amount: 4999,
    label: "Premium",
    queries: 200,
    questionCount: 30,
  },
  price_1QKM8OBpYrMQUMR17Lk1ZR7D: {
    amount: 9999,
    label: "Integrated",
    queries: -1,
    questionCount: -1,
  },
};

async function handleInvoiceEvent(
  event: Stripe.Event,
  status: "succeeded" | "failed"
) {
  const invoice = event.data.object as Stripe.Invoice;

  const { id } = invoice;
  if (id) {
    const subRec = await db
      .select()
      .from(subscription)
      .where(eq(subscription.invoiceId, id));
    if (!subRec) {
      return NextResponse.json(
        {
          error: `Error inserting invoice (payment ${status})`,
        },
        { status: 500 }
      );
    }

    try {
      await db.update(subscription).set({
        currency: invoice.currency,
        amountDue: status === "failed" ? invoice.amount_due / 100 : undefined,
        invoiceUrl: invoice.hosted_invoice_url,
        invoiceId: invoice.id,
        invoicePdfUrl: invoice.invoice_pdf,
        status: invoice.status,
      });
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

  return NextResponse.json({
    status: 200,
    message: `Invoice payment ${status}`,
  });
}

async function handlePlanChange(
  customerId: string,
  planId: string,
  amount: number,
  currency: string,
  subsId: string
) {
  try {
    const user = await db
      .select()
      .from(subscription)
      .where(eq(subscription.customerId, customerId));

    if (user.length > 0) {
      const { userId } = user[0];
      await db
        .update(subscription)
        .set({
          planId: planId,
          id: subsId,
          planName: priceList[planId].label,
          queries: priceList[planId].queries,
          currency: currency,
          amountPaid: amount / 100,
        })
        .where(eq(subscription.userId, userId));
    } else {
      throw new Error("UPDATE_PLAN_ERROR", { cause: "user not found" });
    }
  } catch (err) {
    console.error("UPDATE_PLAN_ERROR: ", err);
  }
}

async function handleUpdateInvoice(
  custId: string,
  invoiceUrl: string,
  invoicePdfUrl: string
) {
  try {
    const users = await db
      .select()
      .from(subscription)
      .where(eq(subscription.customerId, custId));

    if (users.length > 0) {
      const { userId } = users[0];

      await db
        .update(subscription)
        .set({
          invoiceUrl: invoiceUrl,
          invoicePdfUrl: invoicePdfUrl,
        })
        .where(eq(subscription.userId, userId));
    } else {
      throw new Error("UPDATE_PLAN_ERROR", { cause: "user not found" });
    }
  } catch (err) {
    console.error("UPDATE_INVOICE_ERROR: ", err);
  }
}

export async function POST(req: NextRequest) {
  const reqText = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

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
    case "checkout.session.completed":
      const {
        metadata,
        subscription: subsId,
        invoice,
        amount_total,
        customer,
      } = event.data.object;
      if (metadata) {
        const user = await db
          .select()
          .from(subscription)
          .where(eq(subscription.userId, metadata.userId));
        if (user.length === 0) {
          const { label, queries } = priceList[metadata.priceId];
          try {
            await db.insert(subscription).values({
              id: subsId as string,
              userId: metadata.userId,
              status: "In progress",
              invoiceId: invoice as string,
              planId: metadata.priceId,
              planName: label,
              queries: queries,
              amountDue: amount_total ? amount_total / 100 : null,
              amountPaid: amount_total ? amount_total / 100 : null,
              customerId: customer as string,
            });
          } catch (err) {
            console.error("SUBS_REC_UPDATE_ERR: ", err);
          }
        } else {
          try {
            await db
              .update(subscription)
              .set({
                customerId: customer as string,
              })
              .where(eq(subscription.userId, metadata.userId));
          } catch (err) {
            console.error("subs rec add error: ", err);
          }
        }
      }
    case "invoice.payment_succeeded":
      handleInvoiceEvent(event, "succeeded");
    case "invoiceitem.created": {
      const { customer, id } = event.data.object;
      const { hosted_invoice_url, invoice_pdf } =
        await stripe.invoices.retrieve(id);
      if (hosted_invoice_url && invoice_pdf) {
        await handleUpdateInvoice(
          customer as string,
          hosted_invoice_url,
          invoice_pdf
        );
      }
      break;
    }
    case "invoice.payment_failed":
      break;
    case "customer.subscription.updated": {
      const data = event.data.object as any;
      const {
        id: subsId,
        customer,
        plan: { id, amount, currency },
      } = data;
      await handlePlanChange(customer, id, amount, currency, subsId);
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return NextResponse.json({}, { status: 200 });
}
