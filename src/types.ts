export interface InlineAttachmentOptions {
  uploadUrl: string
  uploadMethod: string
  uploadFieldName: string
  defaultExtension: string
  jsonFieldName: string
  allowedTypes: string[]
  progressText: string
  urlText: string | (() => string)
  errorText: string
  extraParams: { [name: string]: any }
  extraHeaders: { [name: string]: any }
  beforeFileUpload?: (xhr: XMLHttpRequest) => boolean
  setupFormData?: (formData: FormData, file: File) => void
  remoteFilename?: (file: File) => string
  onFileReceived?: () => boolean
  onFileUploadResponse?: () => boolean
  onFileUploadError?: () => boolean
  onFileUploaded?: () => void
}

export interface Editor {
  getValue(): string
  setValue(value: string): void
  insertValue(value: string): void
}
