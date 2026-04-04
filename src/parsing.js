const Parser = require('web-tree-sitter/debug');

export const getParser = async () => {
 
  await Parser.Parser.init();
  const parser = new Parser.Parser();
  const Lang = await Parser.Language.load('./tree-sitter-essence.wasm');
  parser.setLanguage(Lang);
  return parser;
  //const tree = parser.parse('find x : int ( 10 )'); 
  //console.log(tree.rootNode.toString());
};