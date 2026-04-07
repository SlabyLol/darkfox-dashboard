import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const users = JSON.parse(process.env.USER_DATA || "[]");
    const bossMessage = process.env.BOSS_MESSAGE || "Keine neuen Befehle.";
    const foundUser = users.find((u: any) => u.email === email && u.pw === password);

    if (foundUser) {
      const { pw, ...userWithoutPassword } = foundUser;
      return NextResponse.json({ success: true, user: userWithoutPassword, bossMessage });
    }
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
