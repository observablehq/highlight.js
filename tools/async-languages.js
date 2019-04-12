const fs = require("fs");
const path = require("path");

try {
  fs.mkdirSync("./async-languages");
} catch (e) {}

function getRequires(f) {
  const requires = f.match(/\nRequires:(.*)/);
  if (requires) {
    return requires[1].split(",").map(r => "./" + r.trim());
  }
  return [];
}

let languageMap = {};

for (let language of fs.readdirSync("./src/languages")) {
  let f = fs.readFileSync(`./src/languages/${language}`, "utf8");
  let requires = getRequires(f);
  f =
    f.replace(
      "function(hljs) {",
      `define(${JSON.stringify(requires)}, () => function(hljs) {`
    ) + ")";

  let aliases = [path.basename(language, ".js")];
  const specifiedAliases = f.match(/\baliases: \[([^\]]*)\]/);
  if (specifiedAliases) {
    aliases.push(
      ...specifiedAliases[1].split(",").map(s => s.replace(/'/g, "").trim())
    );
  }

  for (let alias of aliases) {
    languageMap[alias] = language;
  }

  fs.writeFileSync(`./async-languages/${language}`, f);
}

fs.writeFileSync(
  "./async-languages/index.js",
  `define(() => new Map(${JSON.stringify(Object.entries(languageMap))}))`
);
