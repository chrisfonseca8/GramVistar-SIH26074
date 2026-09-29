import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/components/providers/DataProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GramVistar",
  description:
    "Agro-meteorological decision-support platform for Chas Block, Bokaro District, Jharkhand.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <DataProvider>{children}</DataProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
