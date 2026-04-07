import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rawData = process.env.USER_DATA || "[]";
    const users = JSON.parse(rawData);
    
    // Passwörter entfernen, bevor wir die Liste schicken
    const safeUsers = users.map(({ pw, ...user }: any) => user);
    
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    return NextResponse.json({ users: [] });
  }
}
