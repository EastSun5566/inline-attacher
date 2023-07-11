export interface InlineAttachmentOptions {
  uploadUrl: string
  uploadMethod: string
  uploadFieldName: string
  defaultExtension: string
  jsonFieldName: string
  allowedTypes: string[]
  progressText: string
  urlText: string | ((filename: string, result: string) => string)
  errorText: string
  extraParams: { [name: string]: any }
  extraHeaders: { [name: string]: any }
  beforeFileUpload?: (xhr: XMLHttpRequest) => boolean
  setupFormData?: (formData: FormData, file: File) => void
  remoteFilename?: (file: File) => string
  onFileReceived?: (file: File) => boolean
  onFileUploadResponse?: (xhr: XMLHttpRequest) => boolean
  onFileUploadError?: (xhr: XMLHttpRequest) => boolean
  onFileUploaded?: (filename: string) => void
}

export interface Editor {
  getValue(): string
  setValue(value: string): void
  insertValue(value: string): void
}
