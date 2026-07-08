import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { NavBar } from '@/components/layout/NavBar';

export const metadata: Metadata = {
  title: 'AI Knowledge Atlas',
  description: '用知识图谱和结构化课程理解 AI 工程、Agent、RAG、LLMOps 与企业级 AI 平台。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <NavBar />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
