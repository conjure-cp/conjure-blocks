export const seq = function(...args) {
    const argCount = 1;
    const messageArgs = [];
    let message = "";
    for (let a of args) {
        if (typeof(a) == Function) {
            message = message.concat("$"+argCount+" ");
            messageArgs.push({
                "type": "input_value",
                "name": "VALUE"
            });
            argCount ++;
        }else{
            message = message.concat(a + " ");
        }
    }
    
    return {
        "message": message.trimEnd(),
        "args": messageArgs
    };
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
    return "optional called"
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

