//from conjure-oxide tree-sitter. had to remove grammar(), also consider installing treesitter, might be more readable
import { seq, choice, repeat, optional, prec, categories} from "./predefinedFunctions";

export const grammar = {
  name: 'essence',

  rules: {
    /* 
    * PROGRAM SECTION
    */
    program: $ => choice(
        $.find_statement_list,
        $.given_list,
        $.letting_statement_list,
        $.maximising,
        $.minimising,
        $.such_that,
        $.dominance_relation,
    ),

    find_statement_list: $ => seq("find", repeat(
        seq($.variable_list, ":", $.domain), 
        categories.PROGRAM
    )),

    given_list: $ => seq(
        "given",
        repeat(
            seq($.variable_list, ":", $.domain), 
            categories.PROGRAM
        )),

    letting_statement_list: $ => seq("letting", 
        repeat(
            seq($.variable, "be", choice("", "domain"), $.expression), 
            categories.PROGRAM
        )
    ),

    maximising: $ => seq(
        "maximising",
        $.expression
    ),

    minimising: $ => seq(
        "minimising",
        $.expression
    ),

    such_that: $ => seq(
        "such that", 
        repeat(
            seq($.expression, optional(",")), // TODO: can we remove the comma?
            categories.PROGRAM
        )
    ),

    dominance_relation: $ => seq(
        "dominanceRelation",
        $.expression
    ),

    /* 
    * Constants Section
    */
   constant: $ => choice(
        $.integer,
        $.TRUE,
        $.FALSE
    ),

    integer: $ => /-?[0-9]+/,

    TRUE: $ => "true",

    FALSE: $ => "false",

    /*
    * VARIABLE SECTION
    */
    variable: $ => {},

    variable_list: $ => repeat(
        seq($.variable, optional(",")),
        categories.LIST
    ),

    /*
    * DOMAIN SECTION
    */
    domain: $ => choice(
        $.bool_domain,
        $.int_domain,
        $.int_expression,
        $.variable,
        $.matrix,
    ),

    bool_domain: $ => "bool",

    int_domain: $ => seq(
        "int",
        seq(
            "(",
            optional($.expression), "..", optional($.expression),
            ")"
        )
    ),

    int_expression: $ => seq(
        "int",
        "(",
        $.expression,
        ")"
    ),

    matrix: $ => seq(
        "matrix indexed by",
        "[",
        repeat(seq($.domain), categories.LIST),
        "]",
        "of",
        $.domain
    ),

    /*
    * RANGE SECTION
    *
    * TODO: is this still needed
    */
    range: $ => choice(
        $.int_range,
        $.range_list
    ),

    // remove precedence, so don't get duplicate brackets, also ensures list corrects
    range_list: $ => repeat(
        seq(choice($.int_range, $.integer), optional(",")),
        categories.LIST
    ),

    int_range: $ => seq(optional($.expression), "..", optional($.expression)),


    /*
    * EXPRESSION SECTION
    */
    expression: $ => choice(
        $.bracket_expr,
        $.not_expr,
        $.abs_value,
        $.negative_expr,
        $.exponent,
        $.product_expr,
        $.sum_expr,
        $.comparison,
        $.and_expr,
        $.or_expr,
        $.implication,
        $.quantifier_expr,
        $.expr_list,
        $.flatten,
        $.from_solution,
        $.toInt_expr,
        $.constant,
        $.variable,
    ),

    bracket_expr: $ => seq("(", $.expression, ")"),

    not_expr: $ => prec(20, seq("!", $.expression)),

    abs_value: $ => prec(20, seq("|", $.expression, "|")),

    negative_expr: $ => prec(15, prec.left(seq("-", $.expression))),

    exponent: $ => prec(14, prec.right(seq($.expression, "**", $.expression))),

    product_expr: $ => prec(13, prec.left(repeat(
        seq($.expression, choice("*", "/", "%"), $.expression),
        categories.OPERATION
    ))),

    sum_expr: $ => prec(12, prec.left(repeat(
        seq($.expression, choice("+", "-"), $.expression),
        categories.OPERATION
    ))),

    comparison: $ => prec(10, prec.left(
        seq($.expression, choice("=", "!=", "<=", ">=", "<", ">"), $.expression)
    )),

    and_expr: $ => prec(9, prec.left(seq($.expression, "/\\", $.expression))),

    or_expr: $ => prec(8, prec.left(seq($.expression, "\\/", $.expression))),

    implication: $ => prec(7, prec.left(seq($.expression, "->", $.expression))),

    quantifier_expr: $ => seq(
        choice(
            "exists",
            "forAll",
            "sum",
            "min",
            "max",
            "and",
            "or"
        ),
        $.variable,
        ":",
        $.domain,
        ".",
        $.expression
    ),

    expr_list: $ => repeat(
        seq($.expression, optional(",")),
        categories.LIST
    ),

    flatten: $ => seq(
        "flatten (",
        $.expression,
        ")"
    ),

    from_solution: $ => seq(
        "fromSolution",
        "(",
        $.variable,
        ")"
    ),

    toInt_expr: $ => seq(
        "toInt", "(", 
        $.expression, 
        ")"
    ),

    /* 
    * FOR COLOUR PURPOSES ONLY
    */
    find: $ => choice(
        $.find_statement_list,
        $.given_list
    ),

    letting: $ => choice(
        $.letting_statement_list,
    ),

    // TODO: remove these from being displayed
    objective_statement: $ => choice(
        $.maximising,
        $.minimising
    ),

    muliplicative: $ => choice(
        $.product_expr,
    ),

    additive: $ => choice(
        $.sum_expr
    ),

    comparing: $ => choice(
        $.comparison,
    ),
  }
};