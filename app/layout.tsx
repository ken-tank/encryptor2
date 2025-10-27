import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Encryptor 2",
  description: "Encryptor Tools with AES Method and Random Salt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
