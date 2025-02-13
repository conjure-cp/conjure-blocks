import * as Blockly from 'blockly';
import {grammar} from '../grammar';
const rules = grammar.rules;
const autoBlocks = [];
console.log(rules);

for (let r in rules){
    //console.log(rules[r](rules))
    let out = rules[r](rules);
    const block = {};
    block.type = r;
    block.output = r; 
    if (out.constructor.name === "Object"){
        block.message0 = out.message;
        block.args0 = out.args;
    }else {
        block.message0 = out.toString();
    }
    autoBlocks.push(block);
}

console.log(autoBlocks);

const toolboxContents = [];

for (let b of autoBlocks) {
    const def = {}
    def.kind = 'block';
    def.type = b.type;
    toolboxContents.push(def);
}

console.log(toolboxContents);



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