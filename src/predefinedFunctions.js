import * as Blockly from 'blockly';
let mutatorCount = 0;
let autoBlockCount = 0;
export const autoBlocks = [];


function addMutator(arg, connector) { // TODO: change this
  console.log(arg.args)

  // list helper and mutator - adapted from "list_create_with" block
  var helper = function() {
      this.itemCount_ = 1; // default length depends on the number of args provided.
      this.partCount_ = arg.args.length;
  }

  const name = 'list_mutator'+mutatorCount // creates a unique name for the mutator

  Blockly.Extensions.registerMutator(
      name,
      {
          loadExtraState: function(state) {
          this.itemCount_ = state['itemCount'];
          this.updateShape_(); // Helper function. Adds or removes inputs from the block.
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
          const topBlock = workspace.newBlock('lists_create_with_container');
          topBlock.initSvg();

          // Then we add one sub-block for each item in the list.
          let connection = topBlock.getInput('STACK').connection;

          for (let i = 0; i < this.itemCount_; i++) {
            const itemBlock = workspace.newBlock('lists_create_with_item');
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
          let count = 0;

          while (itemBlock && !itemBlock.isInsertionMarker()) {  // Ignore insertion markers!
            count++;

            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
          }

          this.itemCount_ = count;
          this.updateShape_();
        },

        updateShape_: function () {
          let i = 0;

          while (this.getInput('ADD0_' + i)) {
            for (let j = 0; j < this.partCount_; j++) {
              if (this.getInput(`ADD${i}_${j}`)) {
                this.removeInput(`ADD${i}_${j}`);
              }
            }
            i++;
          }

          // Rebuild structure
          for (let i = 0; i < this.itemCount_; i++) {

            for (let j = 0; j < this.partCount_; j++) {

              const argDef = arg.args[j];

              let input = this.appendValueInput(`ADD${i}_${j}`)
                .setAlign(Blockly.inputs.Align.RIGHT)
                .setCheck(argDef.check || null);

              // Add text between inputs (like ":")
              if (j > 0) {
                const text = arg.message
                  .split(/%\d+/)[j]
                  ?.trim();

                if (text) {
                  input.appendField(text);
                }
              }
            }

            // Add connector between items
            if (i > 0) {
              const firstInput = this.getInput(`ADD${i}_0`);
              if (firstInput) {
                firstInput.appendField(connector);
              }
            }
          }
        },

        saveConnections: function() {}
      },
      helper
        ,
      ["lists_create_with_item"] 
      );

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
        
        } else if (typeof(a) === "object" && a.constructor.name != "RegExp" && a.constructor.name != "Array") {
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
});

export const repeat = function(arg, category) {
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
        break
      default: 
        console.error(`The category '${category}' does not exist in categories.`);
    }



    
    // if (typeof(arg) == "function"){
    //   // joint not specified, presume comma
    //   addMutator(arg.name, ",")
    
    // } else {
    //   // Get text between block inputs
    //   let divider = arg.message
    //             .replace(/%\d+/g, "")
    //             .trim();
                
    //   console.log(`-${divider}-`)

    //   addMutator(arg.args[0].check, divider);
    // }
  
    mutatorCount++;

    return {
        'message': "",
        "args": [
        ],
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
    if (options.length != 0){
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
    if (b.type == block) {
      return true
    }
  }
  return false

}
    


