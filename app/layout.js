export const metadata = {
  title: 'Nook',
  description: 'Find your quiet sanctuary',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
