var React = require('react');

class C extends React.Component {
  props: { x: string };
}

let msg = "hello";

(<C x={msg}/>);

(<div id={msg}/>);
