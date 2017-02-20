// This script reads linguist's languages.yml and creates a mapping from
// language name, like you would put into a fenced code block, to scope name,
// which is used to figure out the grammar to use for highlighting.

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const languagesYmlPath = "./linguist/lib/linguist/languages.yml";
const languagesYml = yaml.safeLoad(fs.readFileSync(languagesYmlPath, "utf8"));

const aliasMapping = new Map();

for (let [name, language] of Object.entries(languagesYml)) {
  // We won't be able to highlight any languages that don't have an
  // associated grammar, so just skip these. This 'none' convention is
  // documented in languages.yml.
  if (!language.hasOwnProperty("tm_scope") || language.tm_scope === "none") {
    console.log(`Skipping ${name}: no associated language grammar`);
    continue;
  }

  const aliases = new Set();

  // According to languages.yml, aliases implicitly includes name.downcase.
  aliases.add(name.toLowerCase());

  // Add all of the aliases.
  if (language.hasOwnProperty("aliases")) {
    language.aliases.forEach(alias => aliases.add(alias));
  }

  // Github is also capable of using the file extension, but there are
  // conficts so I need to figure out how to resolve those before adding
  // them to the alias list.

  // Add all of the aliases to the mapping, throwing an error if there are any duplicates.
  const tmScope = language.tm_scope;
  aliases.forEach(alias => {
    if (aliasMapping.has(alias)) {
      throw new Error(
        `Duplicate alias '${alias}' for language '${name}'. Previous entry points to scope name '${aliasMapping.get(
          alias
        )}'`
      );
    }
    aliasMapping.set(alias, tmScope);
  });
  console.log(`Added ${aliases.size} aliases for language "${name}"`);
}

// Convert Map and Set to object and array :(
const result = {};
for (let [key, value] of aliasMapping.entries()) {
  result[key] = value;
}

fs.writeFileSync("./lib/aliases.json", JSON.stringify(result));
