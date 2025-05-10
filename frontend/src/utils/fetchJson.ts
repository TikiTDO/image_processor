export async function fetchJson<T>(url: string, defaultValue: T, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error(`Non-OK response (${response.status}) from ${url}`);
      return defaultValue;
    }
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Error fetching JSON from ${url}:`, error);
    return defaultValue;
  }
}