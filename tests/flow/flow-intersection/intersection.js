type State = {
  sharedProperty: any;
} & (
  | { discriminant: "FOO"; foo: any }
  | { discriminant: "BAR"; bar: any }
  | { discriminant: "BAZ"; baz: any } 
);
