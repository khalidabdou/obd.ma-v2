import { ReactNode } from "react"
import type { Metadata } from "next"
import "./globals.css"
import { local_font } from "@/utils/variables"
import { getServerInitialLanguage } from "@/lib/languageServer"

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" }
    ],
  },
};

const themeInitScript = `(function(){try{var p=localStorage.getItem('theme-preference');var t=(p==='light'||p==='dark')?p:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var r=document.documentElement;if(t==='dark'){r.classList.add('dark');}else{r.classList.remove('dark');}r.setAttribute('data-theme',t);r.style.colorScheme=t;}catch(e){}})();`;

const langInitScript = `(function(){try{var c=document.cookie.split(';').find(function(r){return r.trim().startsWith('obd-language=');});var l=c?c.split('=')[1].trim():'fr';if(l!=='ar'&&l!=='fr'&&l!=='en')l='fr';var r=document.documentElement;r.setAttribute('lang',l);r.setAttribute('dir',l==='ar'?'rtl':'ltr');}catch(e){}})();`;

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const language = await getServerInitialLanguage()
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