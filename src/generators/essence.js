/**
 * Added by N-J-Martin
 */

import * as Blockly from 'blockly';
export const essenceGen= new Blockly.Generator('essence');

// change when need to sort out precedence
const Order = {
    ATOMIC: 0,
    COMPARISON: 400,
    OR: 110,
    AND: 120,
    IMPLY: 50,
    IFF: 50,
    FACTORIAL: 2000,
    EXPONENTION: 2001,
    NEGATION: 2000, 
    MULT_DIV: 700,
    MOD: 700,
    ADD_SUB: 600,
    ABSOLUTE: 2000


};

essenceGen.forBlock['math_number'] = function(block) {
    const code = String(block.getFieldValue('NUM'));
    return [code, Order.ATOMIC];
};


essenceGen.forBlock['text'] = function(block) {
    const textValue = block.getFieldValue('TEXT');
    const code = `${textValue}`;
    return [code, Order.ATOMIC];
};

essenceGen.forBlock['int_range'] = function(block, generator) {
    const ranges = generator.valueToCode(block, 'ranges', Order.ATOMIC);
    const code = `int (${ranges})`;
    return [code, Order.ATOMIC];
}

essenceGen.forBlock['range'] = function(block) {
    const start = block.getFieldValue('start');
    const end = block.getFieldValue('end');
    const code = `${start}..${end}`;
    return [code, Order.ATOMIC];
}

essenceGen.forBlock['int_expr'] = function(block, generator) {
    const val = generator.valueToCode(block, 'EXPR', Order.ATOMIC)
    var code;
    if (val != ''){
        code = `int(${val})`;
    } else {
        code = `int`;
    }
    return [code, Order.ATOMIC];
}

essenceGen.forBlock['letting_be_expr'] = function(block, generator) {
    const var_name = generator.valueToCode(block, "variable", Order.ATOMIC);
    const expr = generator.valueToCode(block, 'EXPR', Order.ATOMIC);
    const code = `letting ${var_name} be ${expr}`;
    return code;
}

essenceGen.forBlock['letting_be_domain'] = function(block, generator) {
    const var_name = generator.valueToCode(block, "variable", Order.ATOMIC);
    const domain = generator.valueToCode(block, 'DOMAIN', Order.ATOMIC);
    const code = `letting ${var_name} be domain ${domain}`;
    return code;
}

essenceGen.forBlock['find'] = function(block, generator) {
    const var_name = generator.valueToCode(block, "variable", Order.ATOMIC);
    const domain = generator.valueToCode(block, 'DOMAIN', Order.ATOMIC);
    const code = `find ${var_name} : ${domain}`;
    return code;
}

essenceGen.forBlock['given'] = function(block, generator) {
    const var_name = generator.valueToCode(block, "variable", Order.ATOMIC);
    const domain = generator.valueToCode(block, 'DOMAIN', Order.ATOMIC);
    const code = `given ${var_name} : ${domain}`;
    return code;
}

essenceGen.forBlock['given_enum'] = function(block, generator) {
    const var_name = generator.valueToCode(block, 'NAME', Order.ATOMIC);
    const code = `given ${var_name} new type enum`;
    return code;
}

essenceGen.forBlock['lists_create_with'] = function(block, generator) {
    const values = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const valueCode = generator.valueToCode(block, 'ADD' + i,
        Order.ATOMIC);
    if (valueCode) {
      values.push(valueCode);
    }
  }
  const valueString = values.join(', ');
  const codeString = `${valueString}`;
  return [codeString, Order.ATOMIC];
};

essenceGen.forBlock['letting_enum'] = function(block, generator) {
    const var_name = generator.valueToCode(block, 'NAME', Order.ATOMIC);
    const val_enum = generator.valueToCode(block, 'ENUM', Order.ATOMIC);
    const code = `letting ${var_name} be new type enum {${val_enum}}`;
    return code;
};

essenceGen.forBlock['letting_unnamed'] = function(block, generator) {
    const var_name = generator.valueToCode(block, 'NAME', Order.ATOMIC);
    const size = generator.valueToCode(block, 'size', Order.ATOMIC);
    const code = `letting ${var_name} be new type of size ${size}`;
    return code;
};

essenceGen.forBlock['such_that'] = function(block, generator) {
    const constraints = generator.valueToCode(block, 'CONSTRAINT', Order.ATOMIC);
    const code = `such that ${constraints}`;
    return code;
};

essenceGen.forBlock['where'] = function(block, generator) {
    const constraints = generator.valueToCode(block, 'CONSTRAINT', Order.ATOMIC);
    const code = `where ${constraints}`;
    return code;
}

essenceGen.forBlock['minimising'] = function(block, generator) {
    const value = generator.valueToCode(block, 'MIN', Order.ATOMIC);
    const code = `minimising ${value}`;
    return code;
}

essenceGen.forBlock['maximising'] = function(block, generator) {
    const value = generator.valueToCode(block, 'MAX', Order.ATOMIC);
    const code = `maximising ${value}`;
    return code;
};

essenceGen.forBlock['add_subtract'] = function(block, generator) {
    const operand1 = generator.valueToCode(block, 'operand1', Order.ATOMIC);
    const operand2 = generator.valueToCode(block, 'operand2', Order.ATOMIC);
    const op = block.getFieldValue('OPERATION')
    const code = `${operand1} ${op} ${operand2}`;
    return [code, Order.ADD_SUB];
};

essenceGen.forBlock['mult_div'] = function(block, generator) {
    const operand1 = generator.valueToCode(block, 'operand1', Order.ATOMIC);
    const operand2 = generator.valueToCode(block, 'operand2', Order.ATOMIC);
    const op = block.getFieldValue('OPERATION')
    const code = `${operand1} ${op} ${operand2}`;
    return [code, Order.MULT_DIV];
};

essenceGen.forBlock['mod'] = function(block, generator) {
    const operand1 = generator.valueToCode(block, 'operand1', Order.ATOMIC);
    const operand2 = generator.valueToCode(block, 'operand2', Order.ATOMIC);
    const code = `${operand1} % ${operand2}`;
    return [code, Order.MOD];
};

essenceGen.forBlock['exponent'] = function(block, generator) {
    const operand1 = generator.valueToCode(block, 'operand1', Order.ATOMIC);
    const operand2 = generator.valueToCode(block, 'operand2', Order.ATOMIC);
    const code = `${operand1} ** ${operand2}`;
    return [code, Order.EXPONENTION];
};

essenceGen.forBlock['negation'] = function(block, generator) {
    const operand1 = generator.valueToCode(block, 'operand1', Order.ATOMIC);
    const code = `-${operand1}`;
    return [code, Order.NEGATION];
};

essenceGen.forBlock['factorial'] = function(block, generator) {
    const operand1 = generator.valueToCode(block, 'operand1', Order.ATOMIC);
    const code = `!${operand1}`;
    return [code, Order.FACTORIAL];
};

essenceGen.forBlock['abs'] = function(block, generator) {
    const operand1 = generator.valueToCode(block, 'operand', Order.ATOMIC);
    const code = `|${operand1}|`;
    return [code, Order.ABSOLUTE];
};

essenceGen.forBlock['comparison'] = function(block, generator) {
    const operand1 = generator.valueToCode(block, 'operand1', Order.ATOMIC);
    const operand2 = generator.valueToCode(block, 'operand2', Order.ATOMIC);
    const comparator = block.getFieldValue("COMPARATOR");
    const code = `${operand1} ${comparator} ${operand2}`;
    return [code, Order.COMPARISON];
};

essenceGen.forBlock['logical_operator'] = function(block, generator) {
    const operand1 = generator.valueToCode(block, 'operand1', Order.ATOMIC);
    const operand2 = generator.valueToCode(block, 'operand2', Order.ATOMIC);
    const operator = block.getFieldValue("OPERATOR");
    const code = `${operand1} ${operator} ${operand2}`;
    var order;
    if (operator == "/\\") {
        order = Order.AND;
    } else if (operator == "\\/") {
        order = Order.OR;
    } else if (operator == "->") {
        order = Order.IMPLY;
    } else if (operator == "<->") {
        order = Order.IFF;
    }
    return [code, order];
};


essenceGen.scrub_ = function(block, code, thisOnly) {
    const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
      return code + '\n' + essenceGen.blockToCode(nextBlock);
    }
    return code;
};