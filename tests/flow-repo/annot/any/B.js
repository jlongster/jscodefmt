import A from "./A"

class B extends A {
  p: string; // OK, string ~> any
}
