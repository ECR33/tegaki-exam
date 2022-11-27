# 漢字テスト作成

小学生の漢字テストを作成する仕組み
問題の作り方次第では手書きで回答させるあらゆる教科のテストを作成できる

__キーワード__

- 縦書き
- 手書き記入欄

## 解説

小学生の漢字テストは漢字を手書きで書く必要がある。手書きでのテストの練習を行うための仕組みを提供する。
手書きで回答するためにはメモ帳やワープロソフトで作成した電子データそのままでは使用できない。

- そのままでは
  - 手書き入力ができない
  - 漢字変換を使用されてしまう
:arrow_down:
- 手書き入力欄があるが、電子データで問題を管理できるツールとして準備

## 問題追加手順

1. 問題入手
  まずは小学生から問題を入手しよう。
2. csv編集
  既存のcsvをもとに問題を追加する。
  - static/questionis.csv
    問題を羅列したもの
  - static/test.csv
    問題用紙1ページ分の問題を定義するcsv
