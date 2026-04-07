import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Holt die Daten aus den Railway Variables (USER_DATA)
    const rawData = process.env.USER_DATA || "[]";
    const users = JSON.parse(rawData);
    
    const foundUser = users.find((u: any) => u.email === email && u.pw === password);

    if (foundUser) {
      // Passwort für die Client-Antwort entfernen (Sicherheit)
      const { pw, ...userWithoutPassword } = foundUser;
      return NextResponse.json({ success: true, user: userWithoutPassword });
    }
    
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
