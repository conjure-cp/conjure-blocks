import * as Blockly from 'blockly';
import {grammar} from '../grammar';
export const essenceGenerator = new Blockly.Generator('essence');

const rules = grammar.rules;
const autoBlocks = [];
const toolboxContents = [];

console.log(rules);
// testing list block - copied + fit in list block code 
autoBlocks.push({
    'type': 'lists_create_empty',
    'message0': 'list',
    "args0": [
    ],
    'output': 'Array',
    'style': 'list_blocks',
    'tooltip': '%{BKY_LISTS_CREATE_WITH_TOOLTIP}',
    'helpUrl': '%{BKY_LISTS_CREATE_WITH_HELPURL}',
    "extraState": {
    "itemCount": 3 // or whatever the count is
  },
    // These are the serialization hooks for the lists_create_with block.
    'mutator': 'list_mutator'
  },)

  autoBlocks.push({
    'type': 'list_item',
    'message0':'blah',
    'args0': [
    ],
    'nextStatement': null,
    'previousStatement': null,
    'colour':100
  })

  var helper = function() {
    this.itemCount_ = 1;
    this.updateShape_();
  }

  Blockly.Extensions.registerMutator(
    'list_mutator',
    {saveExtraState: function() {
        return {
          'itemCount': this.itemCount_,
        };
      },
      
        loadExtraState: function(state) {
        this.itemCount_ = state['itemCount'];
        // This is a helper function which adds or removes inputs from the block.
        this.updateShape_();
      },
      saveExtraState: function (itemCount) {
        return {
          'itemCount': this.itemCount_,
        };
      },
            // These are the decompose and compose functions for the lists_create_with block.
      decompose: function(workspace) {
        // This is a special sub-block that only gets created in the mutator UI.
        // It acts as our "top block"
        var topBlock = workspace.newBlock('lists_create_with_container');
        topBlock.initSvg();

        // Then we add one sub-block for each item in the list.
        var connection = topBlock.getInput('STACK').connection;
        for (var i = 0; i < this.itemCount_; i++) {
          var itemBlock = workspace.newBlock('lists_create_with_item');
          itemBlock.initSvg();
          connection.connect(itemBlock.previousConnection);
          connection = itemBlock.nextConnection;
        }

        // And finally we have to return the top-block.
        return topBlock;
      },

      // The container block is the top-block returned by decompose.
      compose: function(topBlock) {
        // First we get the first sub-block (which represents an input on our main block).
        var itemBlock = topBlock.getInputTargetBlock('STACK');

        // Then we collect up all of the connections of on our main block that are
        // referenced by our sub-blocks.
        // This relates to the saveConnections hook (explained below).
        var connections = [];
        while (itemBlock && !itemBlock.isInsertionMarker()) {  // Ignore insertion markers!
          connections.push(itemBlock.valueConnection_);
          itemBlock = itemBlock.nextConnection &&
              itemBlock.nextConnection.targetBlock();
        }

        // Then we disconnect any children where the sub-block associated with that
        // child has been deleted/removed from the stack.
        for (var i = 0; i < this.itemCount_; i++) {
          var connection = this.getInput('ADD' + i).connection.targetConnection;
          if (connection && connections.indexOf(connection) == -1) {
            connection.disconnect();
          }
        }

        // Then we update the shape of our block (removing or adding iputs as necessary).
        // `this` refers to the main block.
        this.itemCount_ = connections.length;
        this.updateShape_();

        // And finally we reconnect any child blocks.
        console.log(connections);
        for (var i = 0; i < this.itemCount_; i++) {
          if (connections[i]){
            connections[i].reconnect(this, 'ADD' + i);
          }
        }
      },
      saveConnections: function (containerBlock) {
        let itemBlock = containerBlock.getInputTargetBlock(
          'STACK',
        );
        let i = 0;
        while (itemBlock) {
          if (itemBlock.isInsertionMarker()) {
            itemBlock = itemBlock.getNextBlock();
            continue;
          }
          const input = this.getInput('ADD' + i);
          itemBlock.valueConnection_ = input.connection.targetConnection;
          itemBlock = itemBlock.getNextBlock();
        }
      },
      updateShape_: function () {
        if (this.itemCount_ && this.getInput('EMPTY')) {
          this.removeInput('EMPTY');
        } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
          this.appendDummyInput('EMPTY').appendField(
            'LIST_1',
          );
        }
        // Add new inputs.
        for (let i = 0; i < this.itemCount_; i++) {
          if (!this.getInput('ADD' + i)) {
            const input = this.appendValueInput('ADD' + i).setAlign(Blockly.inputs.Align.RIGHT);
            if (i === 0) {
              input.appendField('');
            }
          }
        }
        // Remove deleted inputs.
        for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
          this.removeInput('ADD' + i);
        }
      }},
     helper
      ,
    ["list_item"]
    );

essenceGenerator.forBlock['lists_create_empty'] = function(block, generator) {
    return ['list', 0]
}

//defining blocks
let categories = {};
for (let r in rules){
    let out = rules[r](rules);
    const block = {};
    block.type = r;
    block.output = [r]; 
    block.inputsInline = true;
    if (out.constructor.name === "Object"){
        // normal block
        block.message0 = out.message;
        block.args0 = out.args;
        generatorFunction(block.type, block.message0, block.args0, out.prec);
        autoBlocks.push(block);
    }else if (out.constructor.name === "RegExp"){
        // regex value block
        regexBlock(block.type, out);  
    } else if (out.constructor.name === "Array"){
        categories[r] = out;
    } else {
        // toolbox category
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

// put blocks into categories - currently just merges subcategories, but should include as subcategory later
// also need to later remove blocks from all category that is in a category
for (let c in categories) {
    const def = {}
    def.kind = 'category';
    def.name = c;
    def.contents = categories[c];
    for (let d of def.contents) {
        if (categories[d]){
            const subCat = categories[d];
            def.contents = def.contents.filter((x) => x != d);
            def.contents.concat(subCat);
            categories[c].push(...subCat);
        }
    }
    def.contents = def.contents.map((x) => {return {
        'kind':'block',
        'type': x
    };});
    toolboxContents.push(def);
}

// update output types in blocks, for the categories they are in
console.log(categories);
for (let b of autoBlocks){
    for (let c in categories){;
        if (categories[c].includes(b.type)){
            b.output.push(c);
        }
    }
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

import { listblocks } from '../predefinedFunctions';
console.log(listblocks);
// creates block list form JSON definitons
export const essenceBlocks = Blockly.common.createBlockDefinitionsFromJsonArray(autoBlocks);