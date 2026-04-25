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
