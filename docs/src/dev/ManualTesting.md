# Manual Test Procedure

Before merging a new branch (particularly if it is a new feature), ensure current features work correctly. 
Use these test programs to test all current features.

## Current Features


    - Drag blocks from toolbox into main workspace
    - Corresponding text generation from blocks
    - Download block file
    - Upload block file
    - Download essence
    - Data input
    - Block output
    - Text output


## Test Progams
1. `find x: bool` - basic operation
2. `find x: int (1..10)` - basic operation
3. ```
    find x: int(1..10)
    such that x > 5
    ```
    \- constraint list
4.  ```
    letting y be 5
    find x: int(1..10)
    such that x > y
    ```
    \- letting

5.  ```
    given y: int
    find x: int(1..10)
    such that x > y
    ```
    \- given

6. ```
    find x, y, z: int(1..10)
    such that x < y /\ y < z /\ x + y = z
    ```
   \- Example Program, using logical connectives 
    \- multiple variables, arithmetic

