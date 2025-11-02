import * as Blockly from 'blockly';
import {grammar} from '../grammar';
import { autoBlocks } from '../predefinedFunctions';
export const essenceGenerator = new Blockly.Generator('essence');

const rules = grammar.rules;

const toolboxContents = [];

//defining blocks
let categories = {};
for (let r in rules){
    let out = rules[r](rules);
    const block = {};
    block.type = r;
    block.output = [r]; 
    block.inputsInline = true
    // tooltips entry
    console.log('rule ' + r);
    block.tooltip = `Hello, I am a tool tip`;
    // check not variable/empty function essentially,skip
    if (!(out)){}
    else if (out.constructor.name === "Object"){
        // if block message ends with argument, likely more set up for longer input -so better not inline
        if (out.message.match(/%\d+$/gm)) {
            block.inputsInline = false;
          }
        // normal block
        block.message0 = out.message;
        block.args0 = out.args;
        // delete messgae and args to merge other out properties with block
        delete out.message;
        delete out.args;
        Object.assign(block, out);
        generatorFunction(block.type, block.message0, block.args0, out.prec);
        autoBlocks.push(block);
    }else if (out.constructor.name === "RegExp"){
        // regex value block
        regexBlock(block.type, out);  
    } else if (out.constructor.name === "Array"){
        // toolbox category
        categories[r] = out;
    } else {
        //constants
        block.message0 = out.toString();
        generatorFunction(block.type, block.message0, []);
        autoBlocks.push(block);
    }
    
}

// add blocks to toolbox 
for (let b of autoBlocks) {
    const def = {}
    def.kind = 'block';
    def.type = b.type;
    toolboxContents.push(def);
}

let subcategories = []
// put blocks into categories - currently just merges subcategories, but should include as subcategory later
// also need to later remove blocks from all category that is in a category
for (let c in categories) {
    const def = {}
    def.kind = 'category';
    def.name = c;
    def.contents = getContents(categories[c]);
    toolboxContents.push(def);
}

function getContents(blockList) {
    let contents = [];
    for (let b of blockList) {
        // is subcategory, the recurse.
        if (categories[b]) {
            let temp = categories[b];
            delete categories.b;
            contents.push({
                'kind': 'category',
                'name': b,
                'contents': getContents(temp)
            })
            subcategories.push(b)
        } else {
            if (b != "variable") {
                contents.push({
                    'kind': 'block',
                    'type': b
                })
            }
            
        }
    }

    return contents;
}

// remove subcategories from main categories list (remove duplicates)
for (let i = 0; i < toolboxContents.length; i++){
    for (let s of subcategories){
        if(toolboxContents[i].name == s){
            toolboxContents.splice(i,1);
            i--;
            break;
        }
    }
}

// update output types in blocks, for the categories they are in
let num_cats = Object.keys(categories).length;
for (let b of autoBlocks){
    let colour = 0;
    for (let c in categories){;
        // try to get colours evenly spread
        colour = colour + 360/num_cats;
        // update colours too
        if (categories[c].includes(b.type)){
            if (b.output) {
                 b.output.push(c);
            }
           
            // final colour depends on last category
            b.colour = colour;

            
            // check program category - change shape
            if (c == "program"){
                delete b.output;
                b.previousStatement = "program"
                b.nextStatement = "program"
            }
        }


    }
}



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

        // as repeat at end, lists after args 
        const values = [];
        for (let i = 0; i < block.itemCount_; i++) {
            const valueCode = generator.valueToCode(block, 'ADD' + i,
                0);
            if (valueCode) {
              values.push(valueCode);
            }
          }
          
        let valueString = values.join(`${block.getFieldValue("ADD1")}`);
        
          
          code = code.concat(` ${valueString}`);
        
        if (block.nextConnection && block.nextConnection.getCheck()[0] == 'program'){
            let next = generator.blockToCode(block.getNextBlock());
            return code + "\n" + next;
        }
        return [code, prec];
    }
}


// regex blocks 
function regexBlock(type, regex){
    Blockly.Blocks[type] = {
        init: function() {
          var validator = function(newValue) {
            const match = regex.exec(newValue);
            if (match == null || match[0] != newValue){
                return null;
            } else {
                return newValue;
            }
          };
          
          // stop gap for now - for initial value
          let temp = "0";
          if (!regex.test(temp)){
            temp = "a";
          }
      
          this.appendDummyInput()
              .appendField(new Blockly.FieldTextInput(temp, validator), 'INPUT');
              // currently hand written - can this be automated?
          this.setOutput(true, [type, "constant", "expression"]);
          this.setInputsInline(true);
        }
      };

    // add to toolbox
    toolboxContents.push ( {
    'kind': 'block',
    'type': type,
    })
    
    //generator
    essenceGenerator.forBlock[type] = function(block, generator) {
        const code = `${block.getFieldValue('INPUT')}`;
        return [code, 0];
    }
}

// variable getter blocks

autoBlocks.push( {
    "type": "variables_get_integer",
    "message0": "%1",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": "%{BKY_VARIABLES_DEFAULT_NAME}",
        "variableTypes": ["int_domain", "domain", "expression", "variable"],
        "defaultType": "int_domain"
      }
    ],
    "output": ["int_domain", "domain", "expression", "variable"]  
  });

autoBlocks.push( {
    "type": "variables_get_bool",
    "message0": "%1",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": "%{BKY_VARIABLES_DEFAULT_NAME}",
        "variableTypes": ["bool_domain", "domain", "expression", "variable"],
        "defaultType": "bool_domain"
      }
    ],
    "output": ["bool_domain", "domain", "expression", "variable"] ,
    "colour": 120
  });

  // toolbox definition
export const autoToolbox = {
    'kind': 'categoryToolbox',
    'contents': [
        {
            'kind': 'category',
            'name':'all',
            'contents': toolboxContents
        },
        {
            'kind': 'category',
            'name': 'Variables',
            'custom': 'CREATE_TYPED_VARIABLE'
        }
    ]
};

// block to add to list mutators
autoBlocks.push({
  'type': 'list_item',
  'message0':'blah',
  'args0': [
  ],
  'nextStatement': null,
  'previousStatement': null,
  'colour':100
})


// creates block list form JSON definitons
export const essenceBlocks = Blockly.common.createBlockDefinitionsFromJsonArray(autoBlocks);