import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found - OBD.ma",
}

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">This page could not be found.</p>
      <Link href="/v2" className="text-brand-blue hover:underline">
        Back to home
      </Link>
    </div>
  )
}
