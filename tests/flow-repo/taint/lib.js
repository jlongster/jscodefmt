declare class FakeLocation {
  assign(url: string): void;
}

declare class FakeDocument {
  location: FakeLocation;
}

declare function doStuff(x: $Tainted<any>): void;

declare var fakeDocument: FakeDocument;
declare var fakeLocation: FakeLocation;
