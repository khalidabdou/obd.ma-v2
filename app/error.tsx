"use client"

import Link from "next/link"

export default function ErrorScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 className="text-4xl font-bold mb-4">500</h1>
      <p className="text-muted-foreground mb-6">Something went wrong. Our team is working on it.</p>
      <Link href="/v2" className="text-brand-blue hover:underline">
        Back to home
      </Link>
    </div>
  )
}
