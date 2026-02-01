import "./globals.css";
import React from "react";

export const metadata = {
  title: "Tutor de Casos Clínicos – Oftalmologia",
  description: "Uso educacional. Não substitui supervisão médica.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
