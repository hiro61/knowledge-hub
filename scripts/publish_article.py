#!/usr/bin/env python3
"""
Usage:
  python3 scripts/publish_article.py /path/to/article.html --genre ライフスタイル --tags 睡眠,習慣 --publish

Copies an HTML article into articles/, upserts its metadata in data.json,
and can optionally commit and push only the changed article + data.json.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import date
from html import unescape
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "data.json"
ARTICLES_DIR = REPO_ROOT / "articles"


@dataclass
class ArticleDraft:
    title: str
    summary: str
    read_time: int
    body_text: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Publish an HTML article into knowledge-hub.")
    parser.add_argument("source_html", help="Path to the source HTML file.")
    parser.add_argument("--slug", help="Output filename without extension. Defaults to a sanitized source filename.")
    parser.add_argument("--title", help="Override article title.")
    parser.add_argument("--genre", default="ライフスタイル", help="Article genre. Default: ライフスタイル")
    parser.add_argument("--date", default=str(date.today()), help="Publish date in YYYY-MM-DD. Default: today.")
    parser.add_argument("--summary", help="Override article summary.")
    parser.add_argument("--tags", default="", help="Comma-separated tags.")
    parser.add_argument("--read-time", type=int, help="Override read time in minutes.")
    parser.add_argument("--commit-message", help="Custom git commit message.")
    parser.add_argument("--publish", action="store_true", help="Run git add/commit/push after updating files.")
    parser.add_argument("--dry-run", action="store_true", help="Print the resolved article payload without writing files.")
    return parser.parse_args()


def read_html(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def compact_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", unescape(text)).strip()


def first_match(patterns: list[str], text: str) -> str | None:
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
        if match:
            return compact_whitespace(match.group(1))
    return None


def strip_tags(html: str) -> str:
    without_blocks = re.sub(r"<(script|style)\b.*?</\1>", " ", html, flags=re.IGNORECASE | re.DOTALL)
    without_tags = re.sub(r"<[^>]+>", " ", without_blocks)
    return compact_whitespace(without_tags)


def estimate_read_time(text: str) -> int:
    chars = len(text)
    return max(1, math.ceil(chars / 800))


def extract_draft(html: str) -> ArticleDraft:
    title = first_match(
        [
            r"<title>(.*?)</title>",
            r"<h1[^>]*>(.*?)</h1>",
        ],
        html,
    )
    if not title:
        raise ValueError("Could not extract a title from the HTML. Pass --title explicitly.")

    summary = first_match(
        [
            r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
            r'<p[^>]*class=["\'][^"\']*doc-subtitle[^"\']*["\'][^>]*>(.*?)</p>',
            r"<p[^>]*>(.*?)</p>",
        ],
        html,
    )
    body_text = strip_tags(html)
    if not summary:
        summary = body_text[:140].rstrip("。") + "。"

    return ArticleDraft(
        title=title,
        summary=summary,
        read_time=estimate_read_time(body_text),
        body_text=body_text,
    )


def sanitize_slug(value: str) -> str:
    cleaned = value.strip().lower()
    cleaned = re.sub(r"\.html?$", "", cleaned)
    cleaned = re.sub(r"[^a-z0-9_-]+", "_", cleaned)
    cleaned = re.sub(r"_+", "_", cleaned).strip("_")
    if not cleaned:
        cleaned = f"article_{date.today().strftime('%Y%m%d')}"
    return cleaned


def load_data() -> dict:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def save_data(payload: dict) -> None:
    DATA_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_article_payload(args: argparse.Namespace, draft: ArticleDraft, target_file: str) -> dict:
    tags = [tag.strip() for tag in args.tags.split(",") if tag.strip()]
    return {
        "title": args.title or draft.title,
        "genre": args.genre,
        "date": args.date,
        "summary": args.summary or draft.summary,
        "tags": tags,
        "readTime": args.read_time or draft.read_time,
        "file": target_file,
    }


def upsert_article(data: dict, article_payload: dict) -> tuple[dict, bool]:
    articles = data.setdefault("articles", [])
    existing = next((item for item in articles if item.get("file") == article_payload["file"]), None)
    if existing:
        preserved_id = existing["id"]
        existing.clear()
        existing.update({"id": preserved_id, **article_payload})
        return existing, False

    next_id = max((item.get("id", 0) for item in articles), default=0) + 1
    new_article = {"id": next_id, **article_payload}
    articles.append(new_article)
    return new_article, True


def run_git(args: list[str]) -> None:
    subprocess.run(args, cwd=REPO_ROOT, check=True)


def publish_changes(article_file: str, title: str, custom_message: str | None) -> None:
    commit_message = custom_message or f"Publish article: {title}"
    run_git(["git", "add", "data.json", article_file])
    run_git(["git", "commit", "-m", commit_message])
    run_git(["git", "push", "origin", "main"])


def main() -> int:
    args = parse_args()
    source_path = Path(args.source_html).expanduser().resolve()
    if not source_path.exists():
        raise FileNotFoundError(f"Source HTML not found: {source_path}")

    html = read_html(source_path)
    draft = extract_draft(html)
    slug = sanitize_slug(args.slug or source_path.stem)
    target_rel_path = f"articles/{slug}.html"
    target_abs_path = ARTICLES_DIR / f"{slug}.html"
    article_payload = build_article_payload(args, draft, target_rel_path)

    if args.dry_run:
        print(json.dumps(article_payload, ensure_ascii=False, indent=2))
        return 0

    ARTICLES_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source_path, target_abs_path)

    data = load_data()
    saved_article, created = upsert_article(data, article_payload)
    save_data(data)

    action = "Created" if created else "Updated"
    print(f"{action} metadata for {saved_article['title']}")
    print(f"HTML copied to {target_rel_path}")

    if args.publish:
        publish_changes(target_rel_path, saved_article["title"], args.commit_message)
        print("Committed and pushed to origin/main")

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1)
