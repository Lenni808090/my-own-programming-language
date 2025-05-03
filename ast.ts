export type NodeType =
  | "Programm"
  | "NumericLiteral"
  | "Identifier"
  | "BinaryExpression";


  export interface Stmt {
    kind: NodeType;
  }

  export interface Programm extends Stmt {
    kind: "Programm";
    body: Stmt[];
  }