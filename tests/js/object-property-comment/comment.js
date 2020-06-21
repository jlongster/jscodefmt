o = {
  name:
    // Comment A
    // Comment B
    (({id: type}: any): CreativeConcept),
};

o = {
  name: // Comment A
  // Comment B
  (({ id: type }: any): CreativeConcept)
};

o = {
  name: // Comment B // Comment A
  (({ id: type }: any): CreativeConcept)
};
