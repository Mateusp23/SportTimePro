import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SportTimePro",
  description: "Sistema de agendamento de aulas esportivas",
};

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", weight: ["400", "600", "700"], subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
