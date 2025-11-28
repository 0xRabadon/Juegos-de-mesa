import "./globals.css";

export const metadata = {
  title: "Catálogo de Juegos",
  description: "Los mejores juegos de mesa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}