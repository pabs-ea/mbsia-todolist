import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "To-Do Pro",
  description: "Aplicacion moderna de lista de tareas con Next.js y Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
