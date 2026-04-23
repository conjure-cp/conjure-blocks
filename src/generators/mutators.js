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

export const applyMutator = function (mutatorName, grammarName, arg) {
    /**
     * Sets the initial number of inputs. This DOES NOT mean the number of gaps
     * for blocks to be put in. For example, itemCount = 1 looks like `such that
     * []` for such that and like `find [] : []` for find.
     */
    let helper = function() {
        this.itemCount_ = 1;
        this.numArgs_ = arg.args.length;
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
                // empty case
                if (this.itemCount_ && this.getInput('EMPTY')) {
                    // remove the empty input block
                    this.removeInput('EMPTY');
                } // is the itemCount 0 and input block not empty?
                else if (!this.itemCount_ && !this.getInput('EMPTY')) {
                    this.appendDummyInput('EMPTY').appendField('');
                    return;
                }

                // Implement the list functionality (i.e. 'find [] : [], [] : []')

                // Take a message like `%1 : %2`. '%1' and '%2' are the arguments. We want this to be split into
                // ['%1', ':', '%2'] so that the blocks can incorporate the grammar in between.
                const parts = arg.message.split(/\s+/);

                for (let i = 0; i < this.itemCount_; i++) {
                    let j = 0; // counter for the arguments.

                    for (let p = 0; p < parts.length; p++) {
                        const part = parts[p];

                        // if it is an argument (looks like '%'), append it
                        if (part.match(/%\d+/)) {
                            const inputName = `ARG${j}_${i}`;

                            if (!this.getInput(inputName)) {
                                let input = this
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

                            if (!this.getInput(labelName)) {
                                this.appendDummyInput(labelName)
                                    .appendField(part);
                            }
                        }
                    }
                }

                // remove inputs for items that no longer exist
                for (let i = this.itemCount_; ; i++) {
                    let found = false;

                    for (let j = 0; j < this.numArgs_; j++) {
                        if (this.getInput(`ARG${j}_${i}`)) {
                            this.removeInput(`ARG${j}_${i}`);
                            found = true;
                        }
                    }

                    // and the labels
                    for (let p = 0; p < parts.length; p++) {
                        if (this.getInput(`LABEL${p}_${i}`)) {
                            this.removeInput(`LABEL${p}_${i}`);
                            found = true;
                        }
                    }

                    if (!found) break;
                }
            }
        },
        helper,
        ["lists_create_with_item"]
    );

    // overridden generator
    generatorRegistry.register(function(type) {
        essenceGenerator.forBlock[type] = function(block, generator) {
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
                    }
                    else {
                        itemCode += ` ${part} `;
                    }
                }

                items.push(itemCode.trim());
            }

            const code = `${grammarName} ${items.join(' , ')}`;

            // allows the chaining with the next program block
            if (block.nextConnection && block.nextConnection.getCheck()?.[0] === 'program') {
                return code + '\n' + generator.blockToCode(block.getNextBlock());
            }

            return [code, 0];
        }
    })
}


