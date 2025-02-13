import * as Blockly from 'blockly';
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
    let item = rules[r](rules);
    if (typeof(item) != String){
        console.log(item)
        block.message0 = item.message;
        block.args0 = item.args;
    } else {
        block.message0= item.toString();
    }
    block.type = r;
    block.output = r; 
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