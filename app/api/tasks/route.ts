import { NextResponse } from "next/server";

let taskStorage: Record<string, boolean> = {};

export async function POST(request: Request) {
  const { email, done } = await request.json();
  taskStorage[email] = done;
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ statuses: taskStorage });
}
