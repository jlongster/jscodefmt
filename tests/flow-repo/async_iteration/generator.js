declare interface File {
  readLine(): Promise<string>;
  close(): void;
  EOF: boolean;
}

declare function fileOpen(path: string): Promise<File>;

async function* readLines(path) {
  let file: File = await fileOpen(path);

  try {
    while (!file.EOF) {
      yield await file.readLine();
    }
  } finally {
    file.close();
  }
}

async function f() {
  for await (const line of readLines("/path/to/file")) {
    (line: void); // error: string ~> void
  }
}
