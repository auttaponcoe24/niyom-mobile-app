import { File, Paths } from 'expo-file-system';

/** Small JSON files in the app's document folder (survive restarts, not backed by the server). */
function fileFor(name: string) {
  return new File(
    Paths.document,
    `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
  );
}

export function readJson<T>(name: string, fallback: T): T {
  try {
    const file = fileFor(name);
    if (!file.exists) return fallback;
    return JSON.parse(file.textSync()) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(name: string, value: unknown) {
  try {
    const file = fileFor(name);
    if (!file.exists) file.create();
    file.write(JSON.stringify(value));
  } catch {
    // Storage is a convenience layer — never break the screen over it.
  }
}

export function removeJson(name: string) {
  try {
    const file = fileFor(name);
    if (file.exists) file.delete();
  } catch {
    // Nothing to remove.
  }
}
