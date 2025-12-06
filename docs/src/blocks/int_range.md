# Integer Range

Used to define a group of integers.

For example, to declare a decision variable `x` that can take values between 1 and 10, you can do the following:

![Example of an integer range](../images/find_statement_example.png)

Which would produce the following Essence Output:

```essence
find  x : int (  0 .. 10  ) 
```

> **Note**
> 
> Notice in the blocks example above, we define the range to be 0 to 10.
> 
> Say that you want a range `A` to `B` where `A` and `B` are some integers. Your bounds must extend one step outside of that range.
> So the lower bound would be `A - 1` and the upper bound would be `B`.