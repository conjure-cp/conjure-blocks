# Not Expression

This is a logical operation applied to a boolean expressions. Using this block inverts the truth 
(i.e. a true statement becomes false, and vice versa).

For example, if we wanted to create the statement:

```
not x and y
```

We could use the following blocks:

![Example of a not expression](../images/not_expr_example.png)

Which would produce the following Conjure Output:

```essence
! ( x /\ y  )
```