# Integer Range

Used to define a group integers.

For example, in order to declare a decision variable `x` that can take values between 1 and 10, you can do the following:

![Example of an integer range](../images/find_statement_example.png)

Which would produce the following Essence Output:

```essence
find  x : int (  0 .. 10  ) 
```