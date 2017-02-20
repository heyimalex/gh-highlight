const path = require('path');
const Highlights = require('highlights');
const aliases = require('./aliases.json');

const highlighter = new Highlights();
const modulePath = path.join(__dirname, '..');
highlighter.requireGrammarsSync({ modulePath: modulePath });

function scopeNameFromLang(lang) {
  if (typeof lang !== 'string') {
    return undefined;
  }
  lang = lang.trim().toLowerCase();
  if (lang.startsWith('.')) {
    lang = lang.substring(1);
  }
  if (aliases.hasOwnProperty(lang)) {
    return aliases[lang];
  }
  return;
}

function highlight(code, lang, callback) {
  const scopeName = scopeNameFromLang(lang);
  highlighter.highlight(
    {
      fileContents: code,
      scopeName: scopeName,
    },
    callback,
  );
}

function highlightSync(code, lang) {
  const scopeName = scopeNameFromLang(lang);
  return highlighter.highlightSync({
    fileContents: code,
    scopeName: scopeName,
  });
}

highlight.sync = highlightSync;
highlight.scopeNameFromLang = scopeNameFromLang;
module.exports = highlight;
