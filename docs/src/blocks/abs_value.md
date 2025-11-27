[//]: # (From the conjure documentation)
# Absolute Value

When x is an integer, |x| denotes the absolute value of x. The relationship

`(2*toInt(x >= 0) - 1)*x = |x|`

holds for all integers x such that |x| <= 2**62-2. Integers outside this range may be flagged as an error by Savile Row and/or Minion.