import { db } from "@/db";
import { subscription } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { userId, email, priceId, priceName } = await req.json();

  try {
    const subscriptionDetails = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId));

    const customerId =
      subscriptionDetails.length > 0
        ? subscriptionDetails[0].customerId ?? undefined
        : undefined;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      metadata: {
        userId: userId,
        email: email,
        priceId: priceId,
        prdtName: priceName,
      },
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_DOMAIN}/confirm-payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_DOMAIN}/cancel`,
    });
    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
