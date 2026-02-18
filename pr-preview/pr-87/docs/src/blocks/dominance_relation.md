[//]: # (author: Jamie Melton)
# Dominance Relation

Identifies when one solution is guaranteed to be at least as good as another.

## Example

Say we have 2 assignments, A and B. If A is always at least as good as B, then A dominates B and B can be ignored.

## Rules

Dominance relations must have the following properties:
- Transitive: If A dominates B, and B dominates C, then A dominates C.
- Irreflexive: Nothing can dominate itself.

