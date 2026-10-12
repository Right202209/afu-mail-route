#!/bin/sh
# 把 docs/*.md 合成 docs/index.html（网页版文档）和 设计文档.pdf
cd "$(dirname "$0")"
pandoc title.md 01-游戏设计文档.md 02-故事线与攻略.md 03-剧本编写指南.md 04-部署指南.md 05-版本路线图.md -s --metadata lang=zh-CN -c doc.css -o index.html 2>/dev/null
