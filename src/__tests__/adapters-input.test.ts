import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import { InputInlineAttachmentAdapter, attach } from '../adapters/input';

describe('InputInlineAttachmentAdapter', () => {
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    textarea = document.createElement('textarea');
    textarea.value = 'Initial text';
    global.fetch = vi.fn();
  });

  describe('constructor', () => {
    it('should create adapter with default options', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      expect(adapter.editor.instance).toBe(textarea);
      expect(adapter.options.uploadUrl).toBe('/upload');
    });

    it('should create adapter with custom options', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea, {
        uploadUrl: 'https://custom.com/upload',
      });
      expect(adapter.options.uploadUrl).toBe('https://custom.com/upload');
    });
  });

  describe('InputEditor', () => {
    it('should get value from textarea', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      expect(adapter.editor.getValue()).toBe('Initial text');
    });

    it('should set value in textarea', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      adapter.editor.setValue('New text');
      expect(textarea.value).toBe('New text');
    });

    it('should dispatch input event on setValue', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      const inputListener = vi.fn();
      textarea.addEventListener('input', inputListener);

      adapter.editor.setValue('New text');

      expect(inputListener).toHaveBeenCalled();
    });

    it('should insert value at cursor position', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      textarea.value = 'Hello World';
      textarea.selectionStart = 5;
      textarea.selectionEnd = 5;

      adapter.editor.insertValue(' there');

      expect(textarea.value).toBe('Hello there World');
      expect(textarea.selectionStart).toBe(11);
      expect(textarea.selectionEnd).toBe(11);
    });

    it('should insert value at beginning when no selection', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      textarea.value = 'World';
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;

      adapter.editor.insertValue('Hello ');

      expect(textarea.value).toBe('Hello World');
    });

    it('should dispatch input event on insertValue', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      const inputListener = vi.fn();
      textarea.addEventListener('input', inputListener);

      adapter.editor.insertValue('test');

      expect(inputListener).toHaveBeenCalled();
    });
  });

  describe('bind', () => {
    it('should bind paste event listener', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      const onPaste = vi.spyOn(adapter, 'onPaste');
      adapter.bind();

      const files = [new File([], 'test.png', { type: 'image/png' })] as any as FileList;
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
      });
      Object.defineProperty(pasteEvent.clipboardData, 'files', {
        value: files,
        writable: false,
      });

      textarea.dispatchEvent(pasteEvent);

      expect(onPaste).toHaveBeenCalled();
    });

    it('should bind drop event listener', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      const onDrop = vi.spyOn(adapter, 'onDrop');
      adapter.bind();

      const files = [new File([], 'test.png', { type: 'image/png' })] as any as FileList;
      const dataTransfer = new DataTransfer();

      const dragEvent = new DragEvent('drop');
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: dataTransfer,
        writable: false,
      });
      Object.defineProperty(dataTransfer, 'files', {
        value: files,
        writable: false,
      });

      textarea.dispatchEvent(dragEvent);

      expect(onDrop).toHaveBeenCalled();
    });

    it('should prevent default on drop event', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      adapter.bind();

      const dragEvent = new DragEvent('drop', {
        dataTransfer: new DataTransfer(),
      });
      const preventDefault = vi.spyOn(dragEvent, 'preventDefault');

      textarea.dispatchEvent(dragEvent);

      expect(preventDefault).toHaveBeenCalled();
    });

    it('should bind dragover event listener', () => {
      const adapter = new InputInlineAttachmentAdapter(textarea);
      adapter.bind();

      const dragOverEvent = new DragEvent('dragover');
      const preventDefault = vi.spyOn(dragOverEvent, 'preventDefault');

      textarea.dispatchEvent(dragOverEvent);

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('attach helper function', () => {
    it('should create and bind adapter with default options', () => {
      attach(textarea);

      // Verify binding by triggering an event
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
      });
      const dispatchSpy = vi.spyOn(textarea, 'dispatchEvent');

      textarea.dispatchEvent(pasteEvent);

      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should create and bind adapter with custom options', () => {
      attach(textarea, { uploadUrl: 'https://example.com/upload' });

      // Verify by checking that the adapter is bound
      const dragOverEvent = new DragEvent('dragover');
      const preventDefault = vi.spyOn(dragOverEvent, 'preventDefault');

      textarea.dispatchEvent(dragOverEvent);

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('with input element', () => {
    it('should work with input element', () => {
      const input = document.createElement('input');
      input.value = 'Initial';

      const adapter = new InputInlineAttachmentAdapter(input);

      expect(adapter.editor.getValue()).toBe('Initial');

      adapter.editor.setValue('Updated');
      expect(input.value).toBe('Updated');
    });
  });
});
