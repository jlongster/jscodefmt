import React from "react";

type NoFun = mixed => empty;

// error: mixed ~> ReactPropsCheckType
// error: ReactPropsChainableTypeChecker ~> empty
(React.PropTypes.arrayOf : NoFun);

// OK: mixed ~> any
// error: ReactPropsChainableTypeChecker ~> empty
(React.PropTypes.instanceOf : NoFun);

// error: mixed ~> ReactPropsCheckType
// error: ReactPropsChainableTypeChecker ~> empty
(React.PropTypes.objectOf : NoFun);

// error: mixed ~> Array<any>
// error: ReactPropsChainableTypeChecker ~> empty
(React.PropTypes.oneOf : NoFun);

// error: mixed ~> Array<ReactPropsCheckType>
// error: ReactPropsChainableTypeChecker ~> empty
(React.PropTypes.oneOfType : NoFun);

// error: mixed ~> object type
// error: ReactPropsChainableTypeChecker ~> empty
(React.PropTypes.shape : NoFun);
