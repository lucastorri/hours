import fs from "fs";
import * as tokenizer from "vscode-textmate";
import * as oniguruma from "vscode-oniguruma";
import path from "path";
import { DateTime, DateObject } from "luxon";

const moduleFile = (filepath: string): string =>
  path.join(path.join(__dirname, "../node_modules"), filepath);

const wasmBin = fs.readFileSync(
  moduleFile("vscode-oniguruma/release/onig.wasm")
).buffer;

const vscodeOnigurumaLib: Promise<tokenizer.IOnigLib> = oniguruma
  .loadWASM(wasmBin)
  .then<tokenizer.IOnigLib>(() => {
    return {
      createOnigScanner(patterns: string[]): tokenizer.OnigScanner {
        return <tokenizer.OnigScanner>new oniguruma.OnigScanner(patterns);
      },
      createOnigString(s: string): tokenizer.OnigString {
        return new oniguruma.OnigString(s);
      },
    };
  });

const registry = new tokenizer.Registry({
  onigLib: vscodeOnigurumaLib,
  loadGrammar: async (scopeName: string) => {
    if (scopeName === "text.hours") {
      const grammarFile = moduleFile(
        "hours-lang/syntaxes/hours.tmLanguage.json"
      );
      const data = await fs.promises.readFile(grammarFile);
      return tokenizer.parseRawGrammar(data.toString(), grammarFile);
    }
  },
});

class Line {
  readonly content: string;
  readonly number: number;
  constructor(content: string, number: number) {
    this.content = content;
    this.number = number;
  }

  tokenize(
    grammar: tokenizer.IGrammar,
    previousLineStack: tokenizer.StackElement
  ): { tokens: LineTokens; lineStack: tokenizer.StackElement } {
    const { tokens, ruleStack } = grammar.tokenizeLine(
      this.content,
      previousLineStack
    );

    return {
      lineStack: ruleStack,
      tokens: new LineTokens(this, tokens),
    };
  }

  substring(token: tokenizer.IToken): string {
    return this.content.substring(token.startIndex, token.endIndex);
  }

  toString(): string {
    return `${this.number}: ${this.content}`;
  }
}

class LineTokens {
  private line: Line;
  private tokens: tokenizer.IToken[];
  constructor(line: Line, tokens: tokenizer.IToken[]) {
    this.line = line;
    this.tokens = tokens;
  }

  startsWithScope(scope: string): boolean {
    return this.tokens.length !== 0 && this.tokens[0].scopes.includes(scope);
  }

  contentForToken(scope: string): string {
    const token = this.tokens.find((token) => token.scopes.includes(scope));
    if (!token) {
      throw new Error(`Scope ${scope} not found in line ${this.line}.`);
    }
    return this.line.substring(token);
  }

  toPossibleEntry(): PossibleEntry {
    if (this.startsWithScope("comment.line")) {
      return {
        line: this.line,
        comment: this.line.substring(this.tokens[1]).trim(),
      };
    } else if (this.startsWithScope("keyword.control.date")) {
      return {
        line: this.line,
        date: DateTime.fromFormat(
          this.contentForToken("keyword.control.date"),
          "yyyy/MM/dd"
        ).toObject(),
        duration: parseFloat(
          this.contentForToken("variable.parameter.duration")
        ),
        description: this.contentForToken("string.other.description"),
      };
    }
  }
}

type PossibleEntry = Entry | undefined;

export type Entry = { line: Line } & (
  | { comment: string }
  | { date: DateObject; duration: number; description: string }
);

export class Parser {
  private grammar: tokenizer.IGrammar;
  constructor(grammar: tokenizer.IGrammar) {
    this.grammar = grammar;
  }

  async parse(lines: Line[]): Promise<Entry[]> {
    type ReduceState = {
      previousLineStack: tokenizer.StackElement;
      entries: Entry[];
    };

    return lines.reduce<ReduceState>(
      ({ previousLineStack, entries }, line) => {
        const { tokens, lineStack } = line.tokenize(
          this.grammar,
          previousLineStack
        );

        const possibleEntry = tokens.toPossibleEntry();
        return Object.assign(
          { previousLineStack: lineStack },
          possibleEntry ? { entries: [...entries, possibleEntry] } : { entries }
        );
      },
      { previousLineStack: tokenizer.INITIAL, entries: [] }
    ).entries;
  }

  parseContent(content: string): Promise<Entry[]> {
    return this.parse(
      content.split("\n").map((lineContent, i) => new Line(lineContent, i))
    );
  }

  async parseFile(inputFile: string): Promise<Entry[]> {
    const content = await fs.promises.readFile(inputFile, {
      encoding: "utf-8",
    });
    return this.parseContent(content);
  }
}

export default async function create(): Promise<Parser> {
  const grammar = await registry.loadGrammar("text.hours");

  if (!grammar) {
    throw new Error("Could not get a grammar for text.hours");
  }

  return new Parser(grammar);
}
