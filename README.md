# gh-highlight

Highlight code like github.

This project is the synthesis of a couple of other projects:

- [github/linguist] has information on language detection, has scripts for collecting all of the grammars used for highlighting.
- [atom/highlights] is a syntax highlighter that can use TextMate's grammar format to highlight code.

## Usage

The API was designed for highlighting fenced code blocks in markdown. For a list of names that are usable, check out [aliases.json]. The keys are the names you can use, the values are the scope name of the grammar that will be used to highlight.

Two functions are exposed; `highlight` and `highlight.sync`. They both take the code-to-be-highlighted as the first paramater and the language-infront-of-the-code-block as the second. For the top level version, the last parameter needs to be a callback.

If the language doesn't point to any grammar, no error will be reported.

```js
const highlight = require('gh-highlight');

const html = highlight.sync('var hello = "world";', 'js');
console.log(html);
```

Outputs

```html
<pre class="editor editor-colors">
  <div class="line">
    <span class="source js">
      <span class="storage modifier js"><span>var</span></span>
      <span>&nbsp;hello&nbsp;</span>
      <span class="keyword operator js"><span>=</span></span>
      <span>&nbsp;</span>
      <span class="string quoted double js">
        <span class="punctuation definition string begin js"><span>&quot;</span></span>
        <span>world</span>
        <span class="punctuation definition string end js"><span>&quot;</span></span>
      </span>
      <span class="punctuation terminator statement js"><span>;</span></span>
    </span>
  </div>
</pre>
```

## Themes

For now I'm just going to defer to [atom/highlights], as the process for creating a css file from an atom theme should be exactly the same. You can download these prebuilt css files if you don't want to bother generating them from scratch.

- [monokai](https://atom.github.io/highlights/examples/monokai.css)
- [atom-light](https://atom.github.io/highlights/examples/atom-light.css)
- [atom-dark](https://atom.github.io/highlights/examples/atom-dark.css)
- [solarized-light](https://atom.github.io/highlights/examples/solarized-light.css)
- [solarized-dark](https://atom.github.io/highlights/examples/solarized-dark.css)

## Development

Development is not very user friendly at this point, but this is the initial commit chill out. Here's roughly how to build linguist's grammars on a fresh xenial box.

```bash
sudo apt-get update
sudo apt-get install git subversion ruby ruby-dev ruby-bundler curl nodejs npm cmake pkg-config libicu-dev
sudo ln -s "$(which nodejs)" /usr/bin/node
git clone https://github.com/github/linguist.git
cd linguist
./script/bootstrap
./script/convert-grammars
```

## Roadmap

- [x] Complete basic functionality.
- [x] Add basic tests.
- [x] Finish packaging for npm and publish.
- [ ] Load grammars lazily.
- [ ] Minify the grammars so that the package's download size is smaller. Should remove unnecessary keys, comments, disabled rules, unused rules, whitespace.
- [ ] Compile code to support older node versions.
- [ ] Make development process more user friendly, add more documentation.
- [ ] Add pre-built common themes to this package.
- [ ] Add playground and visual examples.
- [ ] Continuous integration.
- [ ] Consider including a tool for generating themes.
- [ ] Consider convention-based extension method for adding grammars.

[github/linguist]: https://github.com/github/linguist
[atom/highlights]: https://github.com/atom/highlights
[aliases.json]: https://github.com/heyimalex/gh-highlight/blob/master/lib/aliases.json
