/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * EDITED by N-J-Martin
 */

import * as Blockly from 'blockly';
import {TypedVariableModal} from '@blockly/plugin-typed-variable-modal';
//import {blocks} from './blocks/text';
import {blocks} from './blocks/essence';
import {essenceGenerator} from './generators/essence';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import './index.css';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
//Object.assign(javascriptGenerator.forBlock, forBlock);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});

//variable category using https://www.npmjs.com/package/@blockly/plugin-typed-variable-modal.
// much of the code below is from the usage instructions

const createFlyout = function (ws) {
  let xmlList = [];
  // Add your button and give it a callback name.
  const button = document.createElement('button');
  button.setAttribute('text', 'Create Typed Variable');
  button.setAttribute('callbackKey', 'callbackName');

  xmlList.push(button);

  // This gets all the variables that the user creates and adds them to the
  // flyout.
  const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(ws);
  xmlList = xmlList.concat(blockList);
  // adjust so forced to set variables by declarations.
  xmlList.splice(1,1)
  return xmlList;
};

ws.registerToolboxCategoryCallback(
  'CREATE_TYPED_VARIABLE',
  createFlyout,
);

const typedVarModal = new TypedVariableModal(ws, 'callbackName', [
  ['int', 'int'],
  ['enum', 'enum'],
  ['unnamed', 'unnamed']
]);
typedVarModal.init();

// generator
essenceGenerator.forBlock['variables_get_dynamic'] = function(block) {
  var vars = block.getVars()
  const code = ws.getVariableById(vars[0]).name
  return [code, 0];
}

//add output button
var outputButton = document.createElement("BUTTON");
var outputButtonText = document.createTextNode("SOLVE");
outputButton.appendChild(outputButtonText);
outputDiv.append(outputButton);
outputButton.addEventListener("click", getSolution);

// add output text box 
var solutionText = document.createElement("Solution");
outputDiv.append(solutionText);

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  const code = essenceGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;

  //outputDiv.innerHTML = '';

  //eval(code);
};

// Load the initial state from storage and run the code.
load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});


// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()) {
    return;
  }
  runCode();
});

function printGeneratedCode(){
  console.log(essenceGenerator.workspaceToCode(ws));
}

// from https://conjure-aas.cs.st-andrews.ac.uk/submitDemo.html
async function submit(inputData) {
  return new Promise((resolve, reject) => {
    fetch("https://conjure-aas.cs.st-andrews.ac.uk/submit", {
      method: 'POST', headers: {
          'Content-Type': 'application/json'
      }, body: JSON.stringify({
          appName: "conjure-blocks",
          solver: "kissat",
          model: essenceGenerator.workspaceToCode(ws)+"\n",
          data: inputData,
          conjureOptions: ["--number-of-solutions", "1"] // 1 is the default anyway
      })
    })
      .then(response => response.json())
      .then(json => resolve(json.jobid))
      .catch(err => reject(err))
  })}
 
async function get(currentJobid) {
  return new Promise((resolve, reject) => {
    fetch("https://conjure-aas.cs.st-andrews.ac.uk/get", {
    method: 'POST', headers: {
      'Content-Type': 'application/json'

  }, body: JSON.stringify({
      appName: "conjure-blocks", 
      jobid: currentJobid
  })
  })
  .then(response => response.json())
  .then(json => resolve(json))
  .catch(err => reject(err))
  })
  
  
}

// from https://conjure-aas.cs.st-andrews.ac.uk/submitDemo.html
async function getSolution() {
    let data = prompt("Please enter the data used in JSON format", "{\n\n}");
    if (data == null || data == ""){
      data = "{}";
    }
    solutionText.innerHTML = "Solving..."
    const currentJobid = await submit(data); 
    var solution = await get(currentJobid);
    while (solution.status == 'wait'){
      solution = await get(currentJobid);
    } 
    solutionText.innerHTML = JSON.stringify(solution, undefined, 2);
}

// generate essence file from generated code
function downloadEssenceCode() {
  let code = essenceGenerator.workspaceToCode(ws);
  let file = File(code, "test.essence");
  let url = URL.createObjectURL(file);
  let downloading = browser.downloads.download({url: url, saveAs: true})
    .then(() => URL.revokeObjectURL(url))
    .catch((err) => reject(err))
}