import './globals.css'; // Add this at the very top!

export const metadata = {
  title: 'Nook',
  description: 'Find your quiet sanctuary',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
