/**
 * @jsx JSX
 * @flow
 */

// This one for when there are no JSX attributes
declare function JSX<
  Children: $ReadOnlyArray<mixed>,
  Elem,
  C: (props: {}, children: Children) => Elem
>(
  component: C,
  props: null,
  ...children: Children
): Elem;

// This one for when there are JSX attributes.
declare function JSX<
  Children: $ReadOnlyArray<mixed>,
  Elem,
  Props: Object,
  C: (props: Props, children: Children) => Elem
>(
  component: C,
  props: Props,
  ...children: Children
): Elem;

declare function AcceptsWhatever(props: {} | null, children: any): string;
(<AcceptsWhatever />: number); // Error string ~> number
(<AcceptsWhatever name="hi">Text</AcceptsWhatever>: number); // Error string ~> number

declare function ExpectsProps(props: { name: string }, children: any): string;
(<ExpectsProps />); // Error - missing prop
(<ExpectsProps name="hi">Text</ExpectsProps>: number); // Error string ~> number

declare function ExpectsChildrenTuple(props: any, children: [string]): string;
(<ExpectsChildrenTuple />); // Error - mising child
(<ExpectsChildrenTuple>Hi</ExpectsChildrenTuple>); // No error
(<ExpectsChildrenTuple>{123}</ExpectsChildrenTuple>); // Error: number ~> string
(<ExpectsChildrenTuple>Hi {"there"}</ExpectsChildrenTuple>); // Error: too many children

declare function ExpectsChildrenArray(props: any, children: Array<string>): string;
(<ExpectsChildrenArray />); // No error - 0 children is fine
(<ExpectsChildrenArray>Hi</ExpectsChildrenArray>); // No error - 1 child is fine
(<ExpectsChildrenArray>{123}</ExpectsChildrenArray>); // Error: number ~> string
(<ExpectsChildrenArray>Hi {"there"}</ExpectsChildrenArray>); // No error - 2 children is fine
