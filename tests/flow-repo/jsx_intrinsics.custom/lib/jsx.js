declare var $React: $Exports<'react'>; // fake import
type $JSXIntrinsic<T> = Class<$React.Component<void,T,mixed>>;

type $JSXIntrinsics = {
  div: $JSXIntrinsic<{id: string}>,
  span: $JSXIntrinsic<{id: string, class: string}>,
};
