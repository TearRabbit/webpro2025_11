// components/Dashboard/SidebarRight.tsx
import React from 'react';

// Propsの型定義
type SidebarRightProps = {
  rightCollapsed: boolean;
  setRightCollapsed: (collapsed: boolean) => void;
  selectedPaper: {
    progress: {
      page: number | null;
      percent: number | null;
    } | null;
    likes: any[];
    bookmarks: any[];
  } | null;
};

export default function SidebarRight({
  rightCollapsed,
  setRightCollapsed,
  selectedPaper,
}: SidebarRightProps) {
  return (
    <aside
      style={{
        width: rightCollapsed ? 50 : 300,
        transition: "width 0.3s",
        borderLeft: "1px solid #ddd",
        padding: rightCollapsed ? "1rem 0" : "1rem",
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: rightCollapsed ? "center" : "flex-start",
        backgroundColor: "#f9f9f9",
      }}
    >
      <button
        onClick={() => setRightCollapsed(!rightCollapsed)}
        style={{
          alignSelf: rightCollapsed ? "center" : "flex-start",
          marginBottom: 16,
          cursor: "pointer",
          border: "none",
          background: "none",
          fontSize: 24,
          userSelect: "none",
        }}
        aria-label={rightCollapsed ? "Expand right sidebar" : "Collapse right sidebar"}
        title={rightCollapsed ? "Expand info" : "Collapse info"}
      >
        {rightCollapsed ? "◀" : "▶"}
      </button>

      {!rightCollapsed && (
        <>
          {selectedPaper ? (
            <>
              <h3>詳細情報</h3>
              {selectedPaper.progress && (
                <>
                  <p>進捗: {selectedPaper.progress.page}ページ読み込み</p>
                  <p>進捗率: {(selectedPaper.progress.percent ?? 0) * 100}%</p>
                </>
              )}
              <p>Likes: {selectedPaper.likes ? selectedPaper.likes.length : 0}</p>
              <p>Bookmarks: {selectedPaper.bookmarks ? selectedPaper.bookmarks.length : 0}</p>

              <h4>コメント</h4>
              <p>コメント表示エリア（後で実装）</p>
            </>
          ) : (
            <p>論文を選択してください</p>
          )}
        </>
      )}
    </aside>
  );
}