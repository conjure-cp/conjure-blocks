//from conjure-oxide tree-sitter. had to remove grammar(), also consider installing treesitter, might be more readable
import { seq, choice, repeat, optional, prec} from "./predefinedFunctions";
import {applyMutator, mutatorType} from "./generators/mutators";

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
        'find'
    )),

    given_list: $ => seq(
        "given",
        repeat(
            seq($.variable_list, ":", $.domain), 
            'given'
        )),

    letting_statement_list: $ => seq("letting", 
        repeat(
            seq($.variable, "be", $.expression),
            'letting'
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
            seq($.expression), // TODO: can we remove the comma?
            'such that'
        )
    ),

    dominance_relation: $ => seq(
        "dominanceRelation",
        $.expression
    ),

      domain_expr: $ => seq("domain", $.domain),

    /* 
    * Constants Section
    */
   constants: $ => choice(
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
        seq($.variable),
        ''
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
        $.domain_expr,
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

      // one of those 'trust me bro' instances. mutateMatrix will make this look correct.
    matrix: $ => applyMutator('matrixMutator', '', seq($.domain), mutatorType.MATRIX),

    /*
    * RANGE SECTION - Has been commented out due to having no current use.
    */
    // range: $ => choice(
    //     $.int_range,
    //     $.range_list
    // ),
    //
    // // remove precedence, so don't get duplicate brackets, also ensures list corrects
    // range_list: $ => repeat(
    //     seq(choice($.int_range, $.integer), optional(",")),
    //     categories.LIST
    // ),
    //
    // int_range: $ => seq(optional($.expression), "..", optional($.expression)),


    /*
    * EXPRESSION SECTION
    */
    expression: $ => choice(
        // categories of expressions
        $.constants,
        $.arithmetic,
        $.boolean,
        $.misc,

        // non-categories
        $.bracket_expr,
        $.not_expr,
        $.abs_value,
        $.negative_expr,
        $.operations_expr,
        $.comparison,
        $.quantifier_expr,
        $.expr_list,
        $.flatten,
        $.from_solution,
        $.toInt_expr,
        $.variable,
        $.domain_expr,
        $.allDiff,
        $.matrix_accessor,
    ),

      arithmetic: $ => choice(
          $.operations_expr,
          $.abs_value,
          $.negative_expr,
      ),

      boolean: $ => choice(
          $.comparison,
          $.not_expr,
      ),

      misc: $ => choice(
          $.bracket_expr,
          $.quantifier_expr,
          $.expr_list,
          $.flatten,
          $.from_solution,
          $.toInt_expr,
          $.variable,
          $.domain_expr,
          $.allDiff,
          $.matrix_accessor,
      ),

    bracket_expr: $ => seq("(", $.expression, ")"),

    not_expr: $ => prec(20, seq("!", $.expression)),

    abs_value: $ => prec(20, seq("|", $.expression, "|")),

    negative_expr: $ => prec(15, prec.left(seq("-", $.expression))),

    operations_expr: $ => applyMutator(
        'operExpressionMutator',
        '',
        seq($.expression, choice("+", "-", "*", "/", "%", "**", "="), $.expression),
        mutatorType.OPERATION
    ),

    comparison: $ => prec(10, prec.left(
        seq($.expression, choice("=", "!=", "<=", ">=", "<", ">", "/\\", "\\/", "->"), $.expression)
    )),

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
        "(",
        $.expression,
        ")"
    ),

    expr_list: $ => repeat(
        seq($.expression),
        ''
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

      allDiff:  $ => seq(
          "allDiff (",
          $.expression,
          ")"
      ),

      matrix_accessor: $ => applyMutator(
          'matrixAccessMutator',
          '',
          seq(
              $.variable,
              '[',
              choice(
                  $.variable,
                  $.expression,
              ),
              '['
          ),
          mutatorType.MATRIX_ACCESS
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

    objective_statement: $ => choice(
        $.maximising,
        $.minimising
    ),
  }
};