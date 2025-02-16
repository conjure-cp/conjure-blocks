import * as Blockly from 'blockly';
import {grammar} from '../grammar';
export const essenceGenerator = new Blockly.Generator('essence');

const rules = grammar.rules;
const autoBlocks = [];
console.log(rules);

//defining blocks

for (let r in rules){
    //console.log(rules[r](rules))
    let out = rules[r](rules);
    const block = {};
    block.type = r;
    block.output = r; 
    if (out.constructor.name === "Object"){
        block.message0 = out.message;
        block.args0 = out.args;
        generatorFunction(block.type, block.message0, block.args0);
    }else {
        block.message0 = out.toString();
        generatorFunction(block.type, block.message0, []);
    }
    autoBlocks.push(block);
}

console.log(autoBlocks);

// add blocks to toolbox 
const toolboxContents = [];

for (let b of autoBlocks) {
    const def = {}
    def.kind = 'block';
    def.type = b.type;
    toolboxContents.push(def);
}

// add lists block

toolboxContents.push ( {
    'kind': 'block',
    'type': 'lists_create_with',
  })
console.log(toolboxContents);

// define generator function for blocks
function generatorFunction(type, message, args){
    essenceGenerator.forBlock[type] = function (block, generator) {
        let code = message;
        for (let i = 1; i <= args.length; i++) {
            code = code.replace(`%${i}`, `${generator.valueToCode(block, args[i-1].name, 0)}`);
        }
        return [code, 0];
    }
}

// define generator for list
essenceGenerator.forBlock['lists_create_with'] = function(block, generator) {
    const values = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const valueCode = generator.valueToCode(block, 'ADD' + i,
        0);
    if (valueCode) {
      values.push(valueCode);
    }
  }
  const valueString = values.join(', ');
  const codeString = `${valueString}`;
  return [codeString, 0];
};

export const autoToolbox = {
    'kind': 'categoryToolbox',
    'contents': [
        {
            'kind': 'category',
            'name':'all',
            'contents': toolboxContents
        }
    ]
};


export const essenceBlocks = Blockly.common.createBlockDefinitionsFromJsonArray(autoBlocks);