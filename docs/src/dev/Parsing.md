# Text To Block generation & Using Tree-sitter Parser
 See official documentation [here](https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started.html) for more info on how tree-sitter works and how to use it.
 
## Requirements
  - `tree-sitter-cli` - install binaries and add to PATH from [here](https://github.com/tree-sitter/tree-sitter/releases/tag/v0.26.8).
  - `src/tree-sitter-essence`

## Changing tree-sitter-essence grammar
 The grammar used by tree-sitter-essence, and thereby used for text-to-block conversion is stored in `src/tree-sitter-essence/grammar.js`, not `src/grammar.js`, although they should be compatible for the grammar to work properly.
 Edit this to define the Essence grammar accepted by the parser.

 Once finish, navigate to `src/tree-sitter-essence` and run
 `tree-sitter generate`
 This will generate the source files required to parse Essence. 

To integrate into Conjure-Blocks, run
 `tree-sitter build -wasm`
 This will create the wasm for the grammar.

 Copy `tree-sitter-essence.wasm` into `src` and ensure this file is included in the `CopyWebpackPlugin` patterns in `webpack.config.js`.

 Now, when the website is run using `npm run start`, the correct grammar and bindings are used.


## Description of creating blocks from parse tree
1. Parse the text in the output box using tree-sitter to obtain the parse tree.
2. For each child of `program`, recursively traverse the tree, creating blocks of each node type and ensure the blocks are connected with the below conditions
      1. If it is a variable, create correct block type. Type of variable is either obtain from current blockly mapping, or is defined in a "<name> <defines> <domain/type>" block, and so is obtained by  third child of the grandparent.
      2. If it is a constant, return place the text value in an `integer` block.
      3. If the parent is a list, account for dummy inputs and the number argument current node is.
      4. Skip children that are categories.
      5. Skip any non-block/failing block generations (retaining argument place in child).
