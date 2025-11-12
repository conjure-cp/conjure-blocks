# Comparison Operators

Selects the operator for a boolean comparison.

There are 6 comparison operators: `=`, `!=`, `<=`, `>=`, `<`, and `>`.

The equality operators `=` and `!=` can be applied to compare two expressions, both taking values in the same domain and are supported for all types.
The inline binary comparison operators `<`, `<=`, `>`, and `<=` can be used to compare expressions taking values in an ordered domain. The expressions must both be integer, both Boolean.

For example, it can be used like this:

The statement `x is not equal to y` would be represented in Conjure Blocks as follows:

![Example of comparison](../images/comparison_example.png)

and would produce the following Conjure Output:

```essence
x !=  y 
```

See [here](https://conjure.readthedocs.io/en/latest/essence.html#logical-operators) for further information surrounding comparison operators.

