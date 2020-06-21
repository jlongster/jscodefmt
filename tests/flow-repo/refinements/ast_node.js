type Node1 = {
  kind: 'Node1',
  prop1?: string
};

type Node2 = {
  kind: 'Node2',
  prop2?: string
}

export type ASTNode = Node1 | Node2;
