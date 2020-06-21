declare var $React: $Exports<'react'>; // fake import
// Strawman: revised definition of $jsx (alternatively, React.Element).
// Using bounded poly to specify a constraint on a type parameter, and
// existentials to elide type arguments.
type _ReactElement<DefaultProps, Props, Config: $Diff<Props, DefaultProps>, C: $React.Component<DefaultProps, Props, any>> = $React.Element<Config>;
type $jsx<C> = _ReactElement<*, *, *, C>;
