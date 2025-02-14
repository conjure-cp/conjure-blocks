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
        }else{
            message = message.concat(a + " ");
        }
    }
    
    return {"message" : message.trimEnd(),
        "args": argOut};
};

export const repeat = function(arg) {
    return arg
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

