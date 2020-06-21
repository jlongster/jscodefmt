const sep = /[/\\]/;

export function extname(path) {
  const filename = basename(path);
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) {
    return "";
  }
  return filename.slice(dotIndex);
}

export function basename(path) {
  return path.split(sep).pop();
}

export function isAbsolute() {
  return true;
}
