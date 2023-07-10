import { Utils } from "./utils";
import {DEFAULT_OPTIONS} from "./constants";

import { IEditor, InlineAttachmentSettings } from './types';

export class InlineAttachment {
  private settings: InlineAttachmentSettings
  private editor: IEditor
  private filenameTag: string
  private lastValue: string | null

  constructor(instance: IEditor, options: Partial<InlineAttachmentSettings>)
  {
    this.settings = Utils.merge(options, DEFAULT_OPTIONS as Partial<InlineAttachmentSettings>);
    this.editor = instance;
    this.filenameTag = '{filename}';
    this.lastValue = null;
  }

  /**
   * Uploads the blob
   *
   * @param  {Blob} file blob data received from event.dataTransfer object
   * @return {XMLHttpRequest} request object which sends the file
   */
  public uploadFile(file)
  {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();
    const settings = this.settings;

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

    let remoteFilename = "image-" + Date.now() + "." + extension;
    if (typeof settings.remoteFilename === 'function') {
      remoteFilename = settings.remoteFilename(file);
    }

    formData.append(settings.uploadFieldName, file, remoteFilename);

    // Append the extra parameters to the formdata
    if (typeof settings.extraParams === "object") {
      for (var key in settings.extraParams) {
        if (settings.extraParams.hasOwnProperty(key)) {
          formData.append(key, settings.extraParams[key]);
        }
      }
    }

    xhr.open('POST', settings.uploadUrl);

    // Add any available extra headers
    if (typeof settings.extraHeaders === "object") {
      for (var header in settings.extraHeaders) {
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
      var result = settings.beforeFileUpload(xhr);
      result !== false && xhr.send(formData);
    }

    return xhr;
  }

  /**
   * Returns if the given file is allowed to handle
   *
   * @param {File} file clipboard data file
   */
  public isFileAllowed(file): boolean
  {
    if (file.kind === 'string') {
      return false;
    }
    if (this.settings.allowedTypes.indexOf('*') === 0) {
      return true;
    } else {
      return this.settings.allowedTypes.indexOf(file.type) >= 0;
    }
  }

  /**
   * Handles upload response
   *
   * @param  {XMLHttpRequest} xhr
   * @return {void}
   */
  public onFileUploadResponse(xhr)
  {
    if (!this.settings.onFileUploadResponse) {
      return
    }

    if (!this.lastValue) {
      return;
    }

    if (this.settings.onFileUploadResponse.call(this, xhr) !== false) {
      var result = JSON.parse(xhr.responseText),
        filename = result[this.settings.jsonFieldName];

      if (result && filename) {
        var newValue;
        if (typeof this.settings.urlText === 'function') {
          newValue = this.settings.urlText.call(this, filename, result);
        } else {
          newValue = this.settings.urlText.replace(this.filenameTag, filename);
        }
        var text = this.editor.getValue().replace(this.lastValue, newValue);
        this.editor.setValue(text);
        this.settings.onFileUploaded && this.settings.onFileUploaded.call(this, filename);
      }
    }
  }


  /**
   * Called when a file has failed to upload
   *
   * @param  {XMLHttpRequest} xhr
   * @return {void}
   */
  public onFileUploadError(xhr)
  {
    if (!this.settings.onFileUploadError) {
      return;
    }

    if (!this.lastValue) {
      return;
    }

    if (this.settings.onFileUploadError.call(this, xhr) !== false) {
      const text = this.editor.getValue().replace(this.lastValue, this.settings.errorText);
      this.editor.setValue(text);
    }
  }

  /**
   * Called when a file has been inserted, either by drop or paste
   *
   * @param  {File} file
   * @return {void}
   */
  public onFileInserted(file)
  {
    if (!this.settings.onFileReceived) {
      return;
    }

    if (this.settings.onFileReceived.call(this, file) !== false) {
      this.lastValue = this.settings.progressText;
      this.editor.insertValue(this.lastValue);
    }
  }


  /**
   * Called when a paste event occured
   * @param  {Event} e
   * @return {Boolean} if the event was handled
   */
  public onPaste(e)
  {
    const clipboardData = e.clipboardData;
    let result = false;
    let items;

    if (typeof clipboardData === "object") {
      items = clipboardData.items || clipboardData.files || [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (this.isFileAllowed(item)) {
          result = true;
          this.onFileInserted(item.getAsFile());
          this.uploadFile(item.getAsFile());
        }
      }
    }

    if (result) {
      e.preventDefault();
    }

    return result;
  }

  /**
   * Called when a drop event occures
   * @param  {Event} e
   * @return {Boolean} if the event was handled
   */
  public onDrop(e)
  {
    let result = false;

    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i];

      if (this.isFileAllowed(file)) {
        result = true;
        this.onFileInserted(file);
        this.uploadFile(file);
      }
    }

    return result;
  }
}
