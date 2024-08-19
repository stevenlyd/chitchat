import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

// export const metadata: Metadata = {
//   title: "暗号",
//   description: "一个简单的聊天室应用",
//   manifest: "/manifest.json",
// };

import { headers } from "next/headers";

export async function generateViewport(): Promise<Viewport> {
  const userAgent = headers().get("user-agent");
  const isiPhone = /iphone/i.test(userAgent ?? "");
  return isiPhone
    ? {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1, // disables auto-zoom on ios safari
      }
    : {};
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark text-foreground bg-background overflow-hidden"
    >
      <body>
        <Providers>
          <main className="h-screen w-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
