// components/PdfViewer.tsx
import React, { useEffect, useRef, useState, DragEvent as ReactDragEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// ワーカーパス
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// コメントの型定義 (MainContent.tsx と合わせる)
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

type PdfViewerProps = {
  file: string | null;
  jumpToPage: number;
  jumpTrigger: number;
  onLoadSuccess: (arg: { numPages: number }) => void;
  onPdfDrop: (page: number, x: number, y: number) => void;
  comments: CommentData[]; // コメントの配列を受け取る
};

export default function PdfViewer({ file, jumpToPage, jumpTrigger, onLoadSuccess, onPdfDrop, comments }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [pdfReadyForJump, setPdfReadyForJump] = useState(false);

  // 各ページのレンダリングされた実際のサイズを保持するState
  // pageNumber (1-indexed) -> { width, height }
  const [pageDimensions, setPageDimensions] = useState<{ [key: number]: { width: number; height: number } }>({});

  // コメントの展開状態をローカルで管理 (ID -> expanded/hidden)
  const [commentStates, setCommentStates] = useState<{ [key: number]: { expanded: boolean; hidden: boolean } }>({});

  // コメントの初期状態をセット (propsのcommentsが変更されたらリセット)
  useEffect(() => {
    const initialStates: { [key: number]: { expanded: boolean; hidden: boolean } } = {};
    comments.forEach(comment => {
      initialStates[comment.id] = { expanded: comment.expanded, hidden: comment.hidden };
    });
    setCommentStates(initialStates);
  }, [comments]);


  // ページジャンプ処理
  useEffect(() => {
    if (pdfReadyForJump && jumpToPage >= 1 && jumpToPage <= numPages) {
      const ref = pageRefs.current[jumpToPage - 1];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [jumpToPage, numPages, pdfReadyForJump, jumpTrigger]);

  // file が変更されたら、pdfReadyForJump をリセット
  useEffect(() => {
    setPdfReadyForJump(false);
    setPageDimensions({}); // 新しいPDFがロードされるので、ページの寸法もリセット
  }, [file]);

  // ドロップイベントハンドラ
  const handleDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dataType = e.dataTransfer.getData("text/plain");
    if (dataType !== "comment") {
      return;
    }

    if (!viewerRef.current || numPages === 0) return;

    const viewerRect = viewerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    let droppedPageNumber: number | null = null;
    let pageActualWidth: number = 0;
    let pageActualHeight: number = 0;
    let pageRelativeX: number = 0;
    let pageRelativeY: number = 0;

    for (let i = 0; i < numPages; i++) {
      const pageEl = pageRefs.current[i];
      if (pageEl) {
        const pageRect = pageEl.getBoundingClientRect();
        // ドロップされた座標がこのページの領域内にあるかチェック
        if (clientX >= pageRect.left && clientX <= pageRect.right &&
            clientY >= pageRect.top && clientY <= pageRect.bottom) {
          
          droppedPageNumber = i + 1;
          pageActualWidth = pageRect.width;
          pageActualHeight = pageRect.height; // ここで実際の高さを取得
          
          pageRelativeX = (clientX - pageRect.left);
          pageRelativeY = (clientY - pageRect.top);
          
          break; // 見つかったらループを終了
        }
      }
    }

    if (droppedPageNumber !== null) {
      // ページの実測値で正規化
      const normalizedX = pageRelativeX / (pageActualWidth || 1); // 0除算を防ぐ
      const normalizedY = pageRelativeY / (pageActualHeight || 1); // 0除算を防ぐ

      onPdfDrop(droppedPageNumber, normalizedX, normalizedY);
    }
  };

  const handleDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // コメントの展開/縮小トグルハンドラ
  const toggleCommentExpanded = (commentId: number) => {
    setCommentStates(prev => ({
      ...prev,
      [commentId]: { ...prev[commentId], expanded: !prev[commentId].expanded }
    }));
    // TODO: バックエンドへの expanded 状態更新API呼び出し
  };

  // コメントの非表示/表示トグルハンドラ
  const toggleCommentHidden = (commentId: number) => {
    setCommentStates(prev => ({
      ...prev,
      [commentId]: { ...prev[commentId], hidden: !prev[commentId].hidden }
    }));
    // TODO: バックエンドへの hidden 状態更新API呼び出し
  };

  if (!file) return <p>PDFがありません。</p>;

  return (
    <div
      ref={viewerRef}
      className="overflow-y-scroll max-h-[80vh] px-4"
      style={{ width: '100%', position: 'relative' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Document
        file={file}
        onLoadSuccess={(pdf) => {
          setNumPages(pdf.numPages);
          onLoadSuccess({ numPages: pdf.numPages });
          setPdfReadyForJump(true);
        }}
      >
        {Array.from({ length: numPages }, (_, i) => {
          const currentPageNumber = i + 1;
          const nextPageNumber = i + 2;

          // 現在のページの実際の寸法を取得
          const currentDimensions = pageDimensions[currentPageNumber];

          return (
            <React.Fragment key={`page-segment-${currentPageNumber}`}>
              <div
                key={`page_${currentPageNumber}`}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                style={{ minHeight: '600px', width: '600px', margin: '0 auto 2rem auto', position: 'relative' }}
              >
                <Page
                  pageNumber={currentPageNumber}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  width={600}
                  // 各ページのレンダリングが成功したときに、そのページの実際の寸法を取得
                  onRenderSuccess={({ originalHeight, originalWidth }) => {
                      // width={600} でレンダリングされているので、実際の表示サイズは600px基準に変換
                      const renderedWidth = 600;
                      const renderedHeight = (originalHeight / originalWidth) * renderedWidth;
                      setPageDimensions(prev => ({
                          ...prev,
                          [currentPageNumber]: { width: renderedWidth, height: renderedHeight }
                      }));
                  }}
                />
                {/* このページに紐づくコメントを表示 */}
                {comments.filter(c => c.page === currentPageNumber && !commentStates[c.id]?.hidden).map(comment => {
                  const isExpanded = commentStates[comment.id]?.expanded ?? comment.expanded;

                  // コメントの配置をページの実際の寸法に基づいて計算
                  // pageDimensionsに情報がある場合のみ正確に計算
                  const displayWidth = currentDimensions?.width || 600; // デフォルトは600px
                  const displayHeight = currentDimensions?.height || (600 * (1.414)); // デフォルトはA4縦横比

                  const leftPos = comment.x * displayWidth;
                  const topPos = comment.y * displayHeight;

                  return (
                    <div
                      key={comment.id}
                      style={{
                        position: 'absolute',
                        left: leftPos,
                        top: topPos,
                        transform: 'translate(-50%, -50%)', // 中央揃え
                        zIndex: 20,
                        cursor: 'pointer',
                        padding: isExpanded ? '10px' : '5px',
                        backgroundColor: isExpanded ? 'rgba(255, 255, 180, 0.95)' : 'rgba(0, 123, 255, 0.7)',
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: isExpanded ? '5px' : '50%',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        maxWidth: isExpanded ? '300px' : '20px',
                        minWidth: isExpanded ? '100px' : '20px',
                        minHeight: isExpanded ? 'auto' : '20px',
                        maxHeight: isExpanded ? '200px' : '20px',
                        overflow: 'hidden',
                        whiteSpace: isExpanded ? 'normal' : 'nowrap',
                        textOverflow: isExpanded ? 'clip' : 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isExpanded ? '0.9em' : '1.2em',
                        color: isExpanded ? '#333' : 'white',
                      }}
                      onClick={() => toggleCommentExpanded(comment.id)}
                    >
                      {isExpanded ? (
                        <>
                          <div>{comment.body}</div>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleCommentHidden(comment.id); }}
                            style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8em', cursor: 'pointer', marginLeft: 'auto', padding: '0 5px' }}
                          >
                            [非表示]
                          </button>
                        </>
                      ) : (
                        '💬'
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '5px 0',
                  margin: '10px auto 2rem auto',
                  width: '600px',
                  backgroundColor: '#f0f0f0',
                  color: '#555',
                  fontSize: '0.9em',
                  borderTop: '1px solid #ccc',
                  borderBottom: '1px solid #ccc',
                }}
              >
                {currentPageNumber === numPages
                  ? `Page ${currentPageNumber}`
                  : `Page ${currentPageNumber} / Page ${nextPageNumber}`}
              </div>
            </React.Fragment>
          );
        })}
      </Document>
    </div>
  );
}