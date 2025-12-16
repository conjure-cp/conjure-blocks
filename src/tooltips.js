/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Experimental document for tooltips.
 * @author Jamie Melton
 */

// Source: https://github.com/google/blockly-samples/blob/master/examples/custom-tooltips-demo/index.js

/**
 * @fileoverview Test page for example plugin showing custom tooltip rendering.
 */

import * as Blockly from "blockly";
import { marked } from "marked";

const docsContext = require.context(`../docs/src/blocks`, false, /\.md$/);
const ignoredDocs = ["program", "constant", "integer", "variable", "domain", "expression", "muliplicative", "additive", "comparing", "find", "letting", "range"];

/**
 * Create and register the custom tooltip rendering function.
 * This could be extracted into a plugin if desired.
 */
export function initTooltips() {
    // Create a custom rendering function. This function will be called whenever
    // a tooltip is shown in Blockly. The first argument is the div to render
    // the content into. The second argument is the element to show the tooltip
    // for.
    const customTooltip = function (div, element) {
        if (element instanceof Blockly.BlockSvg) {
            // You can access the block being moused over.
            // Here we get the color of the block to set the background color.
            const blockColour = element.getColour();
            div.style.backgroundColor = blockColour;
            div.classList.add("toolTip");
        }

        // grab the tooltip for the object
        const tip = Blockly.Tooltip.getTooltipOfObject(element);

        // temp if statement for sanity checking
        if (!tip) {
            return;
        }

        // create the div that will hold the information
        const text = document.createElement('div');

        text.innerHTML = tip;
        const container = document.createElement('div');
        container.style.display = 'flex';

        // get all paragraph tags
        const pElements = text.querySelectorAll('p');

        pElements.forEach(el => {
            console.log("got here");
            const image = el.querySelector('img');

            if (image) {
                let src = image.getAttribute('src');
                src = src.replace("../../src/", "./");
                image.setAttribute("src", src);
            }
        }) 

        // Check to see if the custom property we added in the block definition is
        // present.
        // TODO: use this! its cool
        if (element.tooltipImg) {
            const img = document.createElement('img');
            img.setAttribute('src', element.tooltipImg);
            container.appendChild(img);
        }
        container.appendChild(text);
        div.appendChild(container);
    };
    // Register the function in the Blockly.Tooltip so that Blockly calls it
    // when needed.
    Blockly.Tooltip.setCustomTooltip(customTooltip);
}

/**
 * Finds the corresponding documentation for a block and assigns this to its tooltip
 */
export function getContent(blockName) {
    try {
        const markdown = docsContext(`./${blockName}.md`);
        console.log(marked.parse(markdown))
        return marked.parse(markdown);
    }
    catch {
        if (ignoredDocs.includes(blockName)) return "";

        console.error(`No documentation was found for ${blockName}`);
        return 'No Content Found';
    }
}