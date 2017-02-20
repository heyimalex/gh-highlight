# gh-highlight

Highlight code like github.

This project is the synthesis of a couple of other projects:

- [github/linguist] has information on language detection, has scripts for collecting all of the grammars used for highlighting.
- [atom/highlights] is a syntax highlighter that can use TextMate's grammar format to highlight code.

## Usage

The API was designed for highlighting fenced code blocks in markdown. For a list of names that are usable, check out [languages.yml]. All aliases are supported, as are all file extensions.

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
sudo apt install git subversion ruby ruby-bundler curl nodejs npm cmake pkg-config libicu-dev
sudo ln -s "$(which nodejs)" /usr/bin/node
git clone https://github.com/github/linguist.git
cd linguist
./scripts/bootstrap
./scripts/convert-grammars
```

## Roadmap

- [ ] Complete basic functionality.
- [ ] Add basic tests.
- [ ] Load grammars lazily.
- [ ] Minify the grammars so that the package's download size is smaller. Should remove unnecessary keys, comments, disabled rules, unused rules, whitespace.
- [ ] Finish packaging for npm and publish.
- [ ] Make development process more user friendly, add more documentation.
- [ ] Add pre-built common themes to this package.
- [ ] Consider including a tool for generating themes.
- [ ] Consider convention-based extension method for adding grammars.

[github/linguist]: https://github.com/github/linguist
[atom/highlights]: https://github.com/atom/highlights
[languages.yml]: https://github.com/github/linguist/blob/master/lib/linguist/languages.yml