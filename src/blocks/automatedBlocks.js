import { blocks } from 'blockly/blocks';
import {grammar} from '../grammar';
const rules = grammar.rules;
const autoBlocks = [];
console.log(rules);

//console.log(rules.abs_value(basic));
//basic = {}
//console.log(rules.TRUE(rules))
for (let r in rules){
    //console.log(rules[r](rules))
    const block = {};
    block.type = r;
    block.message0 = rules[r](rules);
    block.output = null; 
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


export const essenceBlocks = autoBlocks;