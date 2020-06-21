// @flow

let tests = [
  // scrollIntoView
  function(element: Element) {
    element.scrollIntoView();
    element.scrollIntoView(false);
    element.scrollIntoView({});
    element.scrollIntoView({ behavior: 'smooth', block: 'end' });
    element.scrollIntoView({ block: 'end' });
    element.scrollIntoView({ behavior: 'smooth' });

    // fails
    element.scrollIntoView({ behavior: 'invalid' });
    element.scrollIntoView({ block: 'invalid' });
    element.scrollIntoView(1);
  }
];
