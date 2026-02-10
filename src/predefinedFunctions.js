import * as Blockly from 'blockly';
let mutatorCount = 0;
export const autoBlocks = [];

function addMutator(inputType, connector) {

  // list helper and mutator - adapted from "list_create_with" block
  var helper = function() {
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

        saveExtraState: function (itemCount) {
          return {
            'itemCount': this.itemCount_,
            'firstAdded': this.firstAdded,
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
          
          let ws = Blockly.getMainWorkspace();
          // And finally we reconnect any child blocks.
          for (var i = 0; i < this.itemCount_; i++) {
            if (connections[i]){
              connections[i].reconnect(this, 'ADD' + i);
            } else {
              // add inner block if possible, if children not already there
              if (inputType != "variable" & isBlock(inputType)){    
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
              if (inputType != "variable" & isBlock(inputType)){    
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
    
    out["message"] =  message;
    out["args"] = argOut;

    return out;
};

export const repeat = function(arg) {
    if (typeof(arg) == "function"){
      // add mutator to add extra slots to list- always , anyway - try to not to rely on hardcode.
      addMutator(arg.name, ", ")
    
    } else {
      const text = arg.message.replace(/%[0-9]+/, "")
      // from grammar can assume, only other option is of form seq(type, ",") - so can just check args and message
      console.log(text)
      addMutator(arg.args[0].check, text);
    }
  
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
    



