function formatEntireFile(
  fileVersion: FileVersion,
  range: atom$Range,
): Promise<?{
  newCursor?: number,
  formatted: string,
}> {}

function foo(): Promise<?boolean> {}
