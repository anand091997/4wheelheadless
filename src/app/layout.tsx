import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ToastProvider from "@/components/ToastProvider";
import { getHeaderMenuCategories, getStoreConfig } from "@/framework/graphql";
import { createRootMetadata } from "@/lib/seo";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = createRootMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [storeConfig, headerMenuCategories] = await Promise.all([
    getStoreConfig().catch(() => null),
    getHeaderMenuCategories().catch(() => []),
  ]);

  return (
    <html lang="en">
      <body>
        <Header storeConfig={storeConfig} categories={headerMenuCategories} />
        {children}
        <Footer storeCopyright={storeConfig?.copyright ?? null} />
        <ToastProvider />
      </body>
    </html>
  );
}
