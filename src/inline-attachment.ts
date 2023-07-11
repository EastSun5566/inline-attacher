import { DEFAULT_OPTIONS } from './constants';
import { Editor, InlineAttachmentOptions } from './types';

export class InlineAttachment {
  private options: InlineAttachmentOptions = DEFAULT_OPTIONS;

  private editor: Editor;

  private filenameTag = '{filename}';

  private lastValue = '';

  constructor(editor: Editor, options: Partial<InlineAttachmentOptions>) {
    this.editor = editor;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Uploads the blob
   *
   * @param  {Blob} file blob data received from event.dataTransfer object
   * @return {XMLHttpRequest} request object which sends the file
   */
  public uploadFile(file: File) {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();
    const {
      defaultExtension,
      setupFormData,
      remoteFilename,
      uploadFieldName,
      extraParams,
      extraHeaders,
      uploadUrl,
      beforeFileUpload,
    } = this.options;

    let extension = defaultExtension;
    setupFormData?.(formData, file);

    // Attach the file.
    // If coming from clipboard, add a default filename (only works in Chrome for now)
    // http://stackoverflow.com/questions/6664967/how-to-give-a-blob-uploaded-as-formdata-a-file-name
    if (file.name) {
      const [fileNameMatched] = file.name.match(/\.(.+)$/) || [];
      if (fileNameMatched) extension = fileNameMatched;
    }

    const filename = remoteFilename?.(file) || `image-${Date.now()}.${extension}`;
    formData.append(uploadFieldName, file, filename);

    // Append the extra parameters to the formdata
    Object.keys(extraParams).forEach((key) => {
      formData.append(key, extraParams[key]);
    });

    xhr.open('POST', uploadUrl);

    // Add any available extra headers
    Object.keys(extraHeaders).forEach((key) => {
      xhr.setRequestHeader(key, extraHeaders[key]);
    });

    xhr.onload = () => {
      // If HTTP status is OK or Created
      if (xhr.status === 200 || xhr.status === 201) {
        this.onFileUploadSucceed(xhr);
        return;
      }

      this.onFileUploadError(xhr);
    };

    if (beforeFileUpload?.(xhr)) xhr.send(formData);

    return xhr;
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
  public onFileUploadSucceed(xhr: XMLHttpRequest) {
    if (!this.options.onFileUploadResponse) {
      return;
    }

    if (!this.lastValue) {
      return;
    }

    if (this.options.onFileUploadResponse(xhr) !== false) {
      const result = JSON.parse(xhr.responseText);
      const filename = result[this.options.jsonFieldName];

      if (result && filename) {
        let newValue;
        if (typeof this.options.urlText === 'function') {
          newValue = this.options.urlText(filename, result);
        } else {
          newValue = this.options.urlText.replace(this.filenameTag, filename);
        }
        const text = this.editor.getValue().replace(this.lastValue, newValue);
        this.editor.setValue(text);
        this.options.onFileUploaded?.(filename);
      }
    }
  }

  /**
   * Called when a file has failed to upload
   */
  public onFileUploadError(xhr: XMLHttpRequest) {
    if (!this.options.onFileUploadError) {
      return;
    }

    if (!this.lastValue) {
      return;
    }

    if (this.options.onFileUploadError(xhr) !== false) {
      const text = this.editor.getValue().replace(this.lastValue, this.options.errorText);
      this.editor.setValue(text);
    }
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
