// pages/dashboard.tsx
import { useEffect, useState, ChangeEvent } from "react";
import { useSession, getSession } from "next-auth/react";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";

// 分離したコンポーネントをインポートする行を追加
import { MainContent, SidebarLeft, SidebarRight } from "../components/Dashboard"; // <<< この行を追加！

const PdfViewer = dynamic(() => import("../components/PdfViewer"), { ssr: false });

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

// UserPaperWithRelations 型を更新
type UserPaperWithRelations = {
  id: number; // これは UserPaper の ID
  createdAt: string;
  paper: {
    id: number; // これは Paper の ID
    title: string;
    authors: string;
    year: number;
  };
  progress: {
    page: number | null;
    percent: number | null;
  } | null;
  likes: any[];
  bookmarks: any[];
  comments: CommentData[]; // コメントの配列を追加
};

// getServerSideProps を追加
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  // セッションがない場合はサインインページにリダイレクト
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false, // 永続的なリダイレクトではない
      },
    };
  }

  // セッションがある場合は、それをpropsとしてページに渡す
  return {
    props: { session },
  };
}


export default function Dashboard() {
  const { data: session, status } = useSession();
  const [userPapers, setUserPapers] = useState<UserPaperWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [jumpToPageInput, setJumpToPageInput] = useState<string>("1");
  const [actualJumpToPage, setActualJumpToPage] = useState<number>(1);
  const [jumpTrigger, setJumpTrigger] = useState(0);

  // 論文リストを取得する関数を切り出す
  const fetchUserPapers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/userpapers?includeComments=true", { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) setUserPapers(data);
      else setUserPapers([]);
    } catch (error) {
      console.error("Failed to fetch user papers:", error);
      setUserPapers([]);
    } finally {
      setLoading(false);
    }
  };

  // selectedPaperId が変更されたら、新しいPDFの最初のページにジャンプする準備をする
  useEffect(() => {
    if (selectedPaperId !== null) {
      setJumpToPageInput("1");
      setActualJumpToPage(1);
      setJumpTrigger(prev => prev + 1);
      setNumPages(null);
    }
  }, [selectedPaperId]);

  // 認証状態に基づいて論文リストをフェッチ
  useEffect(() => {
    // status が "authenticated" になったときにのみフェッチ
    // getServerSideProps でセッションがプリフェッチされるため、
    // クライアントサイドでのセッションロードを待つ必要が減る
    if (status === "authenticated") {
      fetchUserPapers();
    }
  }, [status]); // status が変更されたときのみ実行

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>Please sign in to see your papers.</p>;

  const selectedPaper = userPapers.find((p) => p.id === selectedPaperId);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    const pageNum = parseInt(jumpToPageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setActualJumpToPage(pageNum);
      setJumpTrigger(prev => prev + 1);
    } else {
      setActualJumpToPage(1);
      setJumpToPageInput("1");
      setJumpTrigger(prev => prev + 1);
    }
  }

  const handlePageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJumpToPageInput(e.target.value);
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPageInput);
    if (numPages && !isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setActualJumpToPage(pageNum);
      setJumpTrigger(prev => prev + 1);
    } else {
      alert(`ページ番号は1から${numPages}の間で入力してください。`);
    }
  };

  const handleDeletePaper = async (userPaperId: number) => {
    if (!confirm("この論文をリストから削除しますか？")) {
      return;
    }

    try {
      const res = await fetch(`/api/userpapers/delete/${userPaperId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        alert("論文がリストから削除されました。");
        fetchUserPapers();
        if (selectedPaperId === userPaperId) {
          setSelectedPaperId(null);
        }
      } else {
        const errorData = await res.json();
        alert(`削除に失敗しました: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting paper:", error);
      alert("論文の削除中にエラーが発生しました。");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <SidebarLeft
        leftCollapsed={leftCollapsed}
        setLeftCollapsed={setLeftCollapsed}
        userPapers={userPapers}
        loading={loading}
        selectedPaperId={selectedPaperId}
        setSelectedPaperId={setSelectedPaperId}
        onDeletePaper={handleDeletePaper}
      />
      <MainContent
        selectedPaper={selectedPaper}
        numPages={numPages}
        jumpToPageInput={jumpToPageInput}
        setJumpToPageInput={setJumpToPageInput}
        handleJumpToPage={handleJumpToPage}
        onDocumentLoadSuccess={onDocumentLoadSuccess}
        actualJumpToPage={actualJumpToPage}
        jumpTrigger={jumpTrigger}
      />
      <SidebarRight
        rightCollapsed={rightCollapsed}
        setRightCollapsed={setRightCollapsed}
        selectedPaper={selectedPaper}
      />
    </div>
  );
}