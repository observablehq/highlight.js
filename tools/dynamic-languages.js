const fs = require("fs");

try {
  fs.mkdirSync("./async-languages");
} catch (e) {}

function getRequires(f) {
  const requires = f.match(/\nRequires:(.*)/);
  if (requires) {
    return requires[1].split(",").map(r => r.trim());
  }
}

for (let language of fs.readdirSync("./src/languages")) {
  let f = fs.readFileSync(`./src/languages/${language}`, "utf8");
  let requires = getRequires(f);
  if (requires) {
    let imports = requires
      .map((file, i) => `import dependency_${i} from "./${file}";`)
      .join("\n");
    f = imports + "\n" + f;
    f = f.replace(
      "function(hljs) {",
      "export default function(hljs) {\n" +
        requires.map((_, i) => `  dependency_${i}(hljs);`).join("\n")
    );
  } else {
    f = f.replace("function(hljs) {", "export default function(hljs) {");
  }

  fs.writeFileSync(`./async-languages/${language}`, f);
}
