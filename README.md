# Knowledge Hub

静かな青グレーの空気感と、軽いガラスモーフィズムで再構成したモバイル優先のナレッジ閲覧アプリです。記事データは `data.json` を読み込み、一覧、ジャンル、検索、お気に入り、記事ビューアをすべて静的ファイルだけで動かします。

## Files

```text
.
├── index.html
├── style.css
├── script.js
├── data.json
├── articles/
├── assets/
│   ├── icons/
│   └── images/
└── scripts/
```

## Local Preview

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

その後、`http://127.0.0.1:4173/` を開きます。

## GitHub Pages

1. GitHub の対象リポジトリを開く
2. `Settings` -> `Pages` を開く
3. `Build and deployment` の `Source` を `Deploy from a branch` にする
4. Branch を `main`、Folder を `/ (root)` に設定する
5. 保存後、数分待って公開URLを確認する

## Performance Notes

- React / Next.js / WebGL を使わず、HTML / CSS / Vanilla JavaScript のみ
- 背景は動画ではなく CSS グラデーションと軽量なクラウドレイヤーで構成
- `backdrop-filter` は主要パネルだけに限定
- SVG アイコンはインライン化して追加リクエストを抑制
- 記事一覧は `data.json` のみを取得し、フレームワークなしで描画
- アニメーションは opacity / transform 中心で 60fps を狙う

## Suggested Commit Message

```text
feat: redesign knowledge hub with atmospheric glass UI
```
