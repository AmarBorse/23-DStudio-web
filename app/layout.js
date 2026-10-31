import "./globals.css";

export const metadata = {
  title: "23D Studio — Visualizing Spaces Before They Exist",
  description:
    "23D Studio creates architectural visualisation, cinematic 3D walkthroughs and virtual reality tours for architects, interior designers, builders and developers.",
  icons: { icon: "/images/logo-black.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Sets day/night before the page paints: saved choice first, otherwise the device setting */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body id="top">{children}</body>
    </html>
  );
}