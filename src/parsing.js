const Parser = require('tree-sitter');
const Essence = require('grammar.js');

const parser = new Parser();
parser.setLanguage(Essence);
const sourceCode = 'find x: int( 1 .. 10)';
const tree = parser.parse(sourceCode);
console.log(tree);