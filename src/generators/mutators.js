/**
 * Responsible for generating the mutator blocks.
 * This came originally from `predefinedFunctions.js`, and has been
 * separated (maybe temporarily) for my peace of mind.
 * NOTE: Mutators functions here are called by the `repeat` function
 * in `predefinedFunctions.js`
 * @author Jamie Melton
 */

import * as Blockly from "blockly";
import {generatorRegistry} from "./blockGenerators";
import {essenceGenerator} from "../blocks/automatedBlocks";

/**
 * JSON object that holds mutator specific functions
 *
 * TODO: reduce more repetition.
 *
 * STRUCTURE:
 * {
 *     updateShape: (mutator, arg) => {}.
 *     generator: (block, generator, grammarName, arg) => {},
 * },
 * @type {Readonly<{}>}
 */
export const mutatorType = Object.freeze({
    DEFAULT: { // if no mutatorType is specified on an applyMutator call, this will be assumed
        updateShape: (mutator, arg) => {
            if (emptyCheck(mutator)) return;

            // Implement the list functionality (i.e. 'find [] : [], [] : []')

            // Take a message like `%1 : %2`. '%1' and '%2' are the arguments. We want this to be split into
            // ['%1', ':', '%2'] so that the blocks can incorporate the grammar in between.
            const parts = arg.message.split(/\s+/);

            for (let i = 0; i < mutator.itemCount_; i++) {
                let j = 0; // counter for the arguments.

                for (let p = 0; p < parts.length; p++) {
                    const part = parts[p];

                    // if it is an argument (looks like '%'), append it
                    if (part.match(/%\d+/)) {
                        const inputName = `ARG${j}_${i}`;

                        if (!mutator.getInput(inputName)) {
                            let input = mutator
                                .appendValueInput(inputName)
                                .setCheck(arg.args[j].check);

                            // add a comma before the first arg of each item after the first
                            if (i > 0 && j === 0) {
                                input.appendField(',');
                            }
                        }

                        j++;
                    }
                    else {
                        // label for non-args
                        const labelName = `LABEL${p}_${i}`;

                        if (!mutator.getInput(labelName)) {
                            mutator.appendDummyInput(labelName)
                                .appendField(part);
                        }
                    }
                }
            }

            // remove inputs for items that no longer exist
            for (let i = mutator.itemCount_; ; i++) {
                let found = false;

                for (let j = 0; j < mutator.numArgs_; j++) {
                    if (mutator.getInput(`ARG${j}_${i}`)) {
                        mutator.removeInput(`ARG${j}_${i}`);
                        found = true;
                    }
                }

                // and the labels
                for (let p = 0; p < parts.length; p++) {
                    if (mutator.getInput(`LABEL${p}_${i}`)) {
                        mutator.removeInput(`LABEL${p}_${i}`);
                        found = true;
                    }
                }

                if (!found) break;
            }
        },

        generator: (block, generator, grammarName, arg) => {
            const newlineGrammars = ["find", "given", "letting", "such that"]

            const parts = arg.message.split(/\s+/);
            const items = [];

            for (let i = 0; i < block.itemCount_; i++) {
                let itemCode = '';
                let j = 0;

                for (let p = 0; p < parts.length; p++) {
                    const part = parts[p];

                    if (part.match(/%\d+/)) {
                        // get the value from the block input
                        const valueCode = generator.valueToCode(block, `ARG${j}_${i}`, 0) || '';
                        itemCode += valueCode;
                        j++;
                    } else {
                        itemCode += ` ${part} `;
                    }
                }

                items.push(itemCode.trim());
            }

            const code = `${grammarName} ${newlineGrammars.includes(grammarName) ? items.join(',\n\t') : items.join(' , ') }`;

            // allows the chaining with the next program block
            if (block.nextConnection && block.nextConnection.getCheck()?.[0] === 'program') {
                return code + '\n' + generator.blockToCode(block.getNextBlock());
            }

            return [code, 0];
        }
    },
    MATRIX: { // for `matrix indexed by [{domain}] of {domain}` blocks
        updateShape: (mutator, arg) => {
            if (emptyCheck(mutator)) return;

            // remove 'of' so that it the extra by domains don't get appended at the end of the block
            if (mutator.getInput('OF')) {
                mutator.removeInput('OF');
            }

            // Makes 'matrix indexed by [ , , ] of {}'
            for  (let i = 0; i < mutator.itemCount_; i++) {
                if (!mutator.getInput(`ARG0_${i}`)) {
                    let input = mutator
                        .appendValueInput(`ARG0_${i}`)
                        .setCheck('domain');

                    // Initially there is no list
                    if (i === 0) {
                        input.appendField('matrix indexed by [');
                    }
                    else {
                        input.appendField(',');
                    }
                }
            }

            for (let i = mutator.itemCount_; mutator.getInput(`ARG0_${i}`); i++) {
                mutator.removeInput(`ARG0_${i}`);
            }

            // Add the singular instance of, ironically, 'of'
            if (!mutator.getInput('OF')) {
                mutator.appendValueInput('OF')
                    .setCheck('domain')
                    .appendField('] of');
            }
        },
        generator: (block, generator, grammarName, arg) => {
            // stores the domain, variable pairs
            const byParts = [];

            // iterate through every item
            for(let i = 0; i < block.itemCount_; i++) {
                byParts.push(generator.valueToCode(block, `ARG0_${i}`, 0) || '');
            }

            const ofCode = generator.valueToCode(block, 'OF', 0) || '';

            const code = `matrix indexed by [ ${byParts.join(', ')} ] of ${ofCode}`;

            // allows the chaining with the next program block
            if (block.nextConnection && block.nextConnection.getCheck()?.[0] === 'program') {
                const next = generator.blockToCode(block.getNextBlock());
                return code + '\n' + next;
            }

            return [code, 0];
        },
    },
    MATRIX_ACCESS: { // for `{variable} [{index}]` blocks. (accessing indexes of a matrix)
        updateShape: (mutator, arg) => {
            if (emptyCheck(mutator)) return;

            // remove 'of' so that it the extra by domains don't get appended at the end of the block
            if (mutator.getInput('CLOSING')) {
                mutator.removeInput('CLOSING');
            }

            // add var once
            if (!mutator.getInput('VAR')) {
                mutator.appendValueInput('VAR')
                    .setCheck('variable');
            }

            // Makes '{variable} [{index}]'
            for  (let i = 0; i < mutator.itemCount_; i++) {
                if (!mutator.getInput(`ARG0_${i}`)) {
                    let input = mutator
                        .appendValueInput(`ARG0_${i}`)
                        .setCheck(['variable', 'expression']);

                    // Initially there is no list
                    if (i === 0) {
                        input.appendField('[');
                    }
                    else {
                        input.appendField(',');
                    }
                }

                for (let i = mutator.itemCount_; mutator.getInput(`ARG0_${i}`); i++) {
                    mutator.removeInput(`ARG0_${i}`);
                }
            }
            // add closing bracket
            if (!mutator.getInput('CLOSING')) {
                mutator
                    .appendDummyInput('CLOSING')
                    .appendField(']');
            }
        },
        generator: (block, generator, grammarName, arg) => {
            const byParts = [];

            const varCode = generator.valueToCode(block, 'VAR', 0) || '';

            for (let i = 0; i < block.itemCount_; i++) {
                byParts.push(generator.valueToCode(block, `ARG0_${i}`, 0) || '');
            }

            const code = `${varCode} [ ${byParts.join(', ')} ]`;

            // allows the chaining with the next program block
            if (block.nextConnection && block.nextConnection.getCheck()?.[0] === 'program') {
                const next = generator.blockToCode(block.getNextBlock());
                return code + '\n' + next;
            }

            return [code, 0];
        }
    },
    // OPERATION: 3, // for operations. TODO
})

export const applyMutator = function (mutatorName, grammarName, arg, typeOfMutator=mutatorType.DEFAULT) {
    /**
     * Sets the initial number of inputs. This DOES NOT mean the number of gaps
     * for blocks to be put in. For example, itemCount = 1 looks like `such that
     * []` for such that and like `find [] : []` for find.
     */
    let helper = function() {
        this.itemCount_ = 1;
        this.numArgs_ =  typeOfMutator === mutatorType.DEFAULT ? arg.args?.length : 1; // probably will cause errors for future Jamie :(

        this.updateShape();
    }

    /**
     * Mutators are a special mixin so must be first registered. This is the
     * function signature.
     */
    Blockly.Extensions.registerMutator(
        mutatorName, // string associated with the mutator
        { // these are the mutator methods

            /**
             * A serialisation hook for the lists_create_with block.
             * @returns {{itemCount: (number)}}
             */
            saveExtraState: function() {
                return { 'itemCount': this.itemCount_ };
            },

            /**
             * Updates the shape of the block when a list is extended or reduced.
             * @param state the blocks current metadata.
             */
            loadExtraState: function(state) {
                this.itemCount_ = state['itemCount'];
                this.updateShape();
            },

            /**
             * 'Explodes' the block into smaller sub blocks that can be moved around, added, and deleted.
             * @param workspace the blockly workspace.
             * @returns topBlock
             */
            decompose: function(workspace) {
                // special sub block that gets created in the mutator UI
                let topBlock = workspace.newBlock('lists_create_with_container');
                topBlock.initSvg() // create SVG representation of the block

                // add a sub block for each item in the list
                let connection = topBlock.getInput('STACK').connection;

                for (let i = 0; i < this.itemCount_; i++) {
                    let itemBlock = workspace.newBlock('lists_create_with_item');
                    itemBlock.initSvg();
                    connection.connect(itemBlock.previousConnection);
                    connection = itemBlock.nextConnection;
                }

                // return the top block
                return topBlock;
            },

            /**
             * Interprets the configuration of the sub-blocks and uses them to modify
             * the main block.
             * THIS CAN CHANGE DEPENDING ON THE TYPE OF BLOCK WE ARE COMPOSING.
             * @param topBlock
             */
            compose:  function(topBlock) {
                // get the first sub block -- this is an input for the main block
                let itemBlock = topBlock.getInputTargetBlock('STACK');

                // array of connections
                const connections = [];

                // Store the connections to the main block from the sub-blocks
                while (itemBlock && !itemBlock.isInsertionMarker()) {
                    // assume that inputConnections is an array of however many inputs the block will have
                    connections.push(itemBlock.inputConnections_ || []);
                    itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
                }

                // disconnect children from the sub block that have been deleted/removed
                for (let i = 0; i < this.itemCount_; i++) {
                    // get all the connections
                    for (let j = 0; j < this.numArgs_; j++) {
                        let input = this.getInput(`ARG${j}_${i}`);

                        if (input) {
                            let conn = input.connection.targetConnection;
                            if (conn && !connections[i]?.includes(conn)) {
                                conn.disconnect();
                            }
                        }
                    }
                }

                // update the block shape
                this.itemCount_ = connections.length;
                this.updateShape();

                // reconnect remaining child blocks
                for (let i = 0; i < this.itemCount_; i++) {
                    for (let j = 0; j < this.numArgs_; j++) {
                        let conn = connections[i]?.[j];
                        if (conn) {
                            conn.reconnect(this,`ARG${j}_${i}`);
                        }
                    }
                }
            },

            /**
             * Lets you associate children of your main block with sub-blocks that exist in your mutator workspace
             * @param topBlock
             */
            saveConnections: function(topBlock) {
                // get the first sub-block (i.e. an input on our main block)
                let itemBlock = topBlock.getInputTargetBlock('STACK');

                // Assign references to connections on the main block
                let i = 0; // counter

                while (itemBlock) {
                    const inputConns = [];

                    for (let j = 0; j < this.numArgs_; j++) {
                        let input = this.getInput(`ARG${j}_${i}`);
                        inputConns.push(
                            input && input.connection.targetConnection
                        );
                    }

                    itemBlock.inputConnections_ = inputConns;
                    i++;

                    // move to the next connection
                    itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
                }
            },

            /**
             * Updates the shape of the block
             */
            updateShape: function() {
                typeOfMutator.updateShape(this, arg);
            }
        },
        helper,
        ["lists_create_with_item"]
    );

    // overridden generator
    generatorRegistry.register(function(type) {
        essenceGenerator.forBlock[type] =  function(block, generator) {
            return typeOfMutator.generator(block, generator, grammarName, arg);
        }
    })

    // if there is no repeat called, this function must return a value
    if (typeOfMutator !== mutatorType.DEFAULT) {
        // since repeat isn't used, the mutateMatrix must return a value
        return {
            'message': "",
            'args': [],
            'extraState': { 'itemCount': 1 },
            'mutator': mutatorName
        };
    }
}

/**
 * Checks the base case of updateShape. i.e. is the block empty.
 * @param mutator The mutator object.
 * @returns {boolean} True if updateShape can continue and false otherwise.
 */
function emptyCheck(mutator) {
    // empty case
    if (mutator.itemCount_ && mutator.getInput('EMPTY')) {
        // remove the empty input block
        mutator.removeInput('EMPTY');
        return false;
    } // is the itemCount 0 and input block not empty?
    else if (!mutator.itemCount_ && !mutator.getInput('EMPTY')) {
        mutator.appendDummyInput('EMPTY').appendField('');
        return true;
    }
}

