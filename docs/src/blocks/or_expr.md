# Or Expression

A logical operator which abides by the following truth table:

Let x and y be some boolean variables.

| x     | y     | x \/ y |
|-------|-------|--------|
| true  | false | true   |
| false | true  | true   |
| true  | true  | true   |
| false | false | false  |


For example, it can be used like this:

The statement `x or y` would be represented in Conjure Blocks as follows:

![Example of an and expression](../images/or_expr_example.png)

and would produce the following Essence Output:

```essence
x \/ y
```
