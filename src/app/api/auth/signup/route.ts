import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { name, email, password } = await req.json();
  const existingUser = await User.findOne({ email });
  if (existingUser) return NextResponse.json({ error: "User exists" }, { status: 400 });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  return NextResponse.json({ message: "User created", user });
}
