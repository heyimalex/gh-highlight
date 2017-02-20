// This script reads linguist's languages.yml and the generated grammars and
// creates a mapping from language name, like you would put into a fenced code
// block, to scope name, which is used to figure out the grammar to use for
// highlighting.

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const languagesYmlPath = './linguist/lib/linguist/languages.yml';
const languages = yaml.safeLoad(fs.readFileSync(languagesYmlPath, 'utf8'));

// Unfortunately, many of the entries in languages.yml don't have an
// associated tm_scope. This is the case even for common languages like go and
// clojure. The first step will be to run through all of the grammars and
// _attempt_ to match them with the appropriate entry in languages.yml. Then
// the language entry will be updated with the matched tm_scope.

console.log('\nLoading grammars...');

// Load all of the grammars and build a couple of indexes. To start, we'll
// treat the indexes like multimaps, where the values are actually sets. Then
// we'll remove all entries where the size of the set !== 1 and flatten all
// entries that are unique, so that only exact matches are in the index.

const grammarsByName = new Map();
const grammarsByScope = new Map();
const grammarsByExt = new Map();

function multiMapAdd(map, key, value) {
  const set = map.get(key) || new Set();
  set.add(value);
  map.set(key, set);
}

const grammars = fs
  .readdirSync('./grammars')
  .map(grammarFileName => require(`../grammars/${grammarFileName}`));

for (const grammar of grammars) {
  if (grammar.hasOwnProperty('name')) {
    multiMapAdd(grammarsByName, slugify(grammar.name), grammar);
  }

  if (grammar.hasOwnProperty('scopeName')) {
    multiMapAdd(grammarsByScope, grammar.scopeName, grammar);
  }

  if (grammar.hasOwnProperty('fileTypes')) {
    for (let fileType of grammar.fileTypes) {
      multiMapAdd(grammarsByExt, fileType.toLowerCase(), grammar);
    }
  }
}

// Flatten out all of the indexes, removing all entries with multiple values.

function multiMapDedup(map, label) {
  for (const key of [...map.keys()]) {
    const grammars = map.get(key);
    if (grammars.size === 1) {
      const onlyValue = grammars.values().next().value;
      map.set(key, onlyValue);
      continue;
    }
    console.log(`Multiple entries for same ${label}: ${key}`);
    for (const grammar of grammars) {
      console.log(`  ${grammar.scopeName}`);
    }
    map.delete(key);
  }
}

multiMapDedup(grammarsByName, 'name');
multiMapDedup(grammarsByScope, 'scope');
multiMapDedup(grammarsByExt, 'extension');

// Iterate through the language entries and attempt to find the matching
// tm_scope if it's not already present.

console.log('\nAssociating scopes...');

langloop:
for (let [name, language] of Object.entries(languages)) {
  // Skip languages that already have an associated tm_scope. This 'none'
  // convention is documented in languages.yml.
  if (language.hasOwnProperty('tm_scope') && language.tm_scope !== 'none') {
    continue;
  }

  // Check for a direct name match.
  const slug = slugify(name);
  if (grammarsByName.has(slug)) {
    language.tm_scope = grammarsByName.get(slug).scopeName;
    continue;
  }

  // Check for an extension match.
  if (language.hasOwnProperty('extensions')) {
    for (let ext of language.extensions) {
      ext = ext.substring(1).toLowerCase(); // Remove leading period
      if (grammarsByExt.has(ext)) {
        language.tm_scope = grammarsByExt.get(ext).scopeName;
        continue langloop;
      }
    }
  }

  // Check for a closely matching scope name.
  const hopefulScopeName = `source.${slug}`;
  if (grammarsByScope.has(hopefulScopeName)) {
    language.tm_scope = hopefulScopeName;
    continue;
  }

  // Couldn't figure out which scopeName it was. Delete the key so that we
  // don't need to check for "none" in the future.
  console.warn(`"${name}" could not be associated with a scope`);
  delete language.tm_scope;
}

// Log all of the unused grammars for good measure.

console.log('\nChecking for unused grammars...');
console.log('Note that these may still be included from other grammars.');

const unused = new Set([...grammarsByScope.keys()]);
for (let [name, language] of Object.entries(languages)) {
  if (language.tm_scope) {
    unused.delete(language.tm_scope);
  }
}
for (const scopeName of unused.values()) {
  console.log(`  ${scopeName}`);
}

console.log('\nCreating indexes...');

const index = new Map();
const extensionIndex = new Map();

for (let [name, language] of Object.entries(languages)) {
  // We won't be able to highlight any languages that don't have an
  // associated grammar, so just skip these.
  if (!language.hasOwnProperty('tm_scope')) {
    continue;
  }

  const scopeName = language.tm_scope;

  function addToIndex(key) {
    key = key.toLowerCase().replace(' ', '-');
    // Check that there isn't already an entry under this key in the index.
    if (index.has(key)) {
      const otherScope = index.get(key);
      // Ignore if the scopes are the same anyways.
      if (otherScope !== scopeName) {
        throw new Error(
          `Duplicate key "${key}" for scope "${scopeName}". ` +
            `Previous entry points to scope "${otherScope}"`,
        );
      }
    }
    index.set(key, scopeName);
  }

  function addToExtensions(extension) {
    // Remove leading dot
    if (extension.startsWith('.')) {
      extension = extension.substring(1);
    }
    extension = extension.toLowerCase();
    if (extensionIndex.has(extension)) {
      const otherScope = extensionIndex.get(extension);
      if (otherScope !== scopeName) {
        console.warn(
          `Duplicate extension "${extension}" for scope "${scopeName}".`,
        );
        console.warn(`Scope will be "${otherScope}" instead.`);
      }
    } else {
      extensionIndex.set(extension, scopeName);
    }
  }

  // Sanity check
  if (typeof scopeName !== 'string') {
    throw new Error(`Invalid scope name for "${name}": ${scopeName}`);
  }

  // Add slugified versions of the name to the index.
  const lowerName = name.toLowerCase();
  if (lowerName.includes(' ')) {
    addToIndex(lowerName.replace(' ', '-'));
    addToIndex(lowerName.replace(' ', '_'));
  } else {
    addToIndex(lowerName);
  }

  // Add all of the aliases to the index.
  if (language.hasOwnProperty('aliases')) {
    language.aliases.forEach(addToIndex);
  }

  // Github will also use the file extensions, but when there are conflict's
  // there's no reconciliation. So if the key is already taken, just skip.
  // Need to think of a better way to do this, since more popular languages
  // could be overridden by less popular ones.
  if (language.hasOwnProperty('extensions')) {
    language.extensions.forEach(addToExtensions);
  }
}

// Merge extensions into the main index, but only if the main index doesn't
// already have a value for that key.
for (const [key, value] of extensionIndex) {
  if (!index.has(key)) {
    index.set(key, value);
  }
}

console.log('\nSaving results...');

// Convert the index map to a json object with ordered keys so that it looks
// nice. Maps unfortunately don't JSON.stringify very well.
const indexObj = [...index.keys()].sort().reduce((obj, key) => {
  obj[key] = index.get(key);
  return obj;
}, {});

fs.writeFileSync('./lib/aliases.json', JSON.stringify(indexObj, null, 2));

function slugify(s) {
  return s.toLowerCase().replace(' ', '-');
}

console.log('Done!');
