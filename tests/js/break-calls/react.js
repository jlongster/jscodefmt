function helloWorld() {
  useEffect(() => {
    // do something
  }, [props.value])
  useEffect(() => {
    // do something
  }, [props.value, props.value, props.value, props.value, props.value, props.value, props.value, props.value, props.value, props.value, props.value])
}

function helloWorldWithReact() {
  React.useEffect(() => {
    // do something
  }, [props.value])
  React.useEffect(() => {
    // do something
  }, [props.value, props.value, props.value, props.value, props.value, props.value, props.value, props.value, props.value, props.value, props.value])
}

function MyComponent(props) {
  useEffect(
    () => {
      console.log("some code", props.foo);
    },

    // We need to disable the eslint warning here,
    // because of some complicated reason.
    // eslint-disable line react-hooks/exhaustive-deps
    []
  );

  return null;
}
