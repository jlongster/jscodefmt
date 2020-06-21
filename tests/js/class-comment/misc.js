class x {
  focus() // comment 1
  {
    // comment 2
  }
}

class X {
  TEMPLATE =
    // tab index is needed so we can focus, which is needed for keyboard events
    '<div class="ag-large-text" tabindex="0">' +
    '<div class="ag-large-textarea"></div>' +
    '</div>';
}

export class SnapshotLogger {
  constructor(
    retentionPeriod: number = 5 * 60 * 1000, // retain past five minutes
    snapshotInterval: number = 30 * 1000, // snapshot no more than every 30s
  ) {
  }
}
