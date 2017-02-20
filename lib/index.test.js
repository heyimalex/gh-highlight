const highlight = require('./index');
const { scopeNameFromLang } = highlight;

test('scopeNameFromLang', () => {
  expect(scopeNameFromLang('js')).toBe('source.js');
  expect(scopeNameFromLang('.js')).toBe('source.js');
  expect(scopeNameFromLang('javascript')).toBe('source.js');
  expect(scopeNameFromLang('JaVaScRiPt')).toBe('source.js');

  expect(scopeNameFromLang('')).toBe(undefined);
  expect(scopeNameFromLang('')).toBe(undefined);
  expect(scopeNameFromLang('  ')).toBe(undefined);
  expect(scopeNameFromLang('--unknown--')).toBe(undefined);
});

test('highlight snapshot', () => {
  expect(highlight.sync('var hello = "world";')).toMatchSnapshot();
  expect(highlight.sync('var hello = "world";', 'js')).toMatchSnapshot();
});
