import * as Blockly from 'blockly';
import {grammar} from '../grammar';
export const essenceGenerator = new Blockly.Generator('essence');

const rules = grammar.rules;
const autoBlocks = [];
const toolboxContents = [];

console.log(rules);

//defining blocks
let categories = {};
for (let r in rules){
    //console.log(rules[r](rules))
    let out = rules[r](rules);
    const block = {};
    block.type = r;
    block.output = r; 
    block.inputsInline = true;
    if (out.constructor.name === "Object"){
        block.message0 = out.message;
        block.args0 = out.args;
        generatorFunction(block.type, block.message0, block.args0, out.prec);
        autoBlocks.push(block);
    }else if (out.constructor.name === "RegExp"){
        regexBlock(block.type, out);  
    } else if (out.constructor.name === "Array"){
        categories[r] = out;
    } else {
        block.message0 = out.toString();
        generatorFunction(block.type, block.message0, []);
        autoBlocks.push(block);
    }
    
}

console.log(categories);
console.log(autoBlocks);

// add blocks to toolbox 


for (let b of autoBlocks) {
    const def = {}
    def.kind = 'block';
    def.type = b.type;
    toolboxContents.push(def);
}

for (let c in categories) {
    const def = {}
    def.kind = 'category';
    def.name = c;
    def.contents = categories[c];
    for (let d of def.contents) {
        if (categories[d]){
            const subCat = categories[d];
            delete categories.d;
            def.contents = def.contents.filter((x) => x != d);
            def.contents.concat(subCat);
        }
    }
    console.log(def.contents);
    def.contents = def.contents.map((x) => {return {
        'kind':'block',
        'type': x
    };});
    toolboxContents.push(def);
}


// add lists block

toolboxContents.push ( {
    'kind': 'block',
    'type': 'lists_create_with',
  })
console.log(toolboxContents);

// define generator function for blocks
function generatorFunction(type, message, args, prec=0){
    essenceGenerator.forBlock[type] = function (block, generator) {
        let code = message;
        for (let i = 1; i <= args.length; i++) {
            if (args[i-1].type === "field_dropdown"){
                code = code.replace(`%${i}`, `${block.getFieldValue(args[i-1].name)}`);
            } else {
                code = code.replace(`%${i}`, `${generator.valueToCode(block, args[i-1].name, 0)}`);
            }
        }
        return [code, prec];
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

// regex blocks 
function regexBlock(type, regex){
    Blockly.Blocks[type] = {
        init: function() {
          // Remove all 'a' characters from the text input's value.
          var validator = function(newValue) {
            const match = regex.exec(newValue);
            if (match == null || match[0] != newValue){
                return null;
            } else {
                return newValue;
            }
          };
          
          // stop gap for now
          let temp = "0";
          if (!regex.test(temp)){
            temp = "a";
          }
      
          this.appendDummyInput()
              .appendField(new Blockly.FieldTextInput(temp, validator), 'INPUT');
          this.setOutput(true, type);
          this.setInputsInline(true);
        }
      };

    toolboxContents.push ( {
    'kind': 'block',
    'type': type,
    })
    
    essenceGenerator.forBlock[type] = function(block, generator) {
        const code = `${block.getFieldValue('INPUT')}`;
        return [code, 0];
    }
}




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