// index.ts

// Express フレームワークをインポートします
import express from 'express';
// 生成した Prisma Client を './generated/prisma/client' からインポートします
import { PrismaClient } from './generated/prisma/client';

// PrismaClient のインスタンスを作成します
const prisma = new PrismaClient({
  // クエリが実行されたときに、実際に実行したSQLクエリをコンソールにログとして表示する設定
  log: ['query'],
});

// Express アプリケーションのインスタンスを作成します
const app = express();

// サーバーがリッスンするポート番号を定義します
// 環境変数 (process.env.PORT) が設定されていればそれを使用し、なければデフォルトで 8888 を使用します
const PORT = process.env.PORT || 8888;

// EJS をテンプレートエンジンとして設定します
// app.set('view engine', 'ejs'); は、ビューファイル（HTMLを生成するテンプレート）の拡張子を.ejsに設定します
app.set('view engine', 'ejs');
// app.set('views', './views'); は、ビューファイルが保存されているディレクトリを指定します
// この場合、プロジェクトルートの 'views' フォルダの中にテンプレートファイルがあると期待されます
app.set('views', './views');

// フォームから送信されるデータをExpressが正しく解析できるように設定します
// extended: true は、より複雑なオブジェクト形式のクエリ文字列も解析できることを意味します
app.use(express.urlencoded({ extended: true }));

// ルートパス (例: http://localhost:8888/) へのGETリクエストを処理するハンドラーです
app.get('/', async (req, res) => {
  // Prisma Client を使って、データベースから全てのユーザーを取得します
  const users = await prisma.user.findMany();
  // 'index.ejs' テンプレートをレンダリングし、取得したユーザーデータを 'users' 変数としてテンプレートに渡します
  // これにより、EJSテンプレート内でユーザー一覧を表示できます
  res.render('index', { users });
});

// '/users' パスへのPOSTリクエストを処理するハンドラーです
// これは、フォームから新しいユーザーデータが送信されたときに呼び出されます
app.post('/users', async (req, res) => {
  // フォームから送信されたデータの中から 'name' フィールドの値を取得します
  const name = req.body.name;
  // 'name' が存在する場合のみ、データベースに新しいユーザーを追加します
  if (name) {
    // Prisma Client の create() メソッドを使って、新しいユーザーをUserモデルに追加します
    const newUser = await prisma.user.create({
      data: { name }, // name フィールドに取得した名前を設定
    });
    console.log('新しいユーザーを追加しました:', newUser);
  }
  // ユーザー追加後、ルートパス ('/') にリダイレクトします
  // これにより、ブラウザが更新され、新しいユーザーが一覧に表示されるようになります
  res.redirect('/');
});

// Express サーバーを指定されたポートで起動します
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});