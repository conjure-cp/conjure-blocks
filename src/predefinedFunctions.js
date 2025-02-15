import {grammar} from '../src/grammar';

export const seq = function(...args) {
    let argCount = 1;
    const argOut = [];
    let message = "";
    for (let a of args) {
        if (typeof(a) === "function") {
            message = message.concat("%"+argCount+" ");
            argOut.push({
                "type": "input_value",
                "name":"TEMP"+argCount
            })
            argCount ++;
        } else if (typeof(a) === "object" && a.constructor.name != "RegExp") {
            // merge 2 block JSON together.
            const addedArgs = a.args;
            let addedMessage = a.message;
            for (let i = 0; i < addedArgs.length; i++){
                addedMessage = addedMessage.replace("%"+(i+1), "%"+argCount);
                argOut.push({
                    "type": "input_value",
                    "name":"TEMP"+argCount
                })
                argCount++;
            }
            message = message.concat(addedMessage + " ");
        } else {
            message = message.concat(a + " ");
        }
    }
    
    return {"message" : message.trimEnd(),
        "args": argOut};
};

export const repeat = function(arg) {
    return "repeat called"
};

export const choice = function(...args) {
    return "choice called"
};

export const token = function(arg) {
    return "token called"
};

export const field = function(name, rule) {
    return "field called"
};

export const optional = function(arg) {
    // as optional, just return anyway
    return arg;
};


export const prec = function(number, rule) {
    return "prec called"
};

prec.left = function(...args) {
    return "prec left called"
};

prec.right = function(...args) {
    return "prec right called"
};

