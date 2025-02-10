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


export const prec = function(number, rule) {
    return "prec called"
};

prec.left = function(...args) {
    return "prec left called"
};





export const basic = {"expression": "e", "find_statement_list": "f", "constraint_list": "c", "integer": "i", "TRUE": "t", "FALSE":"f","identifier":"id", "find_statement":"f", "variable_list":"vl", "domain":"d", "variable":"v", "bool_domain":"bd", "int_domain": "int", "range_list":"r", "int_range":"intr", "unary_minus_expr":"neg", "or_expr":"or", "and_expr":"and", "comparison":"cmp", "math_expr":"math", "not_expr":"not", "sub_expr":"sub", "min":"min", "max":"max", "sum":"sum", "allDiff":"diff", "constant":"const", "abs_value":"abs"  };