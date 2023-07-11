import { InlineAttachmentOptions } from './types';

export class Utils {
  /**
   * Simple function to merge the given objects
   *
   * @returns {Object}
   */
  static merge(...objects: Partial<InlineAttachmentOptions>[]): InlineAttachmentOptions {
    const result = {};

    // eslint-disable-next-line no-plusplus
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      // eslint-disable-next-line no-restricted-syntax
      for (const k in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(k)) {
          // @ts-ignore
          result[k] = obj[k];
        }
      }
    }

    return (result as any);
  }

  /**
   * @param str
   * @returns {string} Returns the string with the first letter as lowercase
   */
  static lcfirst(str: string): string {
    return str.charAt(0).toLowerCase() + str.substr(1);
  }

  /**
   * Append a line of text at the bottom, ensuring there aren't unnecessary newlines
   *
   * @param {String} appended Current content
   * @param {String} previous Value which should be appended after the current content
   */
  static appendInItsOwnLine(previous: string, appended: string) {
    return (`${previous}\n\n[[D]]${appended}`)
      .replace(/(\n{2,})\[\[D\]\]/, '\n\n')
      .replace(/^(\n*)/, '');
  }
}

export default Utils;
