import { ReactNode } from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import "./globals.css"
import { local_font } from "@/utils/variables"

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" }
    ],
  },
};

const themeInitScript = `(function(){try{var p=localStorage.getItem('theme-preference');var t=(p==='light'||p==='dark')?p:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var r=document.documentElement;if(t==='dark'){r.classList.add('dark');}else{r.classList.remove('dark');}r.setAttribute('data-theme',t);r.style.colorScheme=t;}catch(e){}})();`;

const langInitScript = `(function(){try{var c=document.cookie.split(';').find(function(r){return r.trim().startsWith('obd-language=');});var l=c?c.split('=')[1].trim():'ar';if(l!=='ar'&&l!=='fr'&&l!=='en')l='ar';var r=document.documentElement;r.setAttribute('lang',l);r.setAttribute('dir',l==='ar'?'rtl':'ltr');}catch(e){}})();`;

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('obd-language')?.value
  const language = ['ar', 'fr', 'en'].includes(langCookie || '') ? langCookie : 'ar'
  const dir = language === 'ar' ? 'rtl' : 'ltr'

  return (
    <html suppressHydrationWarning lang={language} dir={dir} className={local_font.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: langInitScript }} />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}

export default RootLayout