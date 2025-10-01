import "./globals.css";

export const metadata = {
  title: "Portfolio 2 Column",
  description: "Adaptado a Next.js sin Bootstrap",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}