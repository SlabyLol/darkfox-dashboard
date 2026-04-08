import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Liest die geheime Variable direkt vom Railway-Server
    const rawData = process.env.USER_DATA;
    
    if (!rawData) {
      return NextResponse.json({ success: false, error: "CRITICAL: Railway Variable USER_DATA fehlt auf dem Server!" }, { status: 500 });
    }

    // JSON entpacken und User suchen
    const users = JSON.parse(rawData);
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, error: "Falsche Terminal-ID oder Passwort" }, { status: 401 });

  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ success: false, error: "JSON Parse Fehler in der Railway Variable" }, { status: 500 });
  }
}
