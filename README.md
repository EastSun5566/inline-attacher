# 📎 Inline Attachment Next

[![NPM Version](https://img.shields.io/npm/v/inline-attachment-next.svg?style=for-the-badge)](https://www.npmjs.com/package/inline-attachment-next)
[![NPM Downloads](https://img.shields.io/npm/dt/inline-attachment-next.svg?style=for-the-badge)](https://www.npmjs.com/package/inline-attachment-next)
[![License](https://img.shields.io/github/license/EastSun5566/inline-attachment.svg?style=for-the-badge)](https://github.com/EastSun5566/inline-attachment/blob/main/LICENSE)

> A modern port of [Inline Attachment](https://github.com/Rovak/InlineAttachment)

## Installation

```sh
npm i inline-attachment-next
```

## Usage

- Input / Textarea

  ```ts
  import { attach } from "inline-attachment-next";

  const textarea = document.querySelector("textarea");
  attach(textarea, { uploadUrl: "https://example.com/upload" });
  ```

- CodeMirror v6

  ```ts
  import { EditorView } from "codemirror";
  import { inlineAttachmentExtension } from "inline-attachment-next";

  const editor = new EditorView({
    extensions: [
      inlineAttachmentExtension({ uploadUrl: "https://example.com/upload" }),
    ],
    parent: document.body,
  });
  ```
