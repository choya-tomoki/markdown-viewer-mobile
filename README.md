# Markdown Viewer Mobile

[Markdown Viewer](https://github.com/choya-tomoki/markdown-viewer) のモバイル版です。
Android デバイスで **レンダリング済みの Markdown を直接表示・編集** できる WYSIWYG エディタアプリです。

![Expo](https://img.shields.io/badge/Expo-52-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## ダウンロード（Android）

### APK を直接インストール

1. Android スマートフォンで [**Releases ページ**](https://github.com/choya-tomoki/markdown-viewer-mobile/releases/latest) を開く
2. **`markdown-viewer-mobile-v*.apk`** をタップしてダウンロード
3. ダウンロード完了後、通知バーから APK をタップ
4. 「不明なアプリのインストール」を許可して、インストール

> **初回のみ**: 「提供元不明のアプリ」を許可する設定が必要です。
> 設定 → セキュリティ → 不明なアプリのインストール → Chrome（またはブラウザ）→ 許可

## 特徴

- **WYSIWYG 編集** — レンダリング済みの Markdown をそのまま編集。ソースコードを見る必要はありません
- **ファイルブラウザ** — ドロワーからフォルダを開いて `.md` ファイルを一覧表示
- **タブインターフェース** — 複数ファイルをタブで同時に開ける
- **ダーク / ライト / システムテーマ** — 3つのテーマモードから選択、設定は自動保存
- **フォントカスタマイズ** — フォント種類とサイズを自由に変更、プレビュー付き
- **書式ツールバー** — 太字、斜体、見出し、リスト、コード、引用など
- **GFM サポート** — テーブル、タスクリスト、取り消し線など GitHub Flavored Markdown に対応
- **オフライン動作** — ネットワーク不要、完全ローカルで動作
- **SAF 対応** — Android のスコープドストレージに対応、安全なファイルアクセス

## スクリーンショット

```
┌─────────────────────────────────┐
│ [=]                      [gear] │  <- ヘッダー（ドロワー / 設定）
├─────────────────────────────────┤
│ README.md | guide.md* |         │  <- タブバー（* = 未保存）
├─────────────────────────────────┤
│                                 │
│  # 見出し                       │
│                                 │
│  本文テキスト **太字** *斜体*   │
│                                 │
│  - リスト項目 1                 │
│  - リスト項目 2                 │
│                                 │
│  ```js                          │
│  const hello = "world";         │
│  ```                            │
│                                 │
├─────────────────────────────────┤
│ README.md | UTF-8 | 1,234 chars │  <- ステータスバー
├─────────────────────────────────┤
│ [B][I][H1][H2]["][<>][-][↩][↪] │  <- 書式ツールバー
└─────────────────────────────────┘
```

## 操作方法

| 操作 | 動作 |
|:---|:---|
| 左端からスワイプ | ファイルブラウザ（ドロワー）を開く |
| ハンバーガーアイコン `[=]` | ドロワーを開く |
| 歯車アイコン `[gear]` | 設定画面を開く |
| ファイルをタップ | タブでファイルを開く |
| タブをタップ | アクティブなタブを切り替え |
| タブの × ボタン | タブを閉じる |
| ツールバーのボタン | 書式を適用（太字、斜体など） |
| Android 戻るボタン | ドロワーを閉じる / 未保存時に確認ダイアログ |

## 設定

歯車アイコンから設定画面を開けます。

### テーマ
- **ライト** / **ダーク** / **システム** の 3 モードから選択

### フォント
- **フォント種類**: System Default、Noto Sans、Roboto、Serif、Monospace、Noto Sans JP、Roboto Slab
- **フォントサイズ**: 10px 〜 32px で調整可能
- リアルタイムプレビューで確認

設定は AsyncStorage に自動保存され、次回起動時も維持されます。

## 技術スタック

| レイヤー | 技術 |
|:---|:---|
| フレームワーク | Expo SDK 52 (React Native 0.76) |
| 言語 | TypeScript 5 (strict mode) |
| エディタ | @10play/tentap-editor (Tiptap / ProseMirror) |
| ナビゲーション | Expo Router + React Navigation |
| 状態管理 | Zustand 5 + AsyncStorage |
| ファイルシステム | expo-file-system (SAF 対応) |
| ファイル選択 | expo-document-picker |

### デスクトップ版との対応

| 機能 | デスクトップ (Electron) | モバイル (Expo) |
|:---|:---|:---|
| エディタ | Milkdown | TenTap (同じ ProseMirror 基盤) |
| ファイルツリー | react-arborist | FlatList ベース |
| ファイルアクセス | Node.js fs | expo-file-system + SAF |
| タブ D&D | @dnd-kit | スクロール式（D&D は Phase 3） |
| テーマ | CSS Variables | React Context + StyleSheet |
| ビルド | electron-forge | EAS Build |

## プロジェクト構造

```
src/
├── components/
│   ├── Editor/          # WYSIWYG エディタ (TenTap)
│   ├── FileTree/        # ファイルブラウザ
│   ├── TabBar/          # タブ管理
│   ├── SettingsPanel/   # 設定 UI コンポーネント
│   ├── StatusBar/       # ステータスバー
│   └── common/          # 共通コンポーネント (Toast)
├── stores/              # Zustand ストア
├── hooks/               # カスタムフック
├── services/            # ファイル操作サービス
├── themes/              # テーマ定義 (ライト / ダーク)
├── types/               # TypeScript 型定義
└── constants/           # 定数
app/
├── _layout.tsx          # ルートレイアウト
└── (drawer)/            # ドロワーナビゲーション
    ├── (editor)/        # エディタ画面
    └── settings.tsx     # 設定画面
```

## 開発

### 前提条件
- Node.js 18+
- npm 9+
- Android Studio（エミュレータ利用時）または Android デバイス

### セットアップ

```bash
git clone https://github.com/choya-tomoki/markdown-viewer-mobile.git
cd markdown-viewer-mobile
npm install
```

### 開発サーバー起動

```bash
npx expo start
```

Expo Go アプリまたは開発クライアントで接続してテストします。

### ビルド

```bash
# テスト用 APK
eas build --platform android --profile preview

# Play Store 用 AAB
eas build --platform android --profile production
```

## ライセンス

MIT
