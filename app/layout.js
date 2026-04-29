import './globals.css'

export const metadata = {
  title: 'Agente de Marketing',
  description: 'Asistente de marketing con IA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
