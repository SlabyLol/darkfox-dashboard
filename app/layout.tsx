export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        {/* Das hier erzwingt das moderne Design direkt im Browser */}
        <script src="https://cdn.tailwindcss.com"></script>
        <title>DarkFox Terminal</title>
      </head>
      <body style={{ backgroundColor: 'black', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
