import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "暗号",
  description: "一个简单的聊天室应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark text-foreground bg-background">
      <body>
        <Providers>
          <main className="h-screen w-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
