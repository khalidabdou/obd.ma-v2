import { ReactNode } from "react"
import "./globals.css"

export const metadata = {
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" }
    ],
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <head></head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}

export default RootLayout