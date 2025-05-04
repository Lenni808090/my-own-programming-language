import {
  Stmt,
  Program,
  Expr,
  BinaryExpr,
  NumericLiteral,
  Identifier,
  VarDeclaration,
  AssignmentExpr
} from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }
  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }


  // deno-lint-ignore no-explicit-any
  private expect (type: TokenType, err: any){
    const prev = this.tokens.shift() as Token;
    if(!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
      Deno.exit(1);
    }

    return prev;
  }
  public produceAsT(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  private parse_stmt(): Stmt {
    switch(this.at().type){
      case TokenType.Let:
        return this.parse_var_declaration();
      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parse_expr();
    }

  }

  private parse_var_declaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;

    const identifier = this.expect(
      TokenType.Identifier, 
      "Expected identifier name folowing let | const keyword.",
    ).value;

    if (this.at().type == TokenType.Semikolon){
      this.eat();
      if(isConstant){
        throw "Must assign value to constant expression: No Value provided.";
      }

      return { kind: "VarDeclaration", identifier: identifier, constant: isConstant, value: undefined } as VarDeclaration;
    }

    this.expect(TokenType.Equals,
      "Expected equals token following identifier in var declaration."
    );
    const declaration = { kind: "VarDeclaration", value: this.parse_expr(), constant: isConstant, identifier: identifier} as VarDeclaration;
    this.expect(TokenType.Semikolon, "Variable declaration must end with semicolon")

    return declaration;
  }


  private parse_expr(): Expr {
    return this.parse_assignment_expr()
  }


  private parse_assignment_expr(): Expr {
    const left = this.parse_additive_expr();

    if(this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parse_assignment_expr();
      return { value, assigne: left, kind: "AssignmentExpr"} as AssignmentExpr;
    }

    return left;
  }

  //Orders of Presidence 
  //Assigment
  //Member
  //FunctionCall
  //Logitive
  //Comparision
  //Additive
  //Muliplicit
  //UnaryExpr
  //Primary
 // (10 - 5) - 5
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();

    while(this.at().value == "+" || this.at().value == "-"){
      const operator = this.eat().value;
      const right = this.parse_multiplicitave_expr()
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }


    return left;
  }

  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_primary_expr();

    while(this.at().value == "/" || this.at().value == "*" || this.at().value == "%"){
      const operator = this.eat().value;
      const right = this.parse_primary_expr()
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }


    return left;
  }


  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      case TokenType.OpenParen:{
        this.eat();
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesised expression. Expected closind parenthesis",
        );
        return value;
      }
      default:
        console.error("unexpected token foujnd duringt parsing", this.at());
        Deno.exit(1);
    }
  }
}
