# 📎 Inline Attachment Next

> A modern port from [Inline Attachment](https://github.com/Rovak/InlineAttachment)

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
