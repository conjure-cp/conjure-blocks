import * as Blockly from 'blockly';
import {essenceGenerator} from "./blocks/automatedBlocks";
import { generatorRegistry } from "./generators/blockGenerators";

let mutatorCount = 0;
let autoBlockCount = 0;
export const autoBlocks = [];


function addMutator(inputType, connector) {

  // list helper and mutator - adapted from "list_create_with" block
  let helper = function() {
      this.itemCount_ = 1;
      // checks if first inner block has been added, prevnts duplicate inner blocks. 
      this.firstAdded = false;
    }

  const name = 'list_mutator'+mutatorCount

  Blockly.Extensions.registerMutator(
      name,
      {
        
          loadExtraState: function(state) {
          this.itemCount_ = state['itemCount'];
          this.firstAdded = state.firstAdded;
          // This is a helper function which adds or removes inputs from the block.
          this.updateShape_();
        },

        saveExtraState: function () {
          return {
            'itemCount': this.itemCount_,
            'firstAdded': this.firstAdded,
          };
        },
              // These are the decompose and compose functions for the lists_create_with block.
        decompose: function(workspace) {
          // This is a special sub-block that only gets created in the mutator UI.
          // It acts as our "top block"
          let topBlock = workspace.newBlock('lists_create_with_container');
          topBlock.initSvg();

          // Then we add one sub-block for each item in the list.
          let connection = topBlock.getInput('STACK').connection;
          for (let i = 0; i < this.itemCount_; i++) {
            let itemBlock = workspace.newBlock('lists_create_with_item');
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
          let itemBlock = topBlock.getInputTargetBlock('STACK');

          // Then we collect up all of the connections of on our main block that are
          // referenced by our sub-blocks.
          // This relates to the saveConnections hook (explained below).
          let connections = [];
          while (itemBlock && !itemBlock.isInsertionMarker()) {  // Ignore insertion markers!
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
          }

          // Then we disconnect any children where the sub-block associated with that
          // child has been deleted/removed from the stack.
          for (let i = 0; i < this.itemCount_; i++) {
            let connection = this.getInput('ADD' + i).connection.targetConnection;
            if (connection && connections.indexOf(connection) === -1) {
              connection.disconnect();
            }
          }

          // Then we update the shape of our block (removing or adding iputs as necessary).
          // `this` refers to the main block.
          this.itemCount_ = connections.length;
          this.updateShape_();
          
          let ws = Blockly.getMainWorkspace();
          // And finally we reconnect any child blocks.
          for (let i = 0; i < this.itemCount_; i++) {
            if (connections[i]){
              connections[i].reconnect(this, 'ADD' + i);
            } else {
              // add inner block if possible, if children not already there
              if (inputType !== "variable" && isBlock(inputType)){
                  let stmt = ws.newBlock(inputType);
                  stmt.initSvg();
                  let out = stmt.outputConnection
                  out.reconnect(this, "ADD"+ i)
                  ws.render();
                  this.firstAdded = true;
              }
            }
          }
        },

        saveConnections: function (topBlock) {
          // First we get the first sub-block (which represents an input on our main block).
            var itemBlock = topBlock.getInputTargetBlock('STACK');

            // Then we go through and assign references to connections on our main block
            // (input.connection.targetConnection) to properties on our sub blocks
            // (itemBlock.valueConnection_).
            var i = 0;
            while (itemBlock) {
              // `this` refers to the main block (which is being "mutated").
              var input = this.getInput('ADD' + i);
              // This is the important line of this function!
              itemBlock.valueConnection_ = input && input.connection.targetConnection;
              i++;
              itemBlock = itemBlock.nextConnection &&
                  itemBlock.nextConnection.targetBlock();
            }
        },
        updateShape_: function () {
          if (this.itemCount_ && this.getInput('EMPTY')) {
            this.removeInput('EMPTY');
          } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
            this.appendDummyInput('EMPTY').appendField(
              '',
            );
          }
          
      
          // Add new inputs.
          for (let i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
             let input = null;
             if (i === 0) {
                input = this.appendValueInput('ADD' + i).setCheck(inputType).setAlign(Blockly.inputs.Align.RIGHT);             

              } else {
                input = this.appendValueInput('ADD' + i).setCheck(inputType).setAlign(Blockly.inputs.Align.RIGHT).appendField(connector, 'ADD' + i);
              }
            }
          }
          // Remove deleted inputs.
          for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {

            this.removeInput('ADD' + i);
          }

          // only add extra first inner block if not already added.
          if (!this.firstAdded){
              let ws = Blockly.getMainWorkspace();
              if (inputType !== "variable" && isBlock(inputType)){
                  let stmt = ws.newBlock(inputType);
                  stmt.initSvg();
                  let out = stmt.outputConnection
                  out.reconnect(this, "ADD0")
                  ws.render();
                  this.firstAdded = true;
              }
          }

        }},
      helper
        ,
      ["lists_create_with_item"] 
      );

  }

function findMutator() {

    // sets up the initial number of items
    let helper = function() {
        this.itemCount_ = 1; // this is the initial number. I.e. 'find [] : []'
    }

    /**
     * Mutators are a special mixin so must be first registered. This is the function signature
     */
    Blockly.Extensions.registerMutator(
        `list_mutator${mutatorCount}`, // string associated with the mutator
        { // these are the mutator methods

            // These are the serialization hooks for the lists_create_with block.
            saveExtraState: function() {
                return { 'itemCount': this.itemCount_ };
            },

            // updates the shape when we extend/reduce the list
            loadExtraState: function(state) {
                this.itemCount_ = state['itemCount'];
                this.updateShape();
            },

            /**
             * 'Explodes' the block into smaller sub blocks that can be moved around, added, and deleted
             * @return topBlock
             */
            decompose: function(workspace) {
                // special sub block that gets created in the mutator UI
                let topBlock = workspace.newBlock('lists_create_with_container');
                topBlock.initSvg() // create SVG representation of the block

                // add a sub block for each item in the list
                let connection = topBlock.getInput('STACK').connection;

                for (let i = 0; i < this.itemCount_; i++) {
                    let itemBlock = workspace.newBlock('lists_create_with_item');
                    itemBlock.initSvg();
                    connection.connect(itemBlock.previousConnection);
                    connection = itemBlock.nextConnection;
                }

                // return the top block
                return topBlock;
            },

            /**
             * Interprets the configuration of the sub-blocks and uses them to modify the main block.
             * @param topBlock
             */
            compose: function(topBlock) {
                // get the first sub block -- this is an input for the main block
                let itemBlock = topBlock.getInputTargetBlock('STACK');

                // create an array of connections -- this will store the connections to the main block from the sub-blocks
                let connections = [];
                while (itemBlock && !itemBlock.isInsertionMarker()) {
                    // add the connection to the array
                    connections.push({
                        varConn: itemBlock.varConnection_, // variable connection
                        domConn: itemBlock.domConnection_, // domain connection
                    });

                    itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
                }

                // disconnect children from the sub block that have been deleted/removed
                for (let i = 0; i < this.itemCount_; i++) {
                    // get the variable and domain connections
                    let varInput = this.getInput('VAR' + i);
                    let domInput = this.getInput('DOM' + i);

                    // is the variable input not null?
                    if (varInput) {
                        let conn = varInput.connection.targetConnection;

                        // if we can find the connection then disconnect it
                        if (conn && !connections.find((c, idx) => idx === i && c.varConn === conn)) {
                            conn.disconnect();
                        }
                    }

                    // is the domain input not null?
                    if (domInput) {
                        let conn = domInput.connection.targetConnection;

                        // if we can find the connection, then disconnect it
                        if (conn && !connections.find((c, idx) => idx === i && c.domConn === conn)) {
                            conn.disconnect();
                        }
                    }
                }

                // update the block shape
                this.itemCount_ = connections.length;
                this.updateShape();

                // reconnect any child blocks (both variable and domain)
                for (let i = 0; i < this.itemCount_; i++) {
                    if (connections[i].varConn) connections[i].varConn.reconnect(this, 'VAR' + i);
                    if (connections[i].domConn) connections[i].domConn.reconnect(this, 'DOM' + i);
                }
            },

            /**
             * Lets you associate children of your main block with sub-blocks that exist in your mutator workspace
             * @param topBlock
             */
            saveConnections: function(topBlock) {
                // get the first sub-block (i.e. an input on our main block)
                let itemBlock = topBlock.getInputTargetBlock('STACK');

                // Assign references to connections on the main block
                let i = 0; // counter

                while (itemBlock) {
                    let varInput = this.getInput('VAR' + i);
                    let domInput = this.getInput('DOM' + i);

                    itemBlock.varConnection_ = varInput && varInput.connection.targetConnection;
                    itemBlock.domConnection_ = domInput && domInput.connection.targetConnection;
                    i++;

                    // move to the next connection
                    itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
                }
            },

            /**
             * Updates the shape of the block
             */
            updateShape: function() {
                // empty case
                if (this.itemCount_ && this.getInput('EMPTY')) {
                    // remove the empty input block
                    this.removeInput('EMPTY');
                } // is the itemCount 0 and input block not empty?
                else if (!this.itemCount_ && !this.getInput('EMPTY')) {
                    this.appendDummyInput('EMPTY').appendField('');
                }

                // Makes 'find [] : [], [] : []'
                for  (let i = 0; i < this.itemCount_; i++) {
                    if (!this.getInput('VAR' + i)) {
                        // first instance will be 'find'
                        if (i === 0) {
                            this.appendValueInput('VAR' + i)
                                .setCheck(['variable_list', 'variable'])
                        }
                        else {
                            this.appendValueInput('VAR' + i)
                                .setCheck(['variable_list', 'variable'])
                                .appendField(',');
                        }
                    }

                    if (!this.getInput('DOM' + i)) {
                        this.appendValueInput('DOM' + i)
                            .setCheck('domain')
                            .appendField(':');               // ': [DOM0]'
                    }
                }

                for (let i = this.itemCount_; this.getInput('VAR' + i); i++) {
                    this.removeInput('VAR' + i);
                    this.removeInput('DOM' + i);
                }
            }
        },
        helper,
        ["lists_create_with_item"]
    );

    // overridden generator
    generatorRegistry.register(function(type) {
        essenceGenerator.forBlock[type] = function(block, generator) {
            // stores the domain, variable pairs
            const pairs = [];

            // iterate through every item
            for(let i = 0; i < block.itemCount_; i++) {
                const varCode = generator.valueToCode(block, 'VAR' + i, 0) || '';
                const domCode = generator.valueToCode(block, 'DOM' + i, 0) || '';
                pairs.push(`${varCode} : ${domCode}`);
            }

            const code = 'find ' + pairs.join(', ');

            // allows the chaining with the next program block
            if (block.nextConnection && block.nextConnection.getCheck()?.[0] === 'program') {
                const next = generator.blockToCode(block.getNextBlock());
                return code + '\n' + next;
            }

            return [code, 0];
        }
    })
}

function registerAutoBlock(def) {
  const type = "auto_block_" + autoBlockCount++;

  Blockly.Blocks[type] = {
    init: function () {
      this.jsonInit({
        type: type,
        message0: def.message,
        args0: def.args,
        output: null,
      })
    }
  }

  autoBlocks.push({ type });

  return type;
}

export const seq = function(...args) {
    let argCount = 1;
    const argOut = [];
    let message = "";
    let out = {}
    for (let a of args) {
        // builds message and args list
        if (typeof(a) === "function") {
            message = message.concat("%"+argCount+" ");
            if (a.name.endsWith("_list")){
              argOut.push({
                "type": "input_value",
                "name":"TEMP"+argCount,
                "check": [a.name, a.name.substring(0,a.name.length-5)]
              })
            } else {
                argOut.push({
                    "type": "input_value",
                    "name":"TEMP"+argCount,
                    "check": a.name
                })
            }
            argCount ++;
        } else if (a.constructor.name === "Array") {
            message = message.concat("%"+argCount+" ");
            argOut.push({
                "type": "input_value",
                "name":"TEMP"+argCount,
                "check": a
            })
            argCount ++;
        
        } else if (typeof(a) === "object" && a.constructor.name !== "RegExp" && a.constructor.name !== "Array") {
            // merge 2 block JSON together.
            const addedArgs = a.args;
            let addedMessage = a.message;
            for (let i = 0; i < addedArgs.length; i++){
                addedMessage = addedMessage.replace("%"+(i+1), "%"+argCount);
                const newArg = addedArgs[i];
                newArg.name = "TEMP"+argCount;
                argOut.push(newArg);
                argCount++;
            }
            message = message.concat(addedMessage + " ");
            Object.assign(out, a);
        } else {
            message = message.concat(a + " ");
        }
    }
    
    out["message"] =  message.trimEnd();
    out["args"] = argOut;

    return out;
};

/**
 * Represent the different states a repeated block might take.
 */
export const categories = Object.freeze({ 
      PROGRAM: 0,
      LIST: 1,
      OPERATION: 2,
      FIND: 3,
});

export const repeat = function(arg, category) {
    console.log(arg);

    if (typeof arg === "function") {
      arg = arg(rules); // evaluate it
    }

    // Check the category
    switch(category) {
      case categories.PROGRAM: // programs contain multiple arguments. For example: "%1 : %2" or "%1 be %2 %3"
        addMutator(arg, ",");
        break;
      case categories.LIST: // list contain a singular argument For example: "%1 ,"
        addMutator(arg, ",");
        break;
      case categories.OPERATION:
        addMutator(arg, "");
        break;
      case categories.FIND:
        findMutator();
        break;
      default: 
        console.error(`The category '${category}' does not exist in categories.`);
    }

    mutatorCount++;

    return {
        'message': "",
        "args": [],
        'helpUrl': '%{BKY_LISTS_CREATE_WITH_HELPURL}',
        "extraState": {
            "itemCount": 1// or whatever the count is
          },
        // These are the serialization hooks for the lists_create_with block.
        'mutator': 'list_mutator'+ (mutatorCount-1)
      }

};

export const choice = function(...args) {
    // drop down only if all strings
    const options = [];
    const contents = [];
    for (let a of args){
        if (typeof(a) === "string") {
            options.push([a, a]);
        } else{
            // is a block, so a tool box category
            contents.push(a.name);
        }
    }
    if (options.length !== 0){
        return {
            "message": "%1 ",
            "args": [{
                "type": "field_dropdown",
                "name": "OPTION",
                "options": options
            }]
        }
    } else {
        return contents;
    }
    
};

export const optional = function(arg) {
    // as optional, just return anyway
    return arg;
};

let prec = function(number, rule) {
    // sets precedence
    rule["prec"] = number;
    return rule;
}
    
prec.left = function (rule, number=0) {
        // ignoring as number precedence provided in grammar
        return rule
    };

prec.right = function (rule, number=0) {
        // ignoring as number precedence provided in grammar
        return rule
    };

export {prec};

let isBlock = function (block) {
  for (let b of autoBlocks){
    if (b.type === block) {
      return true
    }
  }
  return false

}
    


