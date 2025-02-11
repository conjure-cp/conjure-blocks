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

console.log(autoBlocks)

export default autoBlocks;