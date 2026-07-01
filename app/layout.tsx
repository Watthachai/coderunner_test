import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cafe Pre-order & Pick-up System",
  description:
    "ระบบสั่งเครื่องดื่มล่วงหน้าและรับสินค้าที่ร้าน สไตล์คาเฟ่เกาหลี — สั่ง ปรับแต่งเมนู แนบสลิป และติดตามสถานะแบบเรียลไทม์",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌸</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        {/* Google Fonts: Inter & Anuphan — matches the prototype's index.html */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Anuphan:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAF6F0]">{children}</body>
    </html>
  );
}
