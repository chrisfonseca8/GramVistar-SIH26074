import { Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/components/providers/DataProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";

const inter = Inter({
  variable: "--font-inter",
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
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <DataProvider>{children}</DataProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
