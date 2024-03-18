console.log("hello");
import file from './essenceBNF.txt';
import * as Blockly from 'blockly';
console.log(typeof(file))
let lines = file.split("\r\n");

let comment = /^!/;
let usable = [];
for (let s of lines){
    if (! (comment.test(s)) & (s != '')) {
        usable.push(s);
    }
}

console.log(usable);

let blockArray = []

let def = /\w+(?= :=)/;

for (let b of usable){
    let name = def.exec(b);
    console.log(name[0]);
    let definition = b.slice(b.indexOf("=") + 1)
    console.log(definition);
    let quoted = /\"[\w\:\s]*\"/g;
    let matches = definition.matchAll(quoted);
    let replaced = definition.replaceAll(quoted, "#");
    console.log(replaced);
    let argsTypes = replaced.matchAll(/\w+/g); 
    let argsReplaced = replaced;
    let count = 1;
    let args = []
    for (let a of argsTypes){
        argsReplaced = argsReplaced.replace(/([A-Z]|[a-z])+/, `%${count}`);
        //console.log("type: "+ JSON.stringify(a));
        //console.log(typeof(a));
        args.push(a[0].trim());
        count++;
    }
    
    console.log(argsReplaced);
    let message = argsReplaced;
    for (let m of matches) {
        message = message.replace(/#/, m);
    }
    message = message.replaceAll(/"/g, "");
    console.log("message" + message);
    blockArray.push(createBlockJSON(name[0].trim(), message.trim(), args));
}

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray(blockArray);
//auto gen this too soon.
export const toolbox = {
    'kind': 'flyoutToolbox',
    'contents': [
        {
            'kind': 'block',
            'type': 'FindStatement'
        }, 
        {
            'kind': 'block',
            'type': 'GivenStatement'
        },
        {
            'kind': 'block',
            'type': 'GivenEnum'
        }
    ]
}

function createBlockJSON(name, message, args){
    let jsonArgs = [];
    for (let a of args){
        jsonArgs.push({
            "type": "input_value",
            "name": a
        })
    }
    // change args names to check types later?
   return {
        "type": name,
        "message0": message,
        "args0": jsonArgs,
        "output": null,
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 210,
        "tooltip": "",
        "helpUrl": ""
      }
}