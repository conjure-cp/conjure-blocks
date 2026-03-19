# Developer Guide

Conjure-Blocks is built using [blockly](https://developers.google.com/blockly), so if interested in contributing, it is important to get familiar with this library first. 

## Helpful links to get started

- [tutorials](https://blocklycodelabs.dev/), in particular
    - [getting started with blockly](https://blocklycodelabs.dev/codelabs/getting-started/index.html?index=..%2F..index#0)
    - [build a custom generator](https://blocklycodelabs.dev/codelabs/custom-generator/index.html?index=..%2F..index#0)

- [guides](https://developers.google.com/blockly/guides/get-started/what-is-blockly)
- [defining custom blocks](https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks)
- [tree sitter grammar functions that need overloading](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl.html)

## How To Contribute
 - Create issue for feature or bug fix
 - Fork this [repo] (https://github.com/conjure-cp/conjure-blocks)
 - Create a new branch
 - Develop on this new branch
 - Pull request from this branch to main branch of the origin
 - Request @N-J-Martin or @JamieASM for review
 - Once approved, request @ozgurakgun for review


## Common Issues

* **block not defined**
    - this is likely caused by a change in block definition, so a block is stored in browser history that no longer exists.
    - to fix, comment out the load session line in serialization.js, and rerun to empty the workspace history. You can then uncomment once fixed.

## Current Features
 - Blocks to Essence generation 
 - Block data input using JSON format
 - Block output 
 - Running generated Essence on conjure using Conjure aaS
 - Download generated Essence as a .essence file
 - Save block files as a .block file
 - Load .block files
 - Automated Block Generation (See more detail [here](./AutomatedBlockGeneration.md))
 - Adjustable Workspace
 - Help guide
 - Tooltips
 - Typing comments
 - Measures to reduce block nesting


 ## Possible Next Steps

- Automated testing
- Accessibility improvements
- highlight statements that cut solution space
- Extending grammar

## Currently working on

- Different connection shapes for each category.
- Text to Block 


