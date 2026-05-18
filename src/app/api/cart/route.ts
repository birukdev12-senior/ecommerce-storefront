import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const cart = await Cart.findOne({ userId: session.user.id }).populate("items.productId");
  return NextResponse.json(cart || { items: [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId, quantity } = await req.json();
  await connectDB();
  let cart = await Cart.findOne({ userId: session.user.id });
  if (!cart) cart = new Cart({ userId: session.user.id, items: [] });
  const existing = cart.items.find((i: any) => i.productId.toString() === productId);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ productId, quantity });
  await cart.save();
  return NextResponse.json(cart);
}
