// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterEssenceParser",
    products: [
        .library(name: "TreeSitterEssenceParser", targets: ["TreeSitterEssenceParser"]),
    ],
    dependencies: [
        .package(name: "SwiftTreeSitter", url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterEssenceParser",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterEssenceParserTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterEssenceParser",
            ],
            path: "bindings/swift/TreeSitterEssenceParserTests"
        )
    ],
    cLanguageStandard: .c11
)
