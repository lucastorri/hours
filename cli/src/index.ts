import fs from "fs";
import * as tokenizer from "vscode-textmate";
import * as oniguruma from "vscode-oniguruma";
import path from "path";

const projectDir = path.join(__dirname, "..");

const wasmBin = fs.readFileSync(
  path.join(projectDir, "node_modules/vscode-oniguruma/release/onig.wasm")
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
      const grammarFile = path.join(
        projectDir,
        "../hours-lang/syntaxes/hours.tmLanguage.json"
      );
      const data = await fs.promises.readFile(grammarFile);
      return tokenizer.parseRawGrammar(data.toString(), grammarFile);
    }
    return Promise.resolve(null);
  },
});

registry.loadGrammar("text.hours").then(
  (grammar) => {
    grammar &&
      fs
        .readFileSync("/Users/lucastorri/Downloads/Untitled-1.hours")
        .toString()
        .split("\n")
        .reduce(
          ({ previousRuleStack, entries }, line) => {
            console.info(`Tokenizing line: ${line}`);
            const { ruleStack, tokens } = grammar.tokenizeLine(
              line,
              previousRuleStack
            );
            tokens
              .filter((token) => token.scopes.length > 1)
              .forEach((token) => {
                console.info(
                  ` - ${token.startIndex}-${token.endIndex} (${line.substring(
                    token.startIndex,
                    token.endIndex
                  )}) with scopes ${token.scopes.join(", ")}`
                );
              });
            return { previousRuleStack: ruleStack, entries };
          },
          { previousRuleStack: tokenizer.INITIAL, entries: [] }
        );
  },
  (error) => {
    console.error("gah", error);
  }
);
