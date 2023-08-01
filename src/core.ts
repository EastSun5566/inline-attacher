import { DEFAULT_OPTIONS } from './constants';
import { Editor, InlineAttachmentOptions } from './types';
import { upload, isFunction, type Response } from './utils';

export class InlineAttachment<TInstance> {
  options: InlineAttachmentOptions = DEFAULT_OPTIONS;

  editor: Editor<TInstance>;

  filenameTag = '{filename}';

  lastValue = '';

  constructor(editor: Editor<TInstance>, options: Partial<InlineAttachmentOptions>) {
    this.editor = editor;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /** Uploads file */
  async uploadFile(file: File) {
    const {
      defaultExtension,
      remoteFilename,
      uploadFieldName,
      extraParams,
      extraHeaders,
      uploadUrl,
      uploadMethod,
      beforeFileUpload,
    } = this.options;

    const formData = new FormData();
    let extension = defaultExtension;

    // Attach the file.
    // If coming from clipboard, add a default filename (only works in Chrome for now)
    // http://stackoverflow.com/questions/6664967/how-to-give-a-blob-uploaded-as-formdata-a-file-name
    if (file.name) {
      const [fileNameMatched] = file.name.match(/\.(.+)$/) || [];
      if (fileNameMatched) extension = fileNameMatched;
    }

    const filename = remoteFilename?.(file) || `image-${Date.now()}.${extension}`;
    formData.append(uploadFieldName, file, filename);

    // Append the extra parameters to the formData
    Object.keys(extraParams).forEach((key) => {
      formData.append(key, extraParams[key]);
    });

    if (!beforeFileUpload?.(formData)) return;

    const { ok, value } = await upload({
      url: uploadUrl,
      method: uploadMethod,
      body: formData,
      headers: extraHeaders,
    });
    if (!ok) {
      this.onFileUploadError(value as Error);
      return;
    }

    this.onFileUploadSucceed(value as Response);
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
  public onFileUploadSucceed(response: Record<string, unknown>) {
    const { onFileUploadSucceed, urlText, responseUrlKey } = this.options;

    if (!onFileUploadSucceed?.(response)) return;
    if (!this.lastValue) return;

    const url = response[responseUrlKey] as string;
    if (!url) return;

    const newValue = isFunction(urlText)
      ? urlText(url, response)
      : urlText.replace(this.filenameTag, url);

    const text = this.editor.getValue().replace(this.lastValue, newValue);
    this.editor.setValue(text);

    this.options.onFileUploaded?.(url);
  }

  /**
   * Called when a file has failed to upload
   */
  public onFileUploadError(error: Error) {
    if (!this.options.onFileUploadError?.(error)) return;
    if (!this.lastValue) return;

    const text = this.editor.getValue().replace(this.lastValue, this.options.errorText);
    this.editor.setValue(text);
  }

  /**
   * Called when a file has been inserted, either by drop or paste
   */
  public onFileInserted(file: File) {
    if (!this.options.onFileReceived?.(file)) return;

    this.lastValue = this.options.progressText;
    this.editor.insertValue(this.lastValue);
  }

  handleFiles(files: FileList) {
    Array.from(files).forEach((file) => {
      if (!this.isFileAllowed(file)) return;

      this.onFileInserted(file);
      this.uploadFile(file);
    });
  }

  /**
   * Called when a paste event occurred
   */
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    if (!event.clipboardData?.files.length) return;

    this.handleFiles(event.clipboardData.files);
  }

  /**
   * Called when a drop event occurred
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer?.files.length) return;

    this.handleFiles(event.dataTransfer.files);
  }
}

export default InlineAttachment;
