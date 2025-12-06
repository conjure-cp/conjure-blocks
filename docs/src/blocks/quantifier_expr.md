# Quantifier Expression

Iterates over the given domains to find an instance whose conditions are met.

Multiple functions are available for this block:
- `and`
- `or`
- `min`
- `max`
- `sum`
- `allDiff`

For example, it can be used like this:

![Example of a quantifier expression](../images/quantifier_expression_example.png)

Which would produce the following Essence Output:

```essence
and  ([ x >= y, y <= x ])
```