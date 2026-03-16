const Parser = require('web-tree-sitter');

(async () => {
 
  await Parser.Parser.init();
  const parser = new Parser.Parser();
  const Lang = await Parser.Language.load('./tree-sitter-javascript.wasm');
  parser.setLanguage(Lang);
  const tree = parser.parse('let x = 1;');
  console.log(tree.rootNode.toString());
})();