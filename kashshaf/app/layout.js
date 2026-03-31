import './globals.css'

export const metadata = {
  title: 'Kashshaf — Egyptian Grassroots Football Scouting',
  description: 'The scouting platform for Egyptian grassroots football. Coaches write professional reports. Fans spot hidden talent. Clubs find their next signing.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
