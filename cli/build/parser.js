"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
var fs_1 = __importDefault(require("fs"));
var tokenizer = __importStar(require("vscode-textmate"));
var oniguruma = __importStar(require("vscode-oniguruma"));
var path_1 = __importDefault(require("path"));
var luxon_1 = require("luxon");
var moduleFile = function (filepath) {
    return path_1.default.join(path_1.default.join(__dirname, "../node_modules"), filepath);
};
var wasmBin = fs_1.default.readFileSync(moduleFile("vscode-oniguruma/release/onig.wasm")).buffer;
var vscodeOnigurumaLib = oniguruma
    .loadWASM(wasmBin)
    .then(function () {
    return {
        createOnigScanner: function (patterns) {
            return new oniguruma.OnigScanner(patterns);
        },
        createOnigString: function (s) {
            return new oniguruma.OnigString(s);
        },
    };
});
var registry = new tokenizer.Registry({
    onigLib: vscodeOnigurumaLib,
    loadGrammar: function (scopeName) { return __awaiter(void 0, void 0, void 0, function () {
        var grammarFile, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(scopeName === "text.hours")) return [3 /*break*/, 2];
                    grammarFile = moduleFile("hours-lang/syntaxes/hours.tmLanguage.json");
                    return [4 /*yield*/, fs_1.default.promises.readFile(grammarFile)];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, tokenizer.parseRawGrammar(data.toString(), grammarFile)];
                case 2: return [2 /*return*/, Promise.resolve(null)];
            }
        });
    }); },
});
var Line = /** @class */ (function () {
    function Line(content, number) {
        this.content = content;
        this.number = number;
    }
    Line.prototype.tokenize = function (grammar, previousLineStack) {
        var _a = grammar.tokenizeLine(this.content, previousLineStack), tokens = _a.tokens, ruleStack = _a.ruleStack;
        return {
            lineStack: ruleStack,
            tokens: new LineTokens(this, tokens),
        };
    };
    Line.prototype.substring = function (token) {
        return this.content.substring(token.startIndex, token.endIndex);
    };
    Line.prototype.toString = function () {
        return this.number + ": " + this.content;
    };
    return Line;
}());
var LineTokens = /** @class */ (function () {
    function LineTokens(line, tokens) {
        this.line = line;
        this.tokens = tokens;
    }
    LineTokens.prototype.startsWithScope = function (scope) {
        return this.tokens.length !== 0 && this.tokens[0].scopes.includes(scope);
    };
    LineTokens.prototype.contentForToken = function (scope) {
        var token = this.tokens.find(function (token) { return token.scopes.includes(scope); });
        if (!token) {
            throw new Error("Scope " + scope + " not found in line " + this.line + ".");
        }
        return this.line.substring(token);
    };
    LineTokens.prototype.toPossibleEntry = function () {
        if (this.startsWithScope("comment.line")) {
            return {
                line: this.line,
                comment: this.line.substring(this.tokens[1]).trim(),
            };
        }
        else if (this.startsWithScope("keyword.control.date")) {
            return {
                line: this.line,
                date: luxon_1.DateTime.fromFormat(this.contentForToken("keyword.control.date"), "yyyy/MM/dd").toObject(),
                duration: parseFloat(this.contentForToken("variable.parameter.duration")),
                description: this.contentForToken("string.other.description"),
            };
        }
    };
    return LineTokens;
}());
var Parser = /** @class */ (function () {
    function Parser(grammar) {
        this.grammar = grammar;
    }
    Parser.prototype.parse = function (lines) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, lines.reduce(function (_a, line) {
                        var previousLineStack = _a.previousLineStack, entries = _a.entries;
                        var _b = line.tokenize(_this.grammar, previousLineStack), tokens = _b.tokens, lineStack = _b.lineStack;
                        var possibleEntry = tokens.toPossibleEntry();
                        return Object.assign({ previousLineStack: lineStack }, possibleEntry ? { entries: __spreadArrays(entries, [possibleEntry]) } : { entries: entries });
                    }, { previousLineStack: tokenizer.INITIAL, entries: [] }).entries];
            });
        });
    };
    Parser.prototype.parseContent = function (content) {
        return this.parse(content.split("\n").map(function (lineContent, i) { return new Line(lineContent, i); }));
    };
    Parser.prototype.parseFile = function (inputFile) {
        return __awaiter(this, void 0, void 0, function () {
            var content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.default.promises.readFile(inputFile, {
                            encoding: "utf-8",
                        })];
                    case 1:
                        content = _a.sent();
                        return [2 /*return*/, this.parseContent(content)];
                }
            });
        });
    };
    return Parser;
}());
exports.Parser = Parser;
function create() {
    return __awaiter(this, void 0, void 0, function () {
        var grammar;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, registry.loadGrammar("text.hours")];
                case 1:
                    grammar = _a.sent();
                    if (!grammar) {
                        throw new Error("Could not get a grammar for text.hours");
                    }
                    return [2 /*return*/, new Parser(grammar)];
            }
        });
    });
}
exports.default = create;
