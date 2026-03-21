import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "TestGate — Sàng lọc ứng viên thông minh",
  description: "Nền tảng tạo bài test online để sàng lọc ứng viên vòng loại. Tiết kiệm thời gian, chuẩn hóa đánh giá, chọn đúng người.",
  keywords: "tuyển dụng, test ứng viên, sàng lọc CV, bài kiểm tra online, HR tech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
