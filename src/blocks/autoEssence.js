import file from './essenceBNF.txt';
import * as Blockly from 'blockly';
import {essenceGen} from '../generators/essence';
export const essenceGenerator = essenceGen;
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
    let allDefinitions = b.slice(b.indexOf("=") + 1);
    let definitions = allDefinitions.split("|");
    let index = 1;
    for (let definition of definitions){
        console.log(definition);
        // get list part and remove
        let list = /list\([\w\d\s,"{}\[\]\(\)]+\)/g;
        let lists = definition.matchAll(list);
        let newList;
        for (let l of lists){
            console.log("lists: ", l)
            if (l[0].includes("{}")){
                newList = "{Array}";
            } else if (l[0].includes("[]")){
                newList = "[Array]";
            } else if (l[0].includes("()")){
                newList = "(Array)";
            } else {
                newList = "Array";
            }
        };
        

        definition = definition.replaceAll(list, newList);
        console.log("def without list", definition);
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
        blockArray.push(createBlockJSON(name[0].trim()+index, message.trim(), args));
        addTranslation(name[0].trim()+index, args, message.trim());
        index++;
    }
}


export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray(blockArray);
//auto gen this too soon.
export const toolbox = {
    'kind': 'flyoutToolbox',
    'contents': [
        {
            'kind': 'block',
            'type': 'FindStatement1'
        }, 
        {
            'kind': 'block',
            'type': 'GivenStatement1'
        },
        {
            'kind': 'block',
            'type': 'GivenEnum1'
        }, 
        {
            'kind': 'block', 
            'type': 'LettingEnum1'
        },
        {
            'kind': 'block',
            'type': 'LettingUnnamed1'
        }, 
        {
            'kind': 'block',
            'type': 'lists_create_with'
        },
        {
            'kind': 'block',
            'type': 'math_number'
        },
        {
            'kind': 'block',
            'type': 'LettingStatement1'
        },
        {
            'kind': 'block',
            'type': 'LettingStatement2'
        }
    ]
}

function createBlockJSON(name, message, args){
    let jsonArgs = [];
    for (let a of args){
        let json = { 
            "type": "input_value",
            "name": a
        }
        if (a == "Array"){
            json.check = "Array";
        }

        jsonArgs.push(json);
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

function addTranslation(name, args, message){
    essenceGenerator.forBlock[name] = function (block, generator) {
        console.log("block: ", name);
        console.log("args: ", args);
        let code = message;
        console.log(args[0]);
        for (let i = 1; i <= args.length; i++) {
              // no precedence currently
            code = code.replace(`%${i}`, `${generator.valueToCode(block, args[i-1], 0)}`);
        }
        console.log("code " + code);
        return code;
    };
}
