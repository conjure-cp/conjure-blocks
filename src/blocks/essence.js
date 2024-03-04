/**
 * Added by N-J-Martin
 */

import * as Blockly from 'blockly';

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    "type": "int_range",
    "message0": "int in ranges %1",
    "args0": [
      {
        "type": "input_value",
        "name": "ranges",
        "check": "Array"
      }
    ],
    "output": null,
    "colour": 210,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "range",
    "message0": "%1 to %2",
    "args0": [
      {
        "type": "field_number",
        "name": "start",
        "value": 0,
        "min": -4611686000000000000,
        "max": 4611686000000000000
      },
      {
        "type": "field_number",
        "name": "end",
        "value": 0,
        "min": -4611686000000000000,
        "max": 4611686000000000000
      }
    ],
    "output": null,
    "colour": 210,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "int_expr",
    "message0": "int  %1",
    "args0": [
      {
        "type": "input_value",
        "name": "EXPR"
      }
    ],
    "output": null,
    "colour": 210,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "letting_be_expr",
    "message0": "letting %1 be %2",
    "args0": [
      {
        "type": "input_value",
        "name": "variable",
        "check": "int"
      },
      {
        "type": "input_value",
        "name": "EXPR"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  }, 
  {
    "type": "letting_be_domain",
    "message0": "letting %1 be domain %2",
    "args0": [
      {
        "type": "input_value",
        "name": "variable",
        "check": "int"
      },
      {
        "type": "input_value",
        "name": "DOMAIN"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "find",
    "message0": "find %1 in domain %2",
    "args0": [
      {
        "type": "input_value",
        "name": "variable",
        "check": "int"
      },
      {
        "type": "input_value",
        "name": "DOMAIN"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "given",
    "message0": "given %1 is %2",
    "args0": [
      {
        "type": "input_value",
        "name": "variable",
        "check": "int"
      },
      {
        "type": "input_value",
        "name": "DOMAIN"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "given_enum",
    "message0": "given  %1 is new type enum %2",
    "args0": [
      {
        "type": "input_value",
        "name": "NAME",
        "check": "enum"
      },
      {
        "type": "input_end_row"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "letting_enum",
    "message0": "letting %1 be new type enum %2",
    "args0": [
      {
        "type": "input_value",
        "name": "NAME",
        "check": "enum"
      },
      {
        "type": "input_value",
        "name": "ENUM",
        "check": "Array"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "letting_unnamed",
    "message0": "letting %1 be new type of size %2",
    "args0": [
      {
        "type": "input_value",
        "name": "NAME",
        "check": "unnamed"
      },
      {
        "type": "input_value",
        "name": "size"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "such_that",
    "message0": "such that %1",
    "args0": [
      {
        "type": "input_value",
        "name": "CONSTRAINT",
        "check": "Array"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 180,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "where",
    "message0": "where %1",
    "args0": [
      {
        "type": "input_value",
        "name": "CONSTRAINT",
        "check": "Array"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 180,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "minimising",
    "message0": "minimising %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MIN"
      }
    ],
    "previousStatement": null,
    "colour": 20,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maximising",
    "message0": "maximising %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MAX"
      }
    ],
    "previousStatement": null,
    "colour": 20,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "add_subtract",
    "message0": "%1 %2 %3 %4",
    "args0": [
      {
        "type": "input_value",
        "name": "operand1",
        "check": ["int", "Number"]
      },
      {
        "type": "field_dropdown",
        "name": "OPERATION",
        "options": [
          [
            "+",
            "+"
          ],
          [
            "-",
            "-"
          ]
        ]
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "operand2",
        "check": ["int", "Number"]
      }
    ],
    "output": null,
    "colour": 290,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "mult_div",
    "message0": "%1 %2 %3 %4",
    "args0": [
      {
        "type": "input_value",
        "name": "operand1",
        "check": ["int", "Number"]
      },
      {
        "type": "field_dropdown",
        "name": "OPERATION",
        "options": [
          [
            "x",
            "*"
          ],
          [
            "/",
            "/"
          ]
        ]
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "operand2",
        "check": ["int", "Number"]
      }
    ],
    "output": null,
    "colour": 290,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "mod",
    "message0": "%1 mod %2",
    "args0": [
      {
        "type": "input_value",
        "name": "operand1",
        "check": ["int", "Number"]
      },
      {
        "type": "input_value",
        "name": "operand2",
        "check": ["int", "Number"]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": 290,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "exponent",
    "message0": "%1 to the power %2",
    "args0": [
      {
        "type": "input_value",
        "name": "operand1",
        "check": ["int", "Number"]
      },
      {
        "type": "input_value",
        "name": "operand2",
        "check": ["int", "Number"]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": 290,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "negation",
    "message0": "- %1",
    "args0": [
      {
        "type": "input_value",
        "name": "operand1",
        "check": ["int", "Number"]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": 290,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "factorial",
    "message0": "! %1",
    "args0": [
      {
        "type": "input_value",
        "name": "operand1",
        "check": ["int", "Number"]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": 290,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "abs",
    "message0": "abs %1",
    "args0": [
      {
        "type": "input_value",
        "name": "operand",
        "check": ["int", "Number"]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": 290,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "comparison",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "operand1"
      },
      {
        "type": "field_dropdown",
        "name": "COMPARATOR",
        "options": [
          [
            "=",
            "="
          ],
          [
            "!=",
            "!="
          ],
          [
            "<",
            "<"
          ],
          [
            "<=",
            "<="
          ],
          [
            ">",
            ">"
          ],
          [
            ">=",
            ">="
          ]
        ]
      },
      {
        "type": "input_value",
        "name": "operand2"
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": 280,
    "tooltip": "",
    "helpUrl": ""
  },
  {
  "type": "logical_operator",
  "message0": "%1 %2 %3",
  "args0": [
    {
      "type": "input_value",
      "name": "operand1"
    },
    {
      "type": "field_dropdown",
      "name": "OPERATOR",
      "options": [
        [
          "/\\",
          "/\\"
        ],
        [
          "\\/",
          "\\/"
        ],
        [
          "->",
          "->"
        ],
        [
          "<->",
          "<->"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "operand2"
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": 300,
  "tooltip": "",
  "helpUrl": ""
},  
{
  "type": "output",
  "message0": "%1",
  "args0": [
    {
      "type": "field_label_serializable",
      "name": "SOLUTION",
      "text": "test"
    }
  ],
  "colour": 0,
  "tooltip": "",
  "helpUrl": ""
}

])

