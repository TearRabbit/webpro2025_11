// pages/api/uploads.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// formidableの設定でbody parsingを無効にする
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "public", "papers");
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "ファイル処理中にエラーが発生しました" });
    }

    const pdf = files.pdf;
    if (!pdf) {
      return res.status(400).json({ message: "PDFファイルがありません" });
    }

    // formidableの型定義によってはファイルが配列になることもあるため型チェック
    const file = Array.isArray(pdf) ? pdf[0] : pdf;

    // ファイルの保存先はuploadDirなので、そのまま使えるパスをURL化
    const fileName = path.basename(file.filepath);
    const pdfUrl = `/papers/${fileName}`;

    res.status(200).json({ pdfUrl });
  });
}
