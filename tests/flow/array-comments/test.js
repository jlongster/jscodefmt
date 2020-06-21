export type FileMetaData = [
  /* id */ string,
  /* mtime */ number,
  /* visited */ 0|1,
  /* dependencies */ Array<string>,
];

export type ModuleMetaData = [Path, /* type */ number];
