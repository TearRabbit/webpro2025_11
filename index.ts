// index.ts

// 生成した Prisma Client を './generated/prisma/client' からインポートします
import { PrismaClient } from "./generated/prisma/client";

// PrismaClient のインスタンスを作成します
// これを使ってデータベース操作を行います
const prisma = new PrismaClient({
  // log: ['query'] を設定することで、実際に実行されたSQLクエリがコンソールに表示されるようになります
  log: ['query'],
});

// 非同期関数 main を定義します
async function main() {
  // Prisma Client が初期化されたことをコンソールに表示
  console.log("Prisma Client を初期化しました。");

  // ユーザーの一覧をデータベースから取得し、表示します（まだデータがないため空の配列のはず）
  const usersBefore = await prisma.user.findMany();
  console.log("Before ユーザー一覧:", usersBefore);

  // 新しいユーザーをデータベースに追加します
  // create() メソッドを使って、Userモデルに新しいレコードを挿入します
  const newUser = await prisma.user.create({
    data: {
      // name には、現在の日時を含む文字列を設定します
      name: `新しいユーザー ${new Date().toISOString()}`,
    },
  });
  console.log("新しいユーザーを追加しました:", newUser);

  // もう一度ユーザーの一覧をデータベースから取得し、表示します
  // 今度は新しいユーザーが追加されているはずです
  const usersAfter = await prisma.user.findMany();
  console.log("After ユーザー一覧:", usersAfter);
}

// main 関数を実行し、エラーがあればキャッチしてプロセスを終了します
main()
  .catch(e => {
    // エラーが発生した場合、エラーメッセージをコンソールに出力
    console.error(e);
    // プロセスをエラーコード1で終了
    process.exit(1);
  })
  .finally(async () => {
    // データベース接続を切断します
    // これにより、プロセスがクリーンに終了し、リソースが解放されます
    await prisma.$disconnect();
    console.log("Prisma Client を切断しました。");
  });