const Component = branch/*::     <Props, ExternalProps> */(
  ({ src }) => !src,
  // $FlowFixMe
  renderNothing,
)(BaseComponent);

const C = b/*:: <A> */(foo) + c/*:: <B> */(bar);

foo/*::<bar>*/(baz);

foo/*::<bar>*/();
