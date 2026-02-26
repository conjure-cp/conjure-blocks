package tree_sitter_essence_parser_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_essence_parser "github.com/conjure-cp/conjure-blocks/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_essence_parser.Language())
	if language == nil {
		t.Errorf("Error loading EssenceParser grammar")
	}
}
