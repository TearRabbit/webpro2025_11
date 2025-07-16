// components/Dashboard/MainContent.tsx
import React, { ChangeEvent, useState, DragEvent as ReactDragEvent } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react'; // useSession をインポート

const PdfViewer = dynamic(() => import("../PdfViewer"), { ssr: false });

// Propsの型定義 (更新)
type CommentData = {
  id: number;
  userPaperId: number;
  page: number;
  x: number;
  y: number;
  body: string;
  expanded: boolean;
  hidden: boolean;
};

type UserPaperWithRelations = {
  id: number; // UserPaperのID
  createdAt: string;
  paper: {
    id: number; // PaperのID
    title: string;
    authors: string;
    year: number;
  };
  progress: { page: number | null; percent: number | null; } | null;
  likes: any[];
  bookmarks: any[];
  comments: CommentData[]; // コメントの配列を追加
};

type MainContentProps = {
  selectedPaper: UserPaperWithRelations | null; // 型を更新
  numPages: number | null;
  jumpToPageInput: string;
  setJumpToPageInput: (value: string) => void;
  handleJumpToPage: () => void;
  onDocumentLoadSuccess: (arg: { numPages: number }) => void;
  actualJumpToPage: number;
  jumpTrigger: number;
};

export default function MainContent({
  selectedPaper,
  numPages,
  jumpToPageInput,
  setJumpToPageInput,
  handleJumpToPage,
  onDocumentLoadSuccess,
  actualJumpToPage,
  jumpTrigger,
}: MainContentProps) {
  const pdfUrl = selectedPaper ? `/api/papers/pdf/${selectedPaper.paper.id}` : null;
  const { data: session } = useSession(); // userPaperId を取得するためにセッションが必要

  // コメントを一時的に保存する状態 (ドロップ位置の確認用は削除、APIから取得したコメントを扱う)
  // const [newCommentCoords, setNewCommentCoords] = useState<{ page: number; x: number; y: number } | null>(null);

  const handleDragStart = (e: ReactDragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", "comment");
    // ドラッグ時の画像を設定することも可能 (例: e.dataTransfer.setDragImage(img, 0, 0);)
  };

  const handlePageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJumpToPageInput(e.target.value);
  };

  // PdfViewerからドロップされた座標とページ番号を受け取るコールバック
  const handlePdfDrop = async (page: number, x: number, y: number) => {
    if (!selectedPaper || !session?.user?.id) {
      alert("コメントを追加するには、論文を選択し、ログインしてください。");
      return;
    }

    const commentBody = prompt("コメントを入力してください:");
    if (commentBody === null || commentBody.trim() === "") {
      alert("コメントがキャンセルされました、または空です。");
      return;
    }

    try {
      const res = await fetch("/api/comments/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPaperId: selectedPaper.id, // UserPaperのIDを送信
          page: page,
          x: x,
          y: y,
          body: commentBody,
        }),
        credentials: 'include',
      });

      if (res.ok) {
        alert("コメントが追加されました！");
        // コメント追加後、論文データを再フェッチしてコメントリストを更新する
        // このため、fetchUserPapers 関数を dashboard.tsx から MainContent に渡す必要がある
        // もしくは、dashboard.tsxでselectedPaperを更新するコールバックを渡す
        // 現状はalertのみだが、この後、親コンポーネントのロジックと連携する
        // 例: onCommentAdded(selectedPaper.id); // 親に通知して再フェッチさせる
      } else {
        const errorData = await res.json();
        alert(`コメントの追加に失敗しました: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("コメントの追加中にエラーが発生しました。");
    }
  };

  return (
    <main
      style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      {selectedPaper ? (
        <>
          {/* 固定ヘッダー */}
          <div
            style={{
              padding: 16,
              borderBottom: "1px solid #eee",
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <h1 style={{ margin: "0 0 8px 0", fontSize: 24 }}>{selectedPaper.paper.title}</h1>
            <p style={{ margin: "0 0 16px 0", color: "#555" }}>
              {selectedPaper.paper.authors} ({selectedPaper.paper.year})
            </p>

            {/* ページ指定機能 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label htmlFor="page-input">
                Page:
              </label>
              <input
                id="page-input"
                type="number"
                value={jumpToPageInput}
                onChange={handlePageInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJumpToPage();
                    e.currentTarget.blur();
                  }
                }}
                min={1}
                max={numPages || 1}
                style={{ width: 60, padding: 4, border: "1px solid #ccc", borderRadius: 4 }}
              />
              {numPages && (
                <span> / {numPages}</span>
              )}
              <button
                onClick={handleJumpToPage}
                style={{ padding: "4px 8px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
              >
                Go
              </button>
            </div>
            {/* ドラッグ可能なコメントアイコン */}
            <div
              draggable="true"
              onDragStart={handleDragStart}
              style={{
                marginTop: 20,
                padding: "10px 15px",
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '5px',
                cursor: 'grab',
                display: 'inline-block',
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              💬 コメントを追加
            </div>
            {/* newCommentCoords の表示は削除 */}
            {/* {newCommentCoords && (
                <p style={{ marginTop: 10, fontSize: 14, color: '#333' }}>
                    ドロップ位置: Page {newCommentCoords.page}, X: {newCommentCoords.x.toFixed(2)}, Y: {newCommentCoords.y.toFixed(2)}
                </p>
            )} */}
          </div>

          {/* PDFビューワー（スクロール可能部分） */}
          <div
            style={{
              flexGrow: 1,
              padding: 16,
              overflowY: "auto",
              position: "relative", // コメントの絶対配置のために必要
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <PdfViewer
              file={pdfUrl}
              jumpToPage={actualJumpToPage}
              jumpTrigger={jumpTrigger}
              onLoadSuccess={onDocumentLoadSuccess}
              onPdfDrop={handlePdfDrop}
              comments={selectedPaper.comments || []} // コメントデータを渡す
            />
          </div>
        </>
      ) : (
        <p style={{ color: "#888", padding: 16 }}>左のリストから論文を選択してください。</p>
      )}
    </main>
  );
}