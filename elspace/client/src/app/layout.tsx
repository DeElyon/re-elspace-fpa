import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elspace - Connect with Talents",
  description: "Connect with talented freelancers or find amazing projects",
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
