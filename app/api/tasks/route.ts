import { NextResponse } from "next/server";

// Simulierter Speicher (In-Memory)
let crewData: Record<string, { status: string, mission: string }> = {};

export async function POST(request: Request) {
  const { email, status, mission } = await request.json();
  crewData[email] = { status, mission };
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ updates: crewData });
}
