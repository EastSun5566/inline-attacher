import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { upload, isFunction, get } from '../utils';

describe('utils', () => {
  describe('upload', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should successfully upload and return response', async () => {
      const mockResponse = { url: 'https://example.com/image.png' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await upload({
        url: 'https://example.com/upload',
        method: 'POST',
      });

      expect(result.ok).toBe(true);
      expect(result.value).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/upload', {
        method: 'POST',
      });
    });

    it('should handle failed upload with non-ok response', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      const result = await upload({
        url: 'https://example.com/upload',
        method: 'POST',
      });

      expect(result.ok).toBe(false);
      expect(result.value).toBeInstanceOf(Error);
      expect((result.value as Error).message).toBe('Bad Request');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (global.fetch as any).mockRejectedValue(networkError);

      const result = await upload({
        url: 'https://example.com/upload',
        method: 'POST',
      });

      expect(result.ok).toBe(false);
      expect(result.value).toBe(networkError);
    });

    it('should pass additional options to fetch', async () => {
      const mockResponse = { url: 'test.png' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const formData = new FormData();
      formData.append('file', new File([], 'test.png'));

      await upload({
        url: 'https://example.com/upload',
        method: 'POST',
        body: formData,
        headers: { 'X-Custom-Header': 'value' },
      });

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/upload', {
        method: 'POST',
        body: formData,
        headers: { 'X-Custom-Header': 'value' },
      });
    });
  });

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(async () => {})).toBe(true);
      expect(isFunction(class Test {})).toBe(true);
    });

    it('should return false for non-functions', () => {
      expect(isFunction(null)).toBe(false);
      expect(isFunction(undefined)).toBe(false);
      expect(isFunction(123)).toBe(false);
      expect(isFunction('string')).toBe(false);
      expect(isFunction({})).toBe(false);
      expect(isFunction([])).toBe(false);
      expect(isFunction(true)).toBe(false);
    });
  });

  describe('get', () => {
    const testObject = {
      simple: 'value',
      nested: {
        deep: {
          value: 'found',
        },
        array: [1, 2, 3],
      },
      nullValue: null,
      zeroValue: 0,
      falseValue: false,
    };

    it('should get simple property', () => {
      expect(get(testObject, 'simple')).toBe('value');
    });

    it('should get nested property', () => {
      expect(get(testObject, 'nested.deep.value')).toBe('found');
    });

    it('should return default value for non-existent path', () => {
      expect(get(testObject, 'nonexistent')).toBe('');
      expect(get(testObject, 'nonexistent', 'default')).toBe('default');
    });

    it('should return default value for partial non-existent path', () => {
      expect(get(testObject, 'nested.nonexistent.value')).toBe('');
      expect(get(testObject, 'nested.nonexistent.value', 'default')).toBe('default');
    });

    it('should handle empty path', () => {
      // Empty path splits into [''], which iterates once with empty key
      // The implementation returns the default value for empty key
      expect(get(testObject, '')).toBe('');
    });

    it('should handle null values in path', () => {
      expect(get(testObject, 'nullValue.something')).toBe('');
    });

    it('should return falsy values correctly', () => {
      expect(get(testObject, 'zeroValue')).toBe(0);
      expect(get(testObject, 'falseValue')).toBe(false);
    });

    it('should return nested object', () => {
      const nested = get(testObject, 'nested.deep');
      expect(nested).toEqual({ value: 'found' });
    });

    it('should handle array in path', () => {
      expect(get(testObject, 'nested.array')).toEqual([1, 2, 3]);
    });
  });
});
