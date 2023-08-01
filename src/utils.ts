/* eslint-disable no-restricted-syntax */
interface UploadOptions extends RequestInit {
  url: string;
}

export type Response = Record<string, unknown>;
interface Result<TResponse = Response> {
  ok: boolean;
  value: TResponse | Error;
}

// eslint-disable-next-line import/prefer-default-export
export async function upload<TResponse = Response>({
  url,
  ...restOptions
}: UploadOptions): Promise<Result<TResponse>> {
  try {
    const response = await fetch(url, restOptions);
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return {
      ok: true,
      value: await response.json(),
    };
  } catch (error) {
    return {
      ok: false,
      value: error as Error,
    };
  }
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function get(object: Record<string, unknown>, path = '', defaultValue = '') {
  const keys = path.split('.');

  let value = object;
  for (const key of keys) {
    // Check if the current key exists in the current value
    if (value && typeof value === 'object' && key in value) {
      // Update the value to the nested property
      value = value[key] as Record<string, unknown>;
    } else {
      // If the key does not exist, return the default value
      return defaultValue;
    }
  }

  return value !== undefined ? value : defaultValue;
}
