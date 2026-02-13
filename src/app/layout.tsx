import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DesignChecker",
  description: "Built with Entonomy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
