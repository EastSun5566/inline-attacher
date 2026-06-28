import { DEFAULT_OPTIONS } from './constants';
import { Editor, InlineAttachmentOptions } from './types';
import {
  upload,
  isFunction,
  get,
  type Response,
} from './utils';

interface UploadPlaceholder {
  id: symbol
  text: string
}

function replaceOccurrence(text: string, searchValue: string, replaceValue: string, occurrenceIndex = 0) {
  let fromIndex = 0;

  for (let index = 0; index <= occurrenceIndex; index += 1) {
    const foundIndex = text.indexOf(searchValue, fromIndex);
    if (foundIndex === -1) return text;
    if (index === occurrenceIndex) {
      return text.slice(0, foundIndex) + replaceValue + text.slice(foundIndex + searchValue.length);
    }
    fromIndex = foundIndex + searchValue.length;
  }

  return text;
}

export class InlineAttachment<TInstance> {
  options = DEFAULT_OPTIONS;

  editor: Editor<TInstance>;

  filename = '';

  lastValue = '';

  private pendingPlaceholders: UploadPlaceholder[] = [];

  constructor(editor: Editor<TInstance>, options: Partial<InlineAttachmentOptions>) {
    this.editor = editor;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /** Uploads file */
  async uploadFile(file: File, placeholder?: string): Promise<void>;
  async uploadFile(file: File, placeholder?: UploadPlaceholder | string) {
    const {
      defaultExtension,
      remoteFilename,
      uploadFieldName,
      extraParams,
      extraHeaders,
      uploadUrl,
      uploadMethod,
      beforeFileUpload,
      uploadHandler,
    } = this.options;

    const formData = new FormData();
    const extension = defaultExtension.replace(/^\./, '');
    const filename = remoteFilename?.(file) || file.name || `image-${Date.now()}.${extension}`;
    this.filename = filename;
    formData.append(uploadFieldName, file, filename);

    // Append the extra parameters to the formData
    Object.keys(extraParams).forEach((key) => {
      formData.append(key, extraParams[key]);
    });

    if (!beforeFileUpload?.(formData)) return;

    if (uploadHandler) {
      try {
        const response = await uploadHandler({
          file,
          filename,
          formData,
          options: this.options,
        });
        this.onFileUploadSucceed(response, placeholder as string | undefined, filename);
      } catch (error) {
        this.onFileUploadError(
          error instanceof Error ? error : new Error(String(error)),
          placeholder as string | undefined,
        );
      }
      return;
    }

    const { ok, value } = await upload({
      url: uploadUrl,
      method: uploadMethod,
      body: formData,
      headers: extraHeaders,
    });
    if (!ok) {
      this.onFileUploadError(value as Error, placeholder as string | undefined);
      return;
    }

    this.onFileUploadSucceed(value as Response, placeholder as string | undefined, filename);
  }

  /**
   * Returns if the given file is allowed to handle
   */
  public isFileAllowed(file: File): boolean {
    const { allowedTypes } = this.options;
    return allowedTypes.includes('*') || allowedTypes.includes(file.type);
  }

  /**
   * Handles upload response
   */
  public onFileUploadSucceed(
    response: Record<string, unknown>,
    placeholder?: string,
    filename?: string,
  ): void;
  public onFileUploadSucceed(
    response: Record<string, unknown>,
    placeholder?: UploadPlaceholder | string,
    filename = this.filename,
  ) {
    const { onFileUploadSucceed, urlText, responseUrlKey } = this.options;

    if (!onFileUploadSucceed?.(response)) return;
    const placeholderText = typeof placeholder === 'string' ? placeholder : placeholder?.text || this.lastValue;
    if (!placeholderText) return;

    const url = (get(response, responseUrlKey) || 'unknown URL') as string;
    if (!url) return;

    const pattern = /!\[({[^}]+})]\(([^)]+)\)/;
    const newValue = isFunction(urlText)
      ? urlText(url, response)
      : urlText
        .replace(urlText.match(pattern)![1], filename)
        .replace(urlText.match(pattern)![2], url);

    const text = this.replacePlaceholder(placeholder, placeholderText, newValue);
    this.editor.setValue(text);

    this.options.onFileUploaded?.(url);
  }

  /**
   * Called when a file has failed to upload
   */
  public onFileUploadError(error: Error, placeholder?: string): void;
  public onFileUploadError(error: Error, placeholder?: UploadPlaceholder | string) {
    if (!this.options.onFileUploadError?.(error)) return;
    const placeholderText = typeof placeholder === 'string' ? placeholder : placeholder?.text || this.lastValue;
    if (!placeholderText) return;

    const text = this.replacePlaceholder(placeholder, placeholderText, this.options.errorText);
    this.editor.setValue(text);
  }

  /**
   * Called when a file has been inserted, either by drop or paste
   */
  public onFileInserted(file: File): string | false {
    const placeholder = this.insertFile(file);
    if (!placeholder) return false;
    return placeholder.text;
  }

  handleFiles(files: FileList) {
    Array.from(files).forEach((file) => {
      if (!this.isFileAllowed(file)) return;

      const pendingIndex = this.pendingPlaceholders.length;
      const placeholderText = this.onFileInserted(file);
      if (!placeholderText) return;

      const placeholder = this.pendingPlaceholders[pendingIndex];
      this.uploadFile(
        file,
        (placeholder?.text === placeholderText ? placeholder : placeholderText) as string,
      );
    });
  }

  private insertFile(file: File): UploadPlaceholder | false {
    if (!this.options.onFileReceived?.(file)) return false;

    const placeholder = {
      id: Symbol('inline-attacher-placeholder'),
      text: this.options.progressText,
    };
    this.pendingPlaceholders.push(placeholder);
    this.lastValue = placeholder.text;
    this.editor.insertValue(placeholder.text);

    return placeholder;
  }

  private replacePlaceholder(
    placeholder: UploadPlaceholder | string | undefined,
    placeholderText: string,
    newValue: string,
  ) {
    const currentText = this.editor.getValue();
    if (!placeholder || typeof placeholder === 'string') {
      return currentText.replace(placeholderText, newValue);
    }

    const placeholderIndex = this.pendingPlaceholders.findIndex(({ id }) => id === placeholder.id);
    if (placeholderIndex === -1) {
      return currentText.replace(placeholderText, newValue);
    }

    this.pendingPlaceholders.splice(placeholderIndex, 1);
    return replaceOccurrence(currentText, placeholderText, newValue, placeholderIndex);
  }

  /**
   * Called when a paste event occurred
   */
  onPaste(event: ClipboardEvent) {
    if (!event.clipboardData?.files.length) return;

    this.handleFiles(event.clipboardData.files);
  }

  /**
   * Called when a drop event occurred
   */
  onDrop(event: DragEvent) {
    if (!event.dataTransfer?.files.length) return;

    this.handleFiles(event.dataTransfer.files);
  }
}

export default InlineAttachment;
