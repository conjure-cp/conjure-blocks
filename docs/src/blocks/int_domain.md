[//]: # (Adapted from conjure documentation)

# Integer Domain

Defines the values an integer variable can take.

The Integer Domain can either define a single integer or a list of sequential integers with a given lower and upper bound.
The bounds can be omitted to create an open range, but note that using open ranges inside an integer domain declaration creates an infinite domain.
Values in an integer domain should be in the range -2**62+1 to 2**62-1 as values outside this range may trigger errors in Savile Row or Minion, and lead to Conjure unexpectedly but silently deducing unsatisfiability. Intermediate values in an integer expression must also be inside this range.

For example, it can be used like this:

![Example of a defined integer domain](../images/int_domain_example.png)

Which would produce the following Conjure Output:

```essence
int ( 0 .. 100  )
```