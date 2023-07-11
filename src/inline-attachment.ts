import { DEFAULT_OPTIONS } from './constants';

import { Editor, InlineAttachmentOptions } from './types';

export class InlineAttachment {
  private options: Partial<InlineAttachmentOptions> = DEFAULT_OPTIONS;

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
    const settings = this.options;

    let extension = settings.defaultExtension;

    if (typeof settings.setupFormData === 'function') {
      settings.setupFormData(formData, file);
    }

    // Attach the file. If coming from clipboard, add a default filename (only works in Chrome for now)
    // http://stackoverflow.com/questions/6664967/how-to-give-a-blob-uploaded-as-formdata-a-file-name
    if (file.name) {
      const fileNameMatches = file.name.match(/\.(.+)$/);
      if (fileNameMatches) {
        extension = fileNameMatches[1];
      }
    }

    let remoteFilename = `image-${Date.now()}.${extension}`;
    if (typeof settings.remoteFilename === 'function') {
      remoteFilename = settings.remoteFilename(file);
    }

    formData.append(settings.uploadFieldName, file, remoteFilename);

    // Append the extra parameters to the formdata
    if (typeof settings.extraParams === 'object') {
      for (const key in settings.extraParams) {
        if (settings.extraParams.hasOwnProperty(key)) {
          formData.append(key, settings.extraParams[key]);
        }
      }
    }

    xhr.open('POST', settings.uploadUrl);

    // Add any available extra headers
    if (typeof settings.extraHeaders === 'object') {
      for (const header in settings.extraHeaders) {
        if (settings.extraHeaders.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, settings.extraHeaders[header]);
        }
      }
    }

    xhr.onload = () => {
      // If HTTP status is OK or Created
      if (xhr.status === 200 || xhr.status === 201) {
        this.onFileUploadResponse(xhr);
      } else {
        this.onFileUploadError(xhr);
      }
    };

    if (settings.beforeFileUpload) {
      const result = settings.beforeFileUpload(xhr);
      result !== false && xhr.send(formData);
    }

    return xhr;
  }

  /**
   * Returns if the given file is allowed to handle
   */
  public isFileAllowed(file: File): boolean {
    if (file.kind === 'string') {
      return false;
    }
    if (this.options.allowedTypes.indexOf('*') === 0) {
      return true;
    }
    return this.options.allowedTypes.indexOf(file.type) >= 0;
  }

  /**
   * Handles upload response
   *
   * @param  {XMLHttpRequest} xhr
   * @return {void}
   */
  public onFileUploadResponse(xhr) {
    if (!this.options.onFileUploadResponse) {
      return;
    }

    if (!this.lastValue) {
      return;
    }

    if (this.options.onFileUploadResponse.call(this, xhr) !== false) {
      const result = JSON.parse(xhr.responseText);
      const filename = result[this.options.jsonFieldName];

      if (result && filename) {
        let newValue;
        if (typeof this.options.urlText === 'function') {
          newValue = this.options.urlText.call(this, filename, result);
        } else {
          newValue = this.options.urlText.replace(this.filenameTag, filename);
        }
        const text = this.editor.getValue().replace(this.lastValue, newValue);
        this.editor.setValue(text);
        this.options.onFileUploaded && this.options.onFileUploaded.call(this, filename);
      }
    }
  }

  /**
   * Called when a file has failed to upload
   *
   * @param  {XMLHttpRequest} xhr
   * @return {void}
   */
  public onFileUploadError(xhr) {
    if (!this.options.onFileUploadError) {
      return;
    }

    if (!this.lastValue) {
      return;
    }

    if (this.options.onFileUploadError.call(this, xhr) !== false) {
      const text = this.editor.getValue().replace(this.lastValue, this.options.errorText);
      this.editor.setValue(text);
    }
  }

  /**
   * Called when a file has been inserted, either by drop or paste
   *
   * @param  {File} file
   * @return {void}
   */
  public onFileInserted(file) {
    if (!this.options.onFileReceived) {
      return;
    }

    if (this.options.onFileReceived.call(this, file) !== false) {
      this.lastValue = this.options.progressText;
      this.editor.insertValue(this.lastValue);
    }
  }

  /**
   * Called when a paste event occurred
   */
  public onPaste(event: ClipboardEvent) {
    event.preventDefault();
    if (!event.clipboardData?.files.length) return false;

    let result = false;
    Array.from(event.clipboardData.files).forEach((file) => {
      if (this.isFileAllowed(file)) {
        result = true;

        this.onFileInserted(file);
        this.uploadFile(file);
      }
    });

    return result;
  }

  /**
   * Called when a drop event occurred
   */
  public onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer?.files.length) return false;

    let result = false;
    Array.from(event.dataTransfer.files).forEach((file) => {
      if (this.isFileAllowed(file)) {
        result = true;

        this.onFileInserted(file);
        this.uploadFile(file);
      }
    });

    return result;
  }
}

export default InlineAttachment;
