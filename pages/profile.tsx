// pages/profile.tsx
import { useSession } from "next-auth/react";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";

export default function Profile() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setColor(session.user.color || "");
      setIconUrl(session.user.iconUrl || "");
    }
  }, [session]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, color, iconUrl }),
    });

    if (res.ok) {
      alert("プロフィールを更新しました！");
      window.location.reload();
    } else {
      alert("更新に失敗しました");
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", String(session?.user?.id ?? ""));

    const res = await fetch("/api/user/upload-icon", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setIconUrl(data.url); // 自動的にURLフィールドに反映
    } else {
      alert("画像アップロードに失敗しました");
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>サインインしてください</p>;

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 24 }}>
      <h1>プロフィール設定</h1>
      <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          名前
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </label>

        <label>
          カラー（例: #0070f3）
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          プロフィール画像アップロード（PNG / JPG）
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        {iconUrl && (
          <div>
            <p>プレビュー:</p>
            <img src={iconUrl} alt="アイコン" style={{ width: 80, height: 80, borderRadius: "50%" }} />
          </div>
        )}

        <button
          type="submit"
          style={{
            backgroundColor: "#0070f3",
            color: "white",
            padding: "10px",
            borderRadius: 4,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          更新する
        </button>
      </form>
    </div>
  );
}

