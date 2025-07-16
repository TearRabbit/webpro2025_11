// components/Dashboard/SidebarLeft.tsx
import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; 

// UserPaperWithRelations 型は必要なので残しておく
type UserPaperWithRelations = {
  id: number; 
  createdAt: string;
  paper: {
    id: number; 
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
};

type SidebarLeftProps = {
  leftCollapsed: boolean;
  setLeftCollapsed: (collapsed: boolean) => void;
  userPapers: UserPaperWithRelations[];
  loading: boolean;
  selectedPaperId: number | null;
  setSelectedPaperId: (id: number) => void;
  onDeletePaper: (userPaperId: number) => void; 
};

export default function SidebarLeft({
  leftCollapsed,
  setLeftCollapsed,
  userPapers,
  loading,
  selectedPaperId,
  setSelectedPaperId,
  onDeletePaper, 
}: SidebarLeftProps) {
  const { data: session } = useSession();

  return (
    <aside
      style={{
        width: leftCollapsed ? 60 : 300,
        backgroundColor: "#f8f8f8",
        borderRight: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease-in-out",
        boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
      }}
    >
      {/* サイドバーのヘッダー部分 */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          borderBottom: "1px solid #eee",
          backgroundColor: "#fff",
        }}
      >
        <button
          onClick={() => setLeftCollapsed(!leftCollapsed)}
          style={{
            background: "none",
            border: "none",
            fontSize: 24,
            cursor: "pointer",
            padding: 0,
            color: "#555",
          }}
        >
          {leftCollapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* ユーザ情報 */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: leftCollapsed ? "column" : "row",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid #eee",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${session?.user?.color || "#ccc"}`,
            flexShrink: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={session?.user?.iconUrl || "/default-user-icon.png"}
            alt="User Icon"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        {!leftCollapsed && (
          <p style={{ margin: 0, fontWeight: "bold", fontSize: 16 }}>
            {session?.user?.name || "User"}
          </p>
        )}
      </div>

      {/* プロフィール設定と論文追加ボタン */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          backgroundColor: "#fff",
        }}
      >
        {/* passHref legacyBehavior を削除 */}
        <Link href="/profile" 
          style={{ // Linkコンポーネントに直接スタイルを渡す
            display: "flex",
            alignItems: "center",
            justifyContent: leftCollapsed ? "center" : "flex-start",
            gap: leftCollapsed ? "0" : "8px",
            padding: "10px 15px",
            backgroundColor: "#e0e0e0",
            color: "#333",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            boxShadow: "0 2px 3px rgba(0,0,0,0.1)",
            transition: "background-color 0.2s, box-shadow 0.2s",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d0d0d0")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
        >
          <span style={{ fontSize: "1.2em", color: "#666" }}>
            {leftCollapsed ? "👤" : "⚙️"}
          </span>
          {!leftCollapsed && "プロフィール設定"}
        </Link>
        {/* passHref legacyBehavior を削除 */}
        <Link href="/papers/add" 
          style={{ // Linkコンポーネントに直接スタイルを渡す
            display: "flex",
            alignItems: "center",
            justifyContent: leftCollapsed ? "center" : "flex-start",
            gap: leftCollapsed ? "0" : "8px",
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            boxShadow: "0 2px 3px rgba(0,0,0,0.1)",
            transition: "background-color 0.2s, box-shadow 0.2s",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
        >
          <span style={{ fontSize: "1.2em", color: "white" }}>
            {leftCollapsed ? "➕" : "➕"}
          </span>
          {!leftCollapsed && "論文を追加"}
        </Link>
      </div>

      {/* 論文リスト部分 */}
      <nav style={{ flexGrow: 1, overflowY: "auto", padding: "0 0 16px 0" }}>
        <h3 style={{ margin: "16px 16px 8px 16px", fontSize: 16, borderBottom: "1px solid #eee", paddingBottom: 4 }}>
          {!leftCollapsed && "論文リスト"}
        </h3>
        {loading ? (
          <p style={{ padding: "0 16px 16px 16px" }}>Loading papers...</p>
        ) : userPapers.length === 0 ? (
          <p style={{ padding: "0 16px 16px 16px" }}>No papers found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {userPapers.map((userPaper) => (
              <li
                key={userPaper.id}
                onClick={() => setSelectedPaperId(userPaper.id)} 
                style={{
                  padding: "10px 15px",
                  backgroundColor: selectedPaperId === userPaper.id ? "#e6f7ff" : "transparent",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  transition: "background-color 0.2s, box-shadow 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (selectedPaperId !== userPaper.id) {
                    e.currentTarget.style.backgroundColor = "#f0f8ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPaperId !== userPaper.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "1.2em", color: selectedPaperId === userPaper.id ? "#007bff" : "#888" }}>
                  {!leftCollapsed ? "📄" : "📄"}
                </span>
                {!leftCollapsed && (
                  <div style={{ flexGrow: 1, overflow: "hidden" }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: "#333", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {userPaper.paper.title}
                    </h3>
                    <p style={{ margin: "5px 0 0 0", fontSize: 12, color: "#777", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {userPaper.paper.authors} ({userPaper.paper.year})
                    </p>
                  </div>
                )}
                {/* 削除ボタン */}
                {!leftCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePaper(userPaper.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#dc3545",
                      fontSize: 20,
                      cursor: "pointer",
                      padding: "5px",
                      marginLeft: "auto",
                      flexShrink: 0,
                      opacity: 0.7,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                  >
                    &#x2716;
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}