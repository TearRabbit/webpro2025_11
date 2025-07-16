// pages/papers/add.tsx
import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from "react";

export default function AddPaper() {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル選択ダイアログを開く
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // ファイルが選択されたとき
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // ドラッグ時のUI制御
  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragActive(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };  

  // 送信処理（例）
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("PDFファイルを選択してください");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("authors", authors);
    formData.append("year", year);
    formData.append("file", file);
  
    const res = await fetch("/api/papers/add", {
      method: "POST",
      body: formData,
    });
  
    if (res.ok) {
      alert("論文を追加しました！");
      // 追加後、入力クリアやページ遷移など適宜処理してください
      setTitle("");
      setAuthors("");
      setYear("");
      setFile(null);
    } else {
      alert("論文の追加に失敗しました");
    }
  };  

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <label style={{ display: "block", marginBottom: 8 }}>
        タイトル
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        著者
        <input
          type="text"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 16 }}>
        発行年
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
          min={1900}
          max={2100}
          style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
        />
      </label>

      <div
  onClick={openFileDialog}  // クリックをここで拾う（labelではなくdivに付与）
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  style={{
    border: "2px dashed #0070f3",
    borderRadius: 6,
    padding: 20,
    cursor: "pointer",
    color: dragActive ? "#005fcc" : "#0070f3",
    marginBottom: 24,
    userSelect: "none",
    width: "100%",
    boxSizing: "border-box",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
    textAlign: "center",
  }}
>
  {file ? file.name : "ここにPDFファイルをドラッグ＆ドロップ、またはクリックして選択"}
</div>
<label htmlFor="file-upload" style={{ display: "none" }}></label> 


      <input
        id="file-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      <button
        type="submit"
        style={{
          width: "100%",
          padding: 12,
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        論文を追加
      </button>
    </form>
  );
}
