import file from './essenceBNF.txt';
import * as Blockly from 'blockly';
import {essenceGen} from '../generators/essence';
export const essenceGenerator = essenceGen;


let stages = ["statements", "values", "categories"];
let stage = stages[0];

let blockArray = [];
let usedBlocks  = [];
let categories = {};

let usableLines = getUsableLines();

for (let b of usableLines){
    if (b == "=====") {
        stage = stages[stages.indexOf(stage) + 1];
        continue;
    }

   
   
    let def = /\w+(?= :=)/;
    let name = def.exec(b);
    let definitions = getDefinitions(b);
   
    if (stage == "statements" || stage == "values") {
        let index = 1;
        for (let definition of definitions){
            // get list part and remove
            definition = dealWithLists(definition);
            let metadata = getMessageAndArgs(definition);
            let message = metadata[0];
            let args = metadata[1];
            
            // diff block types
            if (stage == "statements") {
                blockArray.push(createBlockJSON(name[0].trim()+index, message.trim(), args));
                addTranslation(name[0].trim()+index, args, message.trim());
            } else if (stage == "values") {
                blockArray.push(createValueJSON(name[0].trim()+index, message.trim(), args));
                addValueTranslation(name[0].trim()+index, args, message.trim());
            }
            
            index++;
        }
    } else {
        let contents = [];
        for (let d of definitions) {
            d = d.trim();
            if (categories[d] == null){
                for (let b of blockArray) {
                    if (b.type.startsWith(d)) {
                        contents.push({
                        "kind" : "block",
                        "type": b.type
                        });
                        usedBlocks.push(b);
                    }
                }   
            } else {
                contents.push({
                    "kind": "category",
                    "name": d,
                    "contents": categories[d]
                })
                categories[d] = null;
                
            }
        }
        let type = name[0].trim();
        categories[type] = contents;        
    }
}

let toolboxJSON = getToolBoxJSON();
export const toolbox = toolboxJSON;
addTypeChecks();
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray(blockArray);

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
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 210,
        "tooltip": "",
        "helpUrl": ""
      };
}

function createValueJSON(name, message, args){
    let jsonArgs = [];
    for (let a of args){
        let json = { 
            "type": "input_value",
            "name": a,
        }
        if (a == "Array"){
            json.check = "Array";
        }

        jsonArgs.push(json);
    };

    return {
        "type": name,
        "message0": message,
        "args0": jsonArgs,
        "output": name,
        "inputsInline": true,
        "colour": 290,
        "tooltip": "",
        "helpUrl": ""
    }
}

function addTranslation(name, args, message){
    essenceGenerator.forBlock[name] = function (block, generator) {
        let code = message;
        for (let i = 1; i <= args.length; i++) {
              // no precedence currently
            code = code.replace(`%${i}`, `${generator.valueToCode(block, args[i-1], 0)}`);
        }
        return code;
    };
}

function addValueTranslation(name, args, message){
    essenceGenerator.forBlock[name] = function (block, generator) {
        let code = message;
        for (let i = 1; i <= args.length; i++) {
              // no precedence currently
            code = code.replace(`%${i}`, `${generator.valueToCode(block, args[i-1], 0)}`);
        }
        return [code, 0];
    };
}

function getToolBoxJSON() {
    let othercontent = [];
    for (let b of blockArray){
        if (!(usedBlocks.includes(b))){
            othercontent.push({
                "kind": "block",
                "type": b.type
            });
        }
    }

    let toolbox = {
        "kind": "categoryToolbox",
        "contents": [
            {
                "kind": "category",
                "name": "core",
                "contents": [
                    {
                        'kind': 'block',
                        'type': 'math_number'
                    },
                    {
                        'kind': 'block',
                        'type': 'lists_create_with'
                    }
                ]
            },
            {
                "kind": "category",
                "name": "other",
                "contents": othercontent
            }
        ]

    };

    for (let c in categories){
        toolbox.contents.push({
            "kind": "category",
            "name": c,
            "contents": categories[c]
        });
    }
    return toolbox;
}

function addTypeChecks() {
    for (let b of blockArray){
        let inputTypes = [];
        for (let a of b.args0){
            let type = a.name;
            // adds all 
            if (categories[type] != null){
                for (let t in categories[type]){
                    inputTypes.push(t.type);
                }
            } else {
                for (let bl of blockArray){
                    if (bl.type.startsWith(type)){
                        inputTypes.push(bl.type);
                    }
                }
            }
            if (inputTypes.length > 0){
                a['check'] = inputTypes;
            }
            
        }
    }
}

function getUsableLines() {
    let lines = file.split("\r\n");
    let comment = /^!/;
    let usable = [];
    for (let s of lines){
        if (! (comment.test(s)) & (s.trim() != '')) {
            usable.push(s);
        }
    }

    return usable;
}

function getDefinitions(line) {
    let allDefinitions = line.slice(line.indexOf("=") + 1);
    let definitions = allDefinitions.split("|");
    return definitions;
}

function dealWithLists(definition) {
    let list = /list\([\w\d\s,"{}\[\]\(\)]+\)/g;
    let lists = definition.matchAll(list);
    let newList;
    for (let l of lists){
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
    return definition;
}

function getMessageAndArgs(definition){
    let quoted = /\"[\w\:\s\(\)\.]*\"/g;
    let matches = definition.matchAll(quoted);
    // replace quoted parts with #, so can replace words not # into arg stand ins - %1 etc (and get the type for them)
    let replaced = definition.replaceAll(quoted, "#");
    let argsTypes = replaced.matchAll(/\w+/g); 
    let argsReplaced = replaced;
    let count = 1;
    let args = []
    for (let a of argsTypes){
        argsReplaced = argsReplaced.replace(/([A-Z]|[a-z])+/, `%${count}`);
        args.push(a[0].trim());
        count++;
    }
    
    // replace the text back into the message
    let message = argsReplaced;
    for (let m of matches) {
        message = message.replace(/#/, m);
    }
    message = message.replaceAll(/"/g, "");
    return [message, args];
}