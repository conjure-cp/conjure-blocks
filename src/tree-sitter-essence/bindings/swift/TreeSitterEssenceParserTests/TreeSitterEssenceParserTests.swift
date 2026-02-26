import XCTest
import SwiftTreeSitter
import TreeSitterEssenceParser

final class TreeSitterEssenceParserTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_essence_parser())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading EssenceParser grammar")
    }
}
