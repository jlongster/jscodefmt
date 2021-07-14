interface MyComponentProps {
  x: number
}

const MyComponent: React.VoidFunctionComponent<MyComponentProps> = ({ x }) => {
  const a = useA()
  return <div>x = {x}; a = {a}</div>
}

interface MyComponent2Props {
  x: number
  y: number
}

const MyComponent2: React.VoidFunctionComponent<MyComponent2Props> = ({ x, y }) => {
  const a = useA()
  return <div>x = {x}; y = {y}; a = {a}</div>
}

interface MyComponentWithLongNameProps {
  x: number
  y: number
  [key: string]: unknown
}

const MyComponentWithLongName1: React.VoidFunctionComponent<MyComponentWithLongNameProps> = ({ x, y }) => {
  const a = useA()
  return <div>x = {x}; y = {y}; a = {a}</div>
}

const MyComponentWithLongName2: React.VoidFunctionComponent<MyComponentWithLongNameProps> = ({ x, y, anotherPropWithLongName1, anotherPropWithLongName2, anotherPropWithLongName3, anotherPropWithLongName4 }) => {
  const a = useA()
  return <div>x = {x}; y = {y}; a = {a}</div>
}

interface MyGenericComponentProps<T> {
  x: T;
  y: T;
}

const MyGenericComponent: React.VoidFunctionComponent<MyGenericComponentProps<number>> = ({ x, y }) => {
  const a = useA()
  return <div>x = {x}; y = {y}; a = {a}</div>
}
