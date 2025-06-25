// Node.jsの標準ライブラリからhttpモジュールをインポートします
const http = require('node:http');
// Node.jsの標準ライブラリからurlモジュールをインポートします
// URLオブジェクトはグローバルに存在するため、通常はrequire('node:url')は不要ですが、
// パス解析などより詳細な機能を使う場合にインポートすることがあります。
// 今回はグローバルなURLオブジェクトを使用します。

// ポート番号を定義します
// 環境変数にPORTが設定されていればそれを使用し、なければ8888をデフォルト値として使います
const PORT = process.env.PORT || 8888;

// HTTPサーバーを作成します
// reqはリクエスト（クライアントからの要求）、resはレスポンス（サーバーからの応答）を表します
const server = http.createServer((req, res) => {
  // リクエストURLを解析します
  // グローバルなURLオブジェクトを使って、リクエストURLを構造化されたデータに変換します
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  // パス名（URLのドメイン以降の部分、例: / や /ask）を取得します
  const pathname = requestUrl.pathname;
  // クエリパラメータ（?以降の部分、例: ?q=my+question）を取得します
  const query = requestUrl.searchParams;

  // すべてのリクエストに対して、Content-Typeヘッダーを設定します
  // これにより、ブラウザにUTF-8エンコーディングのHTMLとして解釈するよう指示します
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // 各パスに応じた処理を分岐させます
  if (pathname === '/') {
    // ルートパス (http://localhost:8888/) にアクセスした場合の処理
    console.log('ルートパスへのアクセスがありました。');
    // ステータスコード200 (OK) を設定します
    res.writeHead(200);
    // レスポンスボディとして「こんにちは！」を送信し、通信を終了します
    res.end('こんにちは！');
  } else if (pathname === '/ask') {
    // /ask パス (http://localhost:8888/ask?q={質問}) にアクセスした場合の処理
    console.log('/askパスへのアクセスがありました。');
    // クエリパラメータ 'q' の値を取得します
    const question = query.get('q');
    // ステータスコード200 (OK) を設定します
    res.writeHead(200);
    // 取得した質問をレスポンスボディに含めて送信し、通信を終了します
    res.end(`Your question is '${question}'`);
  } else {
    // その他のパスにアクセスした場合の処理
    console.log('未定義のパスへのアクセスがありました。');
    // ステータスコード404 (Not Found) を設定します
    res.writeHead(404);
    // エラーメッセージを送信し、通信を終了します
    res.end('<h1>404 Not Found</h1>');
  }
});

// サーバーを指定されたポートでリッスン（待ち受け）させます
server.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
  console.log(`アクセス: http://localhost:${PORT}/`);
  console.log(`アクセス: http://localhost:${PORT}/ask?q=test`);
});