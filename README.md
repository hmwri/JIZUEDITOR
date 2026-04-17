# JIZUEDITOR

## 日本語

JIZUEDITOR は、ストーリー創作支援システム「TaleShaper」関連の TypeScript 実装です。登場人物や鑑賞者の心の動きを時系列のエンベロープとして扱い、LLM を使って物語の展開を生成・編集することを目的としています。

参考: https://www.honma.site/ja/works/talesshaper/

### TaleShaper について

TaleShaper は、自信、好意、不安などの感情変化をエンベロープとして編集し、物語の展開を視覚的に形作る創作支援システムです。複数の登場人物間の関係性もエンベロープとして扱い、LLM による生成と組み合わせて物語を制御します。

### 構成

- `src/`: editor、UI、query、entry point などの TypeScript 実装
- `src/index.ts`: アプリケーションの起動処理
- `example/`: サンプルデータ
- `package.json`: npm scripts と依存関係
- `webpack.config.js`: webpack 設定
- `tsconfig.json`: TypeScript 設定

### セットアップ

```bash
npm install
```

### ビルド

開発ビルド:

```bash
npm test
```

本番ビルド:

```bash
npm run build
```

### エントリポイントの例

```ts
import { StoryEditor } from "./editor";
import { UIManager } from "./ui";

const ui = new UIManager();
const editor = new StoryEditor(ui, apikey);
editor.language = "ja";

ui.editor = editor;
ui.initialize();
await editor.generate("", true);
```

### 注意

API key はリポジトリにコミットしないでください。現在の実装は `sessionStorage` から API key を読む処理と、ローカルの `src/ignore/apikey` を参照する処理を含みます。

## English

JIZUEDITOR is a TypeScript implementation related to TaleShaper, a story creation system that uses editable emotional envelopes and LLM-based generation.

Reference: https://www.honma.site/ja/works/talesshaper/

### About TaleShaper

TaleShaper lets users shape stories by editing time-series envelopes such as confidence, affection, anxiety, and relationships between characters. These envelopes guide LLM-based story generation.

### Structure

- `src/`: TypeScript source for the editor, UI, query logic, and entry point
- `src/index.ts`: application startup
- `example/`: sample data
- `package.json`: npm scripts and dependencies
- `webpack.config.js`: webpack configuration
- `tsconfig.json`: TypeScript configuration

### Setup

```bash
npm install
```

### Build

```bash
npm test
npm run build
```

### Notes

Do not commit API keys. The current code can read an API key from `sessionStorage` and also references a local `src/ignore/apikey` module.
