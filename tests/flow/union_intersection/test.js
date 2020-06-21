type T5 = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13";

type T6 = "a-long-string" | "another-long-string" | "yet-another-long-string" | "one-more-for-good-measure";

type T7 =
  { eventName: "these", a: number } |
  { eventName: "will", b: number } |
  { eventName: "not", c: number } |
  { eventName: "fit", d: number } |
  { eventName: "on", e: number } |
  { eventName: "one", f: number } |
  { eventName: "line", g: number };

type Comment = {
  type: 'CommentLine';
  _CommentLine: void;
  value: string;
  end: number;
  loc: {
    end: {column: number, line: number},
    start: {column: number, line: number},
  };
  start: number;
} | {
  type: 'CommentBlock';
  _CommentBlock: void;
  value: string;
  end: number;
  loc: {
    end: {column: number, line: number},
    start: {column: number, line: number},
  };
  start: number;
};

type Props = {
  onChange: (
    | {
        name: string
      }
    | {
        title: string
      }
    | {
        year: year
      }
  ) => void
};

declare class FormData {
  append(
    options?:
      | string
      | {
          filepath?: string,
          filename?: string
        }
  ): void;
}
