// Local rule-based knowledge base: common errors per language.
// Each rule: pattern (tested against code or error output), title, cause, explanation, fix steps.
export type Severity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface Rule {
  pattern: RegExp;
  title: string;
  severity: Severity;
  cause: string;
  explanation: string;
  fix: string[];
}

export const LANGUAGES = [
  "Python", "C", "C++", "Java", "JavaScript", "TypeScript",
  "Go", "Rust", "Bash", "PHP", "Ruby", "SQL",
] as const;
export type Language = (typeof LANGUAGES)[number];

type R = [RegExp, string, Severity, string, string, string];
const mk = (rows: R[]): Rule[] =>
  rows.map(([pattern, title, severity, cause, explanation, fix]) => ({
    pattern, title, severity, cause, explanation, fix: fix.split(" | "),
  }));

export const RULES: Record<Language, Rule[]> = {
  Python: mk([
    [/IndentationError|unexpected indent|expected an indented block/, "IndentationError", "ERROR", "Inconsistent indentation", "Python uses indentation to define blocks; mixed or missing indentation breaks parsing.", "Use 4 spaces consistently | Do not mix tabs and spaces | Indent the body of every block"],
    [/NameError|is not defined/, "NameError", "ERROR", "Undefined variable or function", "A name is used before it is assigned or imported.", "Check spelling | Define or import the name before use"],
    [/TypeError: can only concatenate str|unsupported operand type/, "TypeError on operator", "ERROR", "Mixing incompatible types", "Operators like + require compatible types, e.g. str with str.", "Convert with str()/int() | Use f-strings for formatting"],
    [/ModuleNotFoundError|No module named/, "ModuleNotFoundError", "ERROR", "Package not installed", "The interpreter cannot find the imported module.", "pip install the package | Check the active virtual environment"],
    [/KeyError/, "KeyError", "ERROR", "Missing dictionary key", "A dict was indexed with a key that does not exist.", "Use dict.get(key, default) | Check 'key in dict' first"],
    [/IndexError|list index out of range/, "IndexError", "ERROR", "Index past the end", "A sequence was accessed beyond its length.", "Check len() before indexing | Iterate with for-in instead of indices"],
    [/AttributeError|'NoneType' object has no attribute/, "AttributeError", "ERROR", "Attribute missing or value is None", "The object does not have that attribute, often because a function returned None.", "Check the return value | Guard against None"],
    [/^\s*(if|for|while|def|class|elif|else|try|except)\b[^:\n]*$/m, "Missing colon", "ERROR", "Block statement without ':'", "Compound statements must end with a colon.", "Add ':' at the end of the statement line"],
    [/ZeroDivisionError/, "ZeroDivisionError", "ERROR", "Division by zero", "A number was divided by zero.", "Check the divisor before dividing"],
    [/def \w+\([^)]*=\s*(\[\]|\{\})/, "Mutable default argument", "WARNING", "Default list/dict shared across calls", "Default arguments are evaluated once, so mutations persist between calls.", "Default to None | Create the list/dict inside the function"],
    [/except\s*:/, "Bare except", "WARNING", "Catching every exception", "A bare except hides bugs and even KeyboardInterrupt.", "Catch specific exceptions, e.g. except ValueError:"],
  ]),
  C: mk([
    [/Segmentation fault|SIGSEGV/, "Segmentation fault", "CRITICAL", "Invalid memory access", "The program read or wrote memory it does not own (null/dangling pointer, out of bounds).", "Initialize pointers | Check array bounds | Run with -fsanitize=address"],
    [/expected ';'/, "Missing semicolon", "ERROR", "Statement not terminated", "Every C statement must end with ';'.", "Add ';' at the end of the previous line"],
    [/implicit declaration of function/, "Implicit declaration", "ERROR", "Missing header or prototype", "The function is used without being declared.", "Include the correct header | Add a prototype before use"],
    [/undefined reference to/, "Linker: undefined reference", "ERROR", "Function defined nowhere or library not linked", "The linker could not find the function's implementation.", "Link the library (e.g. -lm) | Compile all source files"],
    [/\bgets\s*\(/, "Use of gets()", "CRITICAL", "Unbounded input", "gets() cannot limit input length and causes buffer overflows.", "Use fgets(buf, sizeof buf, stdin)"],
    [/scanf\s*\(\s*"%d"\s*,\s*[a-zA-Z_]/, "scanf missing &", "ERROR", "Passing value instead of address", "scanf needs a pointer to store the value.", "Pass &variable"],
    [/malloc\(/, "Unchecked malloc", "WARNING", "malloc may return NULL", "Allocation can fail; using NULL crashes.", "Check the result for NULL | free() memory when done"],
    [/if\s*\([^=!<>]*[^=!<>]=[^=][^)]*\)/, "Assignment in condition", "WARNING", "'=' used instead of '=='", "Assignment inside if() is usually a typo.", "Use '==' for comparison"],
    [/format '%d' expects|format specifies type/, "Format specifier mismatch", "WARNING", "printf/scanf specifier mismatch", "The format specifier does not match the argument type.", "Use %d for int, %f for double, %s for char*, %ld for long"],
    [/free\(\s*(\w+)\s*\)[\s\S]*free\(\s*\1\s*\)/, "Possible double free", "CRITICAL", "Same pointer freed twice", "Double free corrupts the heap.", "Set the pointer to NULL after free"],
  ]),
  "C++": mk([
    [/Segmentation fault|SIGSEGV/, "Segmentation fault", "CRITICAL", "Invalid memory access", "Dereferencing null/dangling pointers or going out of bounds.", "Use smart pointers | Prefer .at() for bounds checks | Use AddressSanitizer"],
    [/expected ';'/, "Missing semicolon", "ERROR", "Statement or class not terminated", "Statements and class definitions need ';'.", "Add ';' (including after class/struct closing brace)"],
    [/was not declared in this scope/, "Not declared in scope", "ERROR", "Missing include, namespace or declaration", "The identifier is unknown at this point.", "Include the header | Use std:: or declare the variable"],
    [/undefined reference to/, "Linker: undefined reference", "ERROR", "Missing definition", "A declared function has no definition linked.", "Define the function | Compile/link all translation units"],
    [/\bcout\b(?![\s\S]*using namespace std)(?<!std::cout)/, "cout without std::", "ERROR", "Missing std namespace", "cout lives in the std namespace.", "Write std::cout or add using namespace std;"],
    [/no matching function for call/, "No matching function", "ERROR", "Wrong argument types or count", "No overload matches the arguments given.", "Check the function signature | Convert arguments"],
    [/\bnew\b(?![\s\S]*\bdelete\b)/, "new without delete", "WARNING", "Memory leak", "Memory allocated with new is never freed.", "Use std::unique_ptr / std::vector instead of raw new"],
    [/vector<[^>]+>\s+\w+;[\s\S]*\w+\[\d+\]\s*=/, "Indexing empty vector", "CRITICAL", "Writing out of bounds", "operator[] on an empty vector is undefined behaviour.", "Use push_back or resize first"],
    [/comparison of integer expressions of different signedness/, "Signed/unsigned comparison", "WARNING", "int compared with size_t", "Mixed signedness can lead to wrong comparisons.", "Use size_t for loop indices"],
    [/use of deleted function/, "Use of deleted function", "ERROR", "Copying a non-copyable type", "e.g. copying a unique_ptr.", "Use std::move or pass by reference"],
  ]),
  Java: mk([
    [/NullPointerException/, "NullPointerException", "ERROR", "Using a null reference", "A method or field was accessed on null.", "Initialize objects | Add null checks | Use Optional"],
    [/ArrayIndexOutOfBoundsException/, "ArrayIndexOutOfBounds", "ERROR", "Index past array length", "Valid indices are 0..length-1.", "Use i < arr.length in loops"],
    [/cannot find symbol/, "Cannot find symbol", "ERROR", "Undeclared name or missing import", "The compiler does not know this identifier.", "Check spelling | Add the import | Declare the variable"],
    [/';' expected/, "Missing semicolon", "ERROR", "Statement not terminated", "Java statements end with ';'.", "Add ';'"],
    [/incompatible types/, "Incompatible types", "ERROR", "Assigning wrong type", "The value's type does not match the variable.", "Cast or convert | Change the variable type"],
    [/ClassCastException/, "ClassCastException", "ERROR", "Invalid cast", "Object is not an instance of the target type.", "Check with instanceof before casting"],
    [/==\s*"|"\s*==/, "String compared with ==", "WARNING", "Reference comparison", "== compares references, not content.", "Use .equals()"],
    [/unreported exception/, "Unreported checked exception", "ERROR", "Checked exception not handled", "Checked exceptions must be caught or declared.", "Wrap in try/catch | Add throws to the signature"],
    [/missing return statement/, "Missing return", "ERROR", "Not all paths return", "A non-void method must return on every path.", "Add a return at the end"],
    [/NumberFormatException/, "NumberFormatException", "ERROR", "Parsing non-numeric text", "Integer.parseInt received invalid text.", "Validate/trim input | Catch NumberFormatException"],
    [/ConcurrentModificationException/, "ConcurrentModification", "ERROR", "Modifying a collection while iterating", "for-each loops cannot remove items.", "Use Iterator.remove() or removeIf()"],
  ]),
  JavaScript: mk([
    [/is not defined/, "ReferenceError", "ERROR", "Undefined variable", "The variable was never declared or is out of scope.", "Declare with const/let | Check scope and spelling"],
    [/Cannot read propert(y|ies) of (undefined|null)/, "Property of undefined", "ERROR", "Accessing a property on undefined/null", "The value you're reading from does not exist yet.", "Use optional chaining (?.) | Initialize the value"],
    [/is not a function/, "Not a function", "ERROR", "Calling a non-function", "The value is undefined or not callable.", "Check the name and import | Verify the type"],
    [/Unexpected token/, "SyntaxError", "ERROR", "Invalid syntax", "A bracket, comma or quote is likely missing.", "Check matching brackets and quotes"],
    [/[^=!]==[^=]/, "Loose equality", "INFO", "== performs type coercion", "== can produce surprising results.", "Use === and !=="],
    [/\bvar\s/, "Use of var", "INFO", "Function-scoped variable", "var is hoisted and function-scoped, which causes bugs.", "Use const or let"],
    [/await\b(?![\s\S]*async)/, "await outside async", "ERROR", "await used in non-async function", "await is only valid inside async functions or modules.", "Mark the function async"],
    [/Assignment to constant variable/, "Assigning to const", "ERROR", "Reassigning a const", "const bindings cannot be reassigned.", "Use let if it must change"],
    [/Maximum call stack size exceeded/, "Stack overflow", "CRITICAL", "Infinite recursion", "A function calls itself without a base case.", "Add a base case | Convert to a loop"],
    [/\.then\([^)]*\)(?![\s\S]*\.catch)/, "Unhandled promise", "WARNING", "Missing .catch()", "Rejected promises go unhandled.", "Add .catch() or use try/await"],
    [/CORS|Access-Control-Allow-Origin/, "CORS error", "ERROR", "Cross-origin request blocked", "The server did not allow your origin.", "Configure CORS headers on the server | Use a proxy"],
  ]),
  TypeScript: mk([
    [/TS2322|is not assignable to type/, "Type not assignable", "ERROR", "Type mismatch", "The value's type does not match the declared type.", "Fix the value or widen the type"],
    [/TS2339|Property '.*' does not exist on type/, "Property does not exist", "ERROR", "Unknown property on type", "The type doesn't declare that property.", "Add it to the interface | Narrow the type"],
    [/TS2532|Object is possibly 'undefined'|TS18048/, "Possibly undefined", "ERROR", "Strict null checks", "The value might be undefined.", "Use optional chaining | Add a guard"],
    [/TS2304|Cannot find name/, "Cannot find name", "ERROR", "Undeclared identifier", "Name not declared or not imported.", "Import it | Install @types package"],
    [/TS7006|implicitly has an 'any' type/, "Implicit any", "WARNING", "Missing type annotation", "noImplicitAny requires explicit types.", "Annotate the parameter type"],
    [/TS2345|Argument of type/, "Argument type mismatch", "ERROR", "Wrong argument type", "The argument doesn't match the parameter type.", "Convert the argument | Fix the signature"],
    [/:\s*any\b/, "Explicit any", "INFO", "Type safety disabled", "any removes type checking.", "Use unknown or a specific type"],
    [/TS2307|Cannot find module/, "Cannot find module", "ERROR", "Bad import path or missing package", "The module cannot be resolved.", "Check the path | Install the package"],
    [/TS2554|Expected \d+ arguments/, "Wrong argument count", "ERROR", "Too many/few arguments", "Call does not match the function arity.", "Pass the expected number of arguments"],
    [/[^=!]==[^=]/, "Loose equality", "INFO", "== coerces types", "Prefer strict comparisons.", "Use ==="],
    [/TS1308|'await' expressions are only allowed/, "await outside async", "ERROR", "await in non-async function", "await requires an async context.", "Mark the function async"],
  ]),
  Go: mk([
    [/declared and not used|declared but not used/, "Unused variable", "ERROR", "Go forbids unused variables", "Every declared local must be used.", "Use the variable | Replace with _"],
    [/imported and not used/, "Unused import", "ERROR", "Go forbids unused imports", "Unused imports fail compilation.", "Remove the import"],
    [/nil pointer dereference/, "Nil pointer dereference", "CRITICAL", "Using a nil pointer", "A pointer/map/interface was nil.", "Initialize before use | Check for nil"],
    [/undefined:/, "Undefined identifier", "ERROR", "Name not declared", "The identifier is unknown or unexported.", "Check spelling | Capitalize exported names"],
    [/assignment to entry in nil map/, "Write to nil map", "CRITICAL", "Map not initialized", "Maps must be created with make before writing.", "m := make(map[K]V)"],
    [/index out of range/, "Index out of range", "ERROR", "Slice index past length", "Accessing beyond len(slice).", "Check len() | Use range loops"],
    [/err\s*:?=[^\n]*\n(?![^\n]*if err)/, "Unchecked error", "WARNING", "Error not handled", "Ignoring returned errors hides failures.", "if err != nil { return err }"],
    [/all goroutines are asleep - deadlock/, "Deadlock", "CRITICAL", "Blocked channel operations", "No goroutine can proceed.", "Use buffered channels | Ensure a receiver exists | Close channels"],
    [/cannot use .* as .* value/, "Type mismatch", "ERROR", "Incompatible types", "Go has no implicit conversions.", "Convert explicitly, e.g. float64(x)"],
    [/missing return/, "Missing return", "ERROR", "Not all paths return", "Functions with results must return on all paths.", "Add a final return"],
  ]),
  Rust: mk([
    [/E0382|borrow of moved value|use of moved value/, "Use after move", "ERROR", "Value moved", "Ownership was transferred, so the original can't be used.", "Borrow with & | .clone() if needed"],
    [/E0502|cannot borrow .* as mutable because it is also borrowed/, "Borrow conflict", "ERROR", "Mutable + immutable borrow", "Rust forbids aliasing a mutable borrow.", "Limit borrow scope | Restructure code"],
    [/E0308|mismatched types/, "Mismatched types", "ERROR", "Type mismatch", "The value's type differs from what's expected.", "Convert types | Fix the annotation"],
    [/E0425|cannot find value/, "Cannot find value", "ERROR", "Undeclared name", "Identifier isn't in scope.", "Declare or import it"],
    [/E0384|cannot assign twice to immutable/, "Assign to immutable", "ERROR", "Variable not mut", "Bindings are immutable by default.", "Declare with let mut"],
    [/\.unwrap\(\)/, "unwrap()", "WARNING", "Possible panic", "unwrap panics on None/Err.", "Use ? or match / unwrap_or"],
    [/E0106|missing lifetime specifier/, "Missing lifetime", "ERROR", "Reference lifetime unclear", "Returned references need lifetimes.", "Add 'a lifetimes | Return owned data"],
    [/E0599|no method named/, "No method", "ERROR", "Method not found", "The type lacks the method or trait isn't imported.", "Import the trait | Check the type"],
    [/panicked at .*index out of bounds/, "Index out of bounds", "CRITICAL", "Runtime panic", "Indexed past the end of a slice/Vec.", "Use .get(i) | Check len()"],
    [/E0277|the trait bound .* is not satisfied/, "Trait bound not satisfied", "ERROR", "Missing trait impl", "The type doesn't implement the required trait.", "Derive or implement the trait"],
  ]),
  Bash: mk([
    [/command not found/, "Command not found", "ERROR", "Binary missing or not in PATH", "The shell can't find that command.", "Install it | Check PATH and spelling"],
    [/Permission denied/, "Permission denied", "ERROR", "Missing execute/read permission", "The file isn't executable or accessible.", "chmod +x script.sh | Check ownership"],
    [/\[\s*\$\w+\s*(==|=|-eq)/, "Unquoted variable in test", "WARNING", "Word splitting", "Empty or spaced values break [ ] tests.", "Quote variables: [ \"$var\" = x ]"],
    [/\w+\s+=\s+\S/, "Spaces around =", "ERROR", "Invalid assignment", "Bash assignments cannot have spaces around =.", "Write var=value"],
    [/unexpected end of file|syntax error near unexpected token/, "Syntax error", "ERROR", "Unclosed block or quote", "Missing fi/done/esac or quote.", "Close every if/for/case and quote"],
    [/^(?!#!)/, "Missing shebang", "INFO", "Interpreter not specified", "Without a shebang the script may run in the wrong shell.", "Add #!/usr/bin/env bash on line 1"],
    [/\$\(\s*ls\b|for \w+ in \$\(ls/, "Parsing ls", "WARNING", "Fragile filename handling", "ls output breaks on spaces.", "Use globs: for f in *; do"],
    [/cd [^&|;\n]+\n/, "Unchecked cd", "WARNING", "cd failure ignored", "If cd fails, later commands run in the wrong directory.", "cd dir || exit 1"],
    [/bad substitution/, "Bad substitution", "ERROR", "Invalid ${} syntax or sh not bash", "Bash-only syntax run in sh.", "Run with bash | Fix the expansion"],
    [/rm -rf \$\w+\/?(\s|$)/, "Dangerous rm -rf", "CRITICAL", "Unquoted/empty variable", "An empty variable could delete from root.", "Use \"${var:?}\" and quote paths"],
  ]),
  PHP: mk([
    [/Undefined variable/, "Undefined variable", "WARNING", "Variable not set", "Variable used before assignment.", "Initialize it | Use isset()"],
    [/syntax error, unexpected/, "Parse error", "ERROR", "Invalid syntax", "Usually a missing ';' or brace.", "Check the previous line for ';' and braces"],
    [/Call to undefined function/, "Undefined function", "ERROR", "Function not defined or extension missing", "PHP can't find the function.", "Check spelling | Enable extension | require the file"],
    [/Call to a member function .* on null/, "Method on null", "ERROR", "Object is null", "A method was called on null.", "Check the value before calling"],
    [/Undefined (index|array key)/, "Undefined array key", "WARNING", "Missing key", "The array has no such key.", "Use isset() or ?? default"],
    [/\$_(GET|POST|REQUEST)\[[^\]]+\][^;]*(query|mysqli_query|->query)/i, "SQL injection risk", "CRITICAL", "User input in SQL", "Concatenated input allows SQL injection.", "Use prepared statements with PDO"],
    [/echo\s+\$_(GET|POST)/, "XSS risk", "CRITICAL", "Echoing raw input", "Unescaped output allows script injection.", "Use htmlspecialchars()"],
    [/headers already sent/, "Headers already sent", "ERROR", "Output before header()", "Whitespace or echo was sent first.", "Remove output before header() | Remove BOM"],
    [/[^=!]==[^=]/, "Loose comparison", "INFO", "Type juggling", "== can compare surprisingly.", "Use ==="],
    [/Class ".*" not found/, "Class not found", "ERROR", "Autoload/namespace issue", "The class isn't loaded.", "Check namespace and composer autoload"],
  ]),
  Ruby: mk([
    [/NoMethodError|undefined method .* for nil/, "NoMethodError on nil", "ERROR", "Calling method on nil", "The receiver is nil.", "Use &. safe navigation | Initialize the value"],
    [/NameError|undefined local variable/, "NameError", "ERROR", "Undefined name", "Variable or method not defined.", "Check spelling | Define before use"],
    [/syntax error, unexpected end-of-input|expecting end/, "Missing end", "ERROR", "Unclosed block", "Every def/if/do needs an end.", "Add the matching end"],
    [/ArgumentError.*wrong number of arguments/, "Wrong number of arguments", "ERROR", "Arity mismatch", "Method called with wrong arg count.", "Match the method signature"],
    [/TypeError.*no implicit conversion/, "No implicit conversion", "ERROR", "Mixing types", "e.g. String + Integer.", "Use .to_s / .to_i or interpolation"],
    [/LoadError|cannot load such file/, "LoadError", "ERROR", "Gem/file missing", "require couldn't find the file.", "gem install | bundle install | check path"],
    [/ZeroDivisionError/, "ZeroDivisionError", "ERROR", "Divide by zero", "Integer division by zero.", "Check the divisor"],
    [/rescue\s*(=>|\n)/, "Bare rescue", "WARNING", "Swallows errors", "Catching StandardError broadly hides bugs.", "Rescue specific exceptions"],
    [/KeyError/, "KeyError", "ERROR", "Missing hash key with fetch", "fetch raised for a missing key.", "Provide a default: fetch(k, default)"],
    [/FrozenError|can't modify frozen/, "FrozenError", "ERROR", "Mutating frozen object", "String literals may be frozen.", "Use .dup before modifying"],
  ]),
  SQL: mk([
    [/syntax error at or near|You have an error in your SQL syntax/, "Syntax error", "ERROR", "Invalid SQL", "A keyword, comma or quote is wrong.", "Check commas, quotes and keyword order"],
    [/column .* does not exist|Unknown column/, "Unknown column", "ERROR", "Bad column name", "The column isn't in the table.", "Check spelling | Use double quotes for case-sensitive names"],
    [/relation .* does not exist|Table .* doesn't exist/, "Unknown table", "ERROR", "Missing table", "The table isn't in this schema.", "Create it | Qualify with schema name"],
    [/must appear in the GROUP BY clause|isn't in GROUP BY/, "GROUP BY error", "ERROR", "Non-aggregated column", "Selected columns must be grouped or aggregated.", "Add to GROUP BY | Wrap in an aggregate"],
    [/\bDELETE\s+FROM\s+\w+\s*;/i, "DELETE without WHERE", "CRITICAL", "Deletes every row", "Missing WHERE removes all data.", "Add a WHERE clause"],
    [/\bUPDATE\s+\w+\s+SET[^;]*;(?<!WHERE[^;]*;)/i, "UPDATE without WHERE", "CRITICAL", "Updates every row", "Missing WHERE changes all rows.", "Add a WHERE clause"],
    [/SELECT\s+\*/i, "SELECT *", "INFO", "Fetching all columns", "Slower and fragile when schemas change.", "List required columns"],
    [/=\s*NULL/i, "= NULL comparison", "ERROR", "NULL never equals anything", "Comparisons with NULL are unknown.", "Use IS NULL / IS NOT NULL"],
    [/duplicate key value|Duplicate entry/, "Duplicate key", "ERROR", "Unique constraint violated", "A row with that key exists.", "Use ON CONFLICT / upsert | Check data"],
    [/ambiguous/i, "Ambiguous column", "ERROR", "Same column in multiple tables", "The column name exists in joined tables.", "Prefix with table alias"],
    [/division by zero/, "Division by zero", "ERROR", "Divisor is zero", "Expression divided by zero.", "Use NULLIF(divisor, 0)"],
  ]),
};

export interface RuleMatch {
  title: string;
  severity: Severity;
  cause: string;
  explanation: string;
  fix: string[];
  line: number | null;
}

/** Guess language from content. */
export function detectLanguage(src: string): Language {
  const s = src;
  if (/^#!.*\b(bash|sh)\b/m.test(s) || /\becho\s|\bfi\b|\bdone\b/.test(s)) return "Bash";
  if (/<\?php/.test(s)) return "PHP";
  if (/\bfn\s+main\s*\(|let\s+mut\b|println!/.test(s)) return "Rust";
  if (/\bpackage\s+main\b|\bfunc\s+\w+\(|fmt\.Print/.test(s)) return "Go";
  if (/\bpublic\s+(static\s+)?class\b|System\.out/.test(s)) return "Java";
  if (/#include\s*<(iostream|vector|string)>|std::|cout\s*<</.test(s)) return "C++";
  if (/#include\s*</.test(s)) return "C";
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE)\b/im.test(s)) return "SQL";
  if (/\bdef\s+\w+.*:\s*$|^\s*import\s+\w+$|print\(/m.test(s) && !/[{};]\s*$/m.test(s)) return "Python";
  if (/\bdef\s+\w+|\bend\b|puts\s/.test(s)) return "Ruby";
  if (/:\s*(string|number|boolean)\b|interface\s+\w+|TS\d{4}/.test(s)) return "TypeScript";
  return "JavaScript";
}

export function runRules(language: Language, content: string): RuleMatch[] {
  const lines = content.split("\n");
  const out: RuleMatch[] = [];
  for (const r of RULES[language] ?? []) {
    const m = r.pattern.exec(content);
    if (!m) continue;
    const before = content.slice(0, m.index);
    const line = before.split("\n").length;
    out.push({
      title: r.title, severity: r.severity, cause: r.cause,
      explanation: r.explanation, fix: r.fix,
      line: line <= lines.length ? line : null,
    });
  }
  return out.slice(0, 12);
}
