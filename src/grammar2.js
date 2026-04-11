//from conjure-oxide tree-sitter. had to remove grammar(), also consider installing treesitter, might be more readable
import { seq, choice, repeat, optional, prec} from "./predefinedFunctions";

export const grammar = {
  name: 'essence',

  rules: {
    // Based on the Essence Docs -- Should follow the docs structure

    statement: $ => choice(
        $.declarationStatement,
        $.branchingStatement,
        $.suchThatStatement,
        $.whereStatement,
        $.objectiveStatement
    ),

    // Declaration Statements

    declarationStatement: $ => choice(
        $.findStatement,
        $.givenStatement,
        $.lettingStatementList,
        $.givenEnum,
        $.lettingEnum,
        $.lettingUnnamed
    ),

    innerStatement: $ => seq(
        $.variable_list,
        ":",
        $.domain
    ),

    findStatement: $ => seq("find", repeat($.innerStatement)),

    givenStatement: $ => seq("given", repeat(seq($.innerStatement, optional(",")))),

    lettingStatementList: $ => seq("letting", repeat($.lettingStatement)),

    lettingStatement: $ => seq(
        $.variable_list,
        "be",
        choice(
            $.expression, 
            $.domainExpr
        )
    ),

    givenEnum: $ => seq("given", $.variable, "new type enum"),

    lettingEnum: $ => seq(
        "letting", 
        $.variable, 
        "be new type enum",
        "{",
        repeat(seq($.variable, optional(","))),
        "}"
    ),

    lettingUnnamed: $ => seq(
        "letting", 
        $.variable, 
        "be new type of size",
        $.expression
    ),

    // Branching Statement

    branchingStatement: $ => seq(
        "branching on",
        "[",
        repeat(seq($.branchingOn, optional(","))),
        "]"
    ),

    branchingOn: $ => choice(
        $.variable,
        $.expression
    ),

    // Such That Statement

    suchThatStatement: $ => seq("such that", repeat(seq($.expression, optional(",")))),

    // Where Statement

    whereStatement: $ => seq("where", repeat(seq($.expression, optional(",")))),

    // Objective Statement

    objectiveStatement: $ => choice(
        $.minimising,
        $.maximising
    ),

    minimising: $ => seq("minimising", $.expression),

    maximising: $ => seq("maximising", $.expression),

    // Variables

    variable: $ => {}, // need to replace soon

    variable_list: $ => repeat(seq(
        $.variable, 
        optional(",")
    )),

    // Domains

    domain: $ => choice(
        $.bool,
        $.intDomain,
        $.variableRange,
        $.variable,
        $.tuple,
        $.record,
        $.variant,
        $.matrix,
        $.set,
        $.mset,
        $.function,
        $.sequence,
        $.relation,
        $.partition
    ),

    bool: $ => "bool",

    intDomain: $ => seq(
        "int", 
        optional(seq("(", repeat(seq($.range, optional(","))), ")"))
    ),

    variableRange: $ => seq(
        $.variable, "(", repeat(seq($.range, optional(","))), ")"
    ),

    tuple: $ => seq(
        "tuple (", repeat(seq($.domain, optional(","))), ")"
    ),

    record: $ => seq(
        "record {", repeat(seq($.variableDomain, optional(","))), "}"
    ),

    variant: $ => seq(
        "variant {", repeat(seq($.variableDomain, optional(","))), "}"
    ),

    matrix: $ => seq(
        "matrix indexed by [", 
        repeat(seq($.domain, optional(","))), 
        "] of",
        $.domain
    ),

    set: $ => seq(
        "set (", 
        repeat(seq($.attribute, optional(","))), 
        ") of",
        $.domain
    ),

    mset: $ => seq(
        "mset (", 
        repeat(seq($.attribute, optional(","))), 
        ") of",
        $.domain
    ),

    function: $ => seq(
        "function (",
        repeat(seq($.attribute, optional(","))),
        ")",
        $.domain,
        "-->",
        $.domain
    ),

    sequence: $ => seq(
        "sequence (",
        optional(repeat(seq($.attribute, optional(",")))),
        ") of",
        $.domain
    ),

    relation: $ => seq(
        "relation (",
        repeat(seq($.attribute, optional(","))),
        ") of (",
        repeat(seq($.domain), optional("*")),
        ")"
    ),

    // TODO: revisit this
    partition: $ => seq(
        "partition (", 
        repeat(seq($.attribute, optional(","))),
        ") from",
        $.domain
    ),

    range: $ => choice(
        $.expression,
        $.definedRange
    ),
    
    definedRange: $ => seq(optional($.expression), "..", optional($.expression)),

    attribute: $ => choice(
        $.variable,
        $.varExpr
    ),

    varExpr: $ => seq($.variable, $.expression),

    variableDomain: $ => seq($.variable, ":", $.domain),

    // Boolean Domains

    TRUE: $ => "true",

    FALSE: $ => "false",

    // Integer Domains

    integer: $ => /-?[0-9]+/,

    // Expression 


    domainExpr: $ => seq("domain", $.domain),
  }
};