export const seq = function(...args) {
    return "seq called"
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

prec.left = function(...args) {
    return "prec left called"
};

export const prec = function(number, rule) {
    return "prec called"
};




export const basic = {"expression": "e"};