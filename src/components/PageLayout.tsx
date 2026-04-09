"use client";

import React from "react";

interface PageLayoutProps {
  pageTitle: string;
  showHeader?: boolean;
  children: React.ReactNode;
}

export default function PageLayout({
  pageTitle,
  showHeader = true,
  children,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-300 to-teal-400 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-black text-white text-xs px-3 py-1.5 flex items-center">
        <span className="font-medium truncate">🌐 IOSTちゃんのアカウント工房</span>
      </div>

      {/* ページ名 */}
      {showHeader && (
        <div className="bg-white border-b-2 border-black px-4 py-2.5 flex items-center">
          <h2 className="text-lg font-bold text-black">{pageTitle}</h2>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 py-5 pb-24">{children}</main>

      {/* フッター */}
      <div
        className="h-14 bg-yellow-300 border-t-2 border-black relative"
        style={{
          backgroundImage: "url(/footer.png)",
          backgroundSize: "contain",
          backgroundPosition: "bottom",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
