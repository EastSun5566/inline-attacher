import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import { InlineAttachment } from '../core';
import { Editor } from '../types';

describe('InlineAttachment', () => {
  let mockEditor: Editor<any>;

  beforeEach(() => {
    mockEditor = {
      instance: {},
      getValue: vi.fn(() => 'Current text'),
      setValue: vi.fn(),
      insertValue: vi.fn(),
    };
    global.fetch = vi.fn();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const attachment = new InlineAttachment(mockEditor, {});
      expect(attachment.editor).toBe(mockEditor);
      expect(attachment.options.uploadUrl).toBe('/upload');
      expect(attachment.options.uploadMethod).toBe('POST');
    });

    it('should merge custom options with defaults', () => {
      const attachment = new InlineAttachment(mockEditor, {
        uploadUrl: 'https://custom.com/upload',
        allowedTypes: ['image/jpeg'],
      });
      expect(attachment.options.uploadUrl).toBe('https://custom.com/upload');
      expect(attachment.options.allowedTypes).toEqual(['image/jpeg']);
      expect(attachment.options.uploadMethod).toBe('POST'); // default
    });
  });

  describe('isFileAllowed', () => {
    it('should allow file with matching type', () => {
      const attachment = new InlineAttachment(mockEditor, {
        allowedTypes: ['image/png', 'image/jpeg'],
      });
      const file = new File([], 'test.png', { type: 'image/png' });
      expect(attachment.isFileAllowed(file)).toBe(true);
    });

    it('should disallow file with non-matching type', () => {
      const attachment = new InlineAttachment(mockEditor, {
        allowedTypes: ['image/png', 'image/jpeg'],
      });
      const file = new File([], 'test.pdf', { type: 'application/pdf' });
      expect(attachment.isFileAllowed(file)).toBe(false);
    });

    it('should allow all files when * is in allowedTypes', () => {
      const attachment = new InlineAttachment(mockEditor, {
        allowedTypes: ['*'],
      });
      const file = new File([], 'test.pdf', { type: 'application/pdf' });
      expect(attachment.isFileAllowed(file)).toBe(true);
    });
  });

  describe('onFileInserted', () => {
    it('should call onFileReceived callback', () => {
      const onFileReceived = vi.fn(() => true);
      const attachment = new InlineAttachment(mockEditor, { onFileReceived });
      const file = new File([], 'test.png', { type: 'image/png' });

      attachment.onFileInserted(file);

      expect(onFileReceived).toHaveBeenCalledWith(file);
      expect(mockEditor.insertValue).toHaveBeenCalledWith('![Uploading file...]()');
    });

    it('should not insert value if onFileReceived returns false', () => {
      const onFileReceived = vi.fn(() => false);
      const attachment = new InlineAttachment(mockEditor, { onFileReceived });
      const file = new File([], 'test.png', { type: 'image/png' });

      attachment.onFileInserted(file);

      expect(onFileReceived).toHaveBeenCalledWith(file);
      expect(mockEditor.insertValue).not.toHaveBeenCalled();
    });

    it('should set lastValue to progressText', () => {
      const attachment = new InlineAttachment(mockEditor, {
        progressText: 'Uploading...',
      });
      const file = new File([], 'test.png', { type: 'image/png' });

      attachment.onFileInserted(file);

      expect(attachment.lastValue).toBe('Uploading...');
    });
  });

  describe('onFileUploadSucceed', () => {
    it('should replace progress text with url text', () => {
      const attachment = new InlineAttachment(mockEditor, {
        urlText: '![{alt}]({url})',
      });
      attachment.lastValue = '![Uploading file...]()';
      attachment.filename = 'test-image.png';
      (mockEditor.getValue as any).mockReturnValue('Some text ![Uploading file...]() more text');

      attachment.onFileUploadSucceed({ url: 'https://example.com/image.png' });

      expect(mockEditor.setValue).toHaveBeenCalledWith(
        'Some text ![test-image.png](https://example.com/image.png) more text',
      );
    });

    it('should handle custom urlText function', () => {
      const urlText = vi.fn((url: string) => `![Custom](${url})`);
      const attachment = new InlineAttachment(mockEditor, { urlText });
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('Text ![Uploading file...]()');

      attachment.onFileUploadSucceed({ url: 'https://example.com/image.png' });

      expect(urlText).toHaveBeenCalledWith('https://example.com/image.png', {
        url: 'https://example.com/image.png',
      });
      expect(mockEditor.setValue).toHaveBeenCalled();
    });

    it('should call onFileUploaded callback', () => {
      const onFileUploaded = vi.fn();
      const attachment = new InlineAttachment(mockEditor, { onFileUploaded });
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('![Uploading file...]()');

      attachment.onFileUploadSucceed({ url: 'https://example.com/image.png' });

      expect(onFileUploaded).toHaveBeenCalledWith('https://example.com/image.png');
    });

    it('should not update if onFileUploadSucceed callback returns false', () => {
      const onFileUploadSucceed = vi.fn(() => false);
      const attachment = new InlineAttachment(mockEditor, { onFileUploadSucceed });
      attachment.lastValue = '![Uploading file...]()';

      attachment.onFileUploadSucceed({ url: 'https://example.com/image.png' });

      expect(onFileUploadSucceed).toHaveBeenCalled();
      expect(mockEditor.setValue).not.toHaveBeenCalled();
    });

    it('should not update if lastValue is empty', () => {
      const attachment = new InlineAttachment(mockEditor, {});
      attachment.lastValue = '';

      attachment.onFileUploadSucceed({ url: 'https://example.com/image.png' });

      expect(mockEditor.setValue).not.toHaveBeenCalled();
    });

    it('should handle nested response URL key', () => {
      const attachment = new InlineAttachment(mockEditor, {
        responseUrlKey: 'data.url',
      });
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('![Uploading file...]()');

      attachment.onFileUploadSucceed({
        data: { url: 'https://example.com/image.png' },
      });

      expect(mockEditor.setValue).toHaveBeenCalled();
    });
  });

  describe('onFileUploadError', () => {
    it('should replace progress text with error text', () => {
      const attachment = new InlineAttachment(mockEditor, {
        errorText: 'Upload failed!',
      });
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('Text ![Uploading file...]() more');

      attachment.onFileUploadError(new Error('Network error'));

      expect(mockEditor.setValue).toHaveBeenCalledWith('Text Upload failed! more');
    });

    it('should call onFileUploadError callback', () => {
      const onFileUploadError = vi.fn(() => true);
      const attachment = new InlineAttachment(mockEditor, { onFileUploadError });
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('![Uploading file...]()');
      const error = new Error('Upload failed');

      attachment.onFileUploadError(error);

      expect(onFileUploadError).toHaveBeenCalledWith(error);
      expect(mockEditor.setValue).toHaveBeenCalled();
    });

    it('should not update if onFileUploadError callback returns false', () => {
      const onFileUploadError = vi.fn(() => false);
      const attachment = new InlineAttachment(mockEditor, { onFileUploadError });
      attachment.lastValue = '![Uploading file...]()';

      attachment.onFileUploadError(new Error('Upload failed'));

      expect(onFileUploadError).toHaveBeenCalled();
      expect(mockEditor.setValue).not.toHaveBeenCalled();
    });

    it('should not update if lastValue is empty', () => {
      const attachment = new InlineAttachment(mockEditor, {});
      attachment.lastValue = '';

      attachment.onFileUploadError(new Error('Upload failed'));

      expect(mockEditor.setValue).not.toHaveBeenCalled();
    });
  });

  describe('uploadFile', () => {
    it('should upload file with correct FormData', async () => {
      const mockResponse = { url: 'https://example.com/uploaded.png' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const attachment = new InlineAttachment(mockEditor, {
        uploadUrl: 'https://api.example.com/upload',
        uploadFieldName: 'image',
      });
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('![Uploading file...]()');

      const file = new File(['content'], 'test.png', { type: 'image/png' });
      await attachment.uploadFile(file);

      expect(global.fetch).toHaveBeenCalled();
      const [url, options] = (global.fetch as any).mock.calls[0];
      expect(url).toBe('https://api.example.com/upload');
      expect(options.method).toBe('POST');
      expect(options.body).toBeInstanceOf(FormData);
    });

    it('should set filename with timestamp when file has no name', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'test.png' }),
      });

      const attachment = new InlineAttachment(mockEditor, {});
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('![Uploading file...]()');

      const file = new File([], '', { type: 'image/png' });
      await attachment.uploadFile(file);

      expect(attachment.filename).toMatch(/^image-\d+\.png$/);
    });

    it('should use custom remoteFilename function', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'test.png' }),
      });

      const remoteFilename = vi.fn(() => 'custom-name.png');
      const attachment = new InlineAttachment(mockEditor, { remoteFilename });
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('![Uploading file...]()');

      const file = new File(['content'], 'test.png', { type: 'image/png' });
      await attachment.uploadFile(file);

      expect(remoteFilename).toHaveBeenCalledWith(file);
      expect(attachment.filename).toBe('custom-name.png');
    });

    it('should not upload if beforeFileUpload returns false', async () => {
      const beforeFileUpload = vi.fn(() => false);
      const attachment = new InlineAttachment(mockEditor, { beforeFileUpload });

      const file = new File(['content'], 'test.png', { type: 'image/png' });
      await attachment.uploadFile(file);

      expect(beforeFileUpload).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Server Error',
      });

      const attachment = new InlineAttachment(mockEditor, {});
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('![Uploading file...]()');
      const onFileUploadError = vi.spyOn(attachment, 'onFileUploadError');

      const file = new File(['content'], 'test.png', { type: 'image/png' });
      await attachment.uploadFile(file);

      expect(onFileUploadError).toHaveBeenCalled();
    });

    it('should append extra params to FormData', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'test.png' }),
      });

      const attachment = new InlineAttachment(mockEditor, {
        extraParams: { key: 'value', userId: '123' },
      });
      attachment.lastValue = '![Uploading file...]()';
      (mockEditor.getValue as any).mockReturnValue('![Uploading file...]()');

      const file = new File(['content'], 'test.png', { type: 'image/png' });
      await attachment.uploadFile(file);

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('handleFiles', () => {
    it('should process all allowed files', () => {
      const attachment = new InlineAttachment(mockEditor, {
        allowedTypes: ['image/png'],
      });
      const onFileInserted = vi.spyOn(attachment, 'onFileInserted');
      const uploadFile = vi.spyOn(attachment, 'uploadFile').mockResolvedValue(undefined);

      const files = [
        new File([], 'test1.png', { type: 'image/png' }),
        new File([], 'test2.png', { type: 'image/png' }),
      ] as any as FileList;

      attachment.handleFiles(files);

      expect(onFileInserted).toHaveBeenCalledTimes(2);
      expect(uploadFile).toHaveBeenCalledTimes(2);
    });

    it('should skip disallowed files', () => {
      const attachment = new InlineAttachment(mockEditor, {
        allowedTypes: ['image/png'],
      });
      const onFileInserted = vi.spyOn(attachment, 'onFileInserted');
      const uploadFile = vi.spyOn(attachment, 'uploadFile');

      const files = [
        new File([], 'test.png', { type: 'image/png' }),
        new File([], 'test.pdf', { type: 'application/pdf' }),
      ] as any as FileList;

      attachment.handleFiles(files);

      expect(onFileInserted).toHaveBeenCalledTimes(1);
      expect(uploadFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('onPaste', () => {
    it('should handle paste event with files', () => {
      const attachment = new InlineAttachment(mockEditor, {});
      const handleFiles = vi.spyOn(attachment, 'handleFiles');

      const files = [new File([], 'test.png', { type: 'image/png' })] as any as FileList;
      const event = {
        clipboardData: { files },
      } as ClipboardEvent;

      attachment.onPaste(event);

      expect(handleFiles).toHaveBeenCalledWith(files);
    });

    it('should ignore paste event without files', () => {
      const attachment = new InlineAttachment(mockEditor, {});
      const handleFiles = vi.spyOn(attachment, 'handleFiles');

      const event = {
        clipboardData: { files: [] as any as FileList },
      } as ClipboardEvent;

      attachment.onPaste(event);

      expect(handleFiles).not.toHaveBeenCalled();
    });

    it('should ignore paste event without clipboardData', () => {
      const attachment = new InlineAttachment(mockEditor, {});
      const handleFiles = vi.spyOn(attachment, 'handleFiles');

      const event = {} as ClipboardEvent;

      attachment.onPaste(event);

      expect(handleFiles).not.toHaveBeenCalled();
    });
  });

  describe('onDrop', () => {
    it('should handle drop event with files', () => {
      const attachment = new InlineAttachment(mockEditor, {});
      const handleFiles = vi.spyOn(attachment, 'handleFiles');

      const files = [new File([], 'test.png', { type: 'image/png' })] as any as FileList;
      const event = {
        dataTransfer: { files },
      } as DragEvent;

      attachment.onDrop(event);

      expect(handleFiles).toHaveBeenCalledWith(files);
    });

    it('should ignore drop event without files', () => {
      const attachment = new InlineAttachment(mockEditor, {});
      const handleFiles = vi.spyOn(attachment, 'handleFiles');

      const event = {
        dataTransfer: { files: [] as any as FileList },
      } as DragEvent;

      attachment.onDrop(event);

      expect(handleFiles).not.toHaveBeenCalled();
    });

    it('should ignore drop event without dataTransfer', () => {
      const attachment = new InlineAttachment(mockEditor, {});
      const handleFiles = vi.spyOn(attachment, 'handleFiles');

      const event = {} as DragEvent;

      attachment.onDrop(event);

      expect(handleFiles).not.toHaveBeenCalled();
    });
  });
});
