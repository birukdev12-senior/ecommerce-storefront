import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { price, name } = await request.json();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name },
          unit_amount: price,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${request.headers.get("origin") || ""}/`,
      cancel_url: `${request.headers.get("origin") || ""}/cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
