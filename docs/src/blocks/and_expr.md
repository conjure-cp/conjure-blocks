[//]: # (author: Jamie Melton)
# And Expression

A logical operator which abides by the following truth table:

Let x and y be some boolean variables.

| x     | y     | x /\ y |
|-------|-------|--------|
| true  | false | false  |
| false | true  | false  |
| true  | true  | true   |
| false | false | false  |


For example, it can be used like this:

The statement `x and y` would be represented in Conjure Blocks as follows:

![Example of an and expression](../images/and_expr_example.png)

and would produce the following Essence Output:

```essence
x /\ y
```
