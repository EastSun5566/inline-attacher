# 📎 Inline Attacher (WIP)

[![NPM Version](https://img.shields.io/npm/v/inline-attacher.svg?style=for-the-badge)](https://www.npmjs.com/package/inline-attacher)
[![NPM Downloads](https://img.shields.io/npm/dt/inline-attacher.svg?style=for-the-badge)](https://www.npmjs.com/package/inline-attacher)
[![License](https://img.shields.io/github/license/EastSun5566/inline-attacher.svg?style=for-the-badge)](https://github.com/EastSun5566/inline-attacher/blob/main/LICENSE)

> A modern port of [Inline Attachment](https://github.com/Rovak/InlineAttachment)

## Installation

```sh
npm i inline-attacher
```

## Usage

- Input / Textarea

  ```ts
  import { attach } from "inline-attacher";

  const textarea = document.querySelector("textarea");
  attach(textarea, { uploadUrl: "https://example.com/upload" });
  ```

- CodeMirror v6

  ```ts
  import { EditorView } from "codemirror";
  import { inlineAttachmentExtension } from "inline-attacher";

  const editor = new EditorView({
    extensions: [
      inlineAttachmentExtension({ uploadUrl: "https://example.com/upload" }),
    ],
    parent: document.body,
  });
  ```
