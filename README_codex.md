# Codex publish flow

`knowledge-hub` の記事追加は `scripts/publish_article.py` を使う。

基本例:

```bash
python3 scripts/publish_article.py /absolute/path/to/article.html \
  --genre ライフスタイル \
  --tags 睡眠,習慣 \
  --publish
```

動作:

- HTML を `articles/` にコピーする
- `data.json` の記事メタデータを追加または更新する
- `--publish` を付けた場合だけ、変更対象の HTML と `data.json` だけを `git add` して `commit` と `push` を行う

補足:

- `date.json` ではなく更新対象は `data.json`
- `--slug` を付けない場合は、入力 HTML のファイル名をもとに保存名を決める
- `--title` `--summary` `--read-time` を省略した場合は HTML から推定する
- `--dry-run` を使うと書き込みなしで登録内容だけ確認できる
