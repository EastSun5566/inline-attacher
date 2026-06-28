export interface UploadHandlerContext {
  file: File
  filename: string
  formData: FormData
  options: InlineAttachmentOptions
}

export interface InlineAttachmentOptions {
  uploadUrl: string
  uploadMethod: string
  uploadFieldName: string
  defaultExtension: string
  responseUrlKey: string
  allowedTypes: string[]
  progressText: string
  urlText: string | ((url: string, result: unknown) => string)
  errorText: string
  extraParams: { [name: string]: any }
  extraHeaders: { [name: string]: any }
  beforeFileUpload?: (formData: FormData) => boolean
  uploadHandler?: (
    context: UploadHandlerContext,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>
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
