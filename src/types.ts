export interface InlineAttachmentOptions {
  uploadUrl: string
  uploadMethod: string
  uploadFieldName: string
  defaultExtension: string
  responseUrlKey: string
  allowedTypes: string[]
  progressText: string
  urlText: string | ((filename: string, result: unknown) => string)
  errorText: string
  extraParams: { [name: string]: any }
  extraHeaders: { [name: string]: any }
  beforeFileUpload?: (formData: FormData) => boolean
  remoteFilename?: (file: File) => string
  onFileReceived?: (file: File) => boolean
  onFileUploadSucceed?: (response: Record<string, unknown>) => boolean
  onFileUploadError?: (error: Error) => boolean
  onFileUploaded?: (filename: string) => void
}

export interface Editor<TInstance> {
  instance: TInstance
  getValue(): string
  setValue(value: string): void
  insertValue(value: string): void
}
