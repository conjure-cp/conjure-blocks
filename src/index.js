/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * EDITED by N-J-Martin
 */

import * as Blockly from 'blockly';
//import {TypedVariableModal} from '@blockly/plugin-typed-variable-modal';
//import {blocks} from './blocks/text';
//import {blocks} from './blocks/essence';
import {blocks} from './blocks/autoEssence';
import {jsonBlocks} from './blocks/json';
//import {essenceGenerator} from './generators/essence';
import {essenceGenerator} from './blocks/autoEssence';
import {jsonGenerator} from './generators/json';
import {save, load} from './serialization';
//import {toolbox} from './toolbox';
import { toolbox } from './blocks/autoEssence';
import {jsonToolbox} from './jsonToolbox';
import './index.css';
import './blocks/autoEssence'

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Blockly.common.defineBlocks(jsonBlocks);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const dataDiv = document.getElementById("dataInputDiv");
const ws = Blockly.inject(blocklyDiv, {toolbox, scrollbars:true});
const dataWS = Blockly.inject(dataDiv, {toolbox: jsonToolbox});
// adds start block to data input section
let startBlock = dataWS.newBlock("object");
startBlock.initSvg();
dataWS.render()

const blockOut = Blockly.inject(document.getElementById('blocklyDiv2'), {readOnly:true});


const createFlyout = function () {
  let jsonList = [];
  let button = {
    "kind": "button",
    "text": "Create Variable",
    "callbackKey": "variableButton"
  }
  jsonList.push(button);

  jsonList.push({
    'kind': 'block',
    'type': 'variables_get'
  })
  // This gets all the variables that the user creates and adds them to the
  
  return jsonList;
};

const varCallBack = function () {
  Blockly.Variables.createVariableButtonHandler(ws, null, 'Name');
  let wsVariables = ws.getAllVariableNames();
  let dataWSVariables = dataWS.getAllVariableNames();
  for (let v of wsVariables){
    if (!(dataWSVariables.includes(v))){
        dataWS.createVariable(v, "Name");
    }
  }
  
}

ws.registerToolboxCategoryCallback(
  'VARIABLES',
  createFlyout,
);
ws.registerButtonCallback("variableButton", varCallBack);

dataWS.registerToolboxCategoryCallback(
  'VARIABLES',
  createFlyout,
);
dataWS.registerButtonCallback("variableButton", varCallBack);
/*

// adding variable category to data input WS
const createDataFlyout = function ()  {
  let xmlList = [];
  const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(ws);
  xmlList = xmlList.concat(blockList);
   // adjust so forced to set variables by declarations.
  xmlList.splice(0,1);
  return xmlList;
};


dataWS.registerToolboxCategoryCallback(
  'GET_VARIABLE',
  createDataFlyout,
);

// setting up typed var model
const typedVarModal = new TypedVariableModal(ws, 'callbackName', [
  ['int', 'int'],
  ['enum', 'enum'],
  ['unnamed', 'unnamed']
]);
typedVarModal.init();
*/


// generators for get variable block

essenceGenerator.forBlock['variables_get'] = function(block) {
  var vars = block.getVars()
  const code = ws.getVariableById(vars[0]).name
  return [code, 0];
}


/*
jsonGenerator.forBlock['variables_get'] = function(block) {
  var vars = block.getVars()
  const code = dataWS.getVariableById(vars[0]).name
  return [code, 0];
}
*/

//add output button
var outputButton = document.createElement("BUTTON");
var outputButtonText = document.createTextNode("SOLVE");
outputButton.appendChild(outputButtonText);
outputDiv.append(outputButton);
outputButton.addEventListener("click", getSolution);

// add download button
var downloadButton = document.createElement("BUTTON");
var downloadButtonText = document.createTextNode("DOWNLOAD");
downloadButton.appendChild(downloadButtonText);
outputDiv.append(downloadButton);
downloadButton.addEventListener("click", downloadEssenceCode);

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

// submits data and code to conjure
//from https://conjure-aas.cs.st-andrews.ac.uk/submitDemo.html
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

// get conjure solution/ response
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

// Runs essence code in conjure, outputs solution logs
// from https://conjure-aas.cs.st-andrews.ac.uk/submitDemo.html
async function getSolution() {
    // gets the data from the data input workspace
    let data = jsonGenerator.workspaceToCode(dataWS) + "\n";
    console.log("data" + data);
    solutionText.innerHTML = "Solving..."
    // waits for code to be submitted to conjure, until jobID returned
    const currentJobid = await submit(data); 
    // get solution for our job. Need to wait until either solution found, code failed, or timed out
    var solution = await get(currentJobid);
    while (solution.status == 'wait'){
      solution = await get(currentJobid);
    } 
    // outputs text solution
    solutionText.innerHTML = JSON.stringify(solution, undefined, 2);
    
    // if solved, create relevant blocks and add to output workspace
    if (solution.status == "ok"){
      for (let sol of solution.solution){
        for (let v in sol){
          blockOut.createVariable(v);
          let varBlock = blockOut.newBlock('variables_set');
          varBlock.setFieldValue(blockOut.getVariable(v).getId(), 'VAR');
          let valueBlock;
          switch (typeof(sol[v])){
            case("bigint"): 
            case("number"): {
                valueBlock = blockOut.newBlock('math_number');
                valueBlock.setFieldValue(sol[v], "NUM");
                break;
            }
            case("string"): {
              console.log("enum");
              valueBlock = blockOut.newBlock('text');
              valueBlock.setFieldValue(sol[v], "TEXT");
              break;
            }
            default:{
              console.log("idk");
              valueBlock = null;
              break;
            }

          };
          varBlock.getInput("VALUE").connection.connect(valueBlock.outputConnection);
          //let addVarBlock = new Blockly.Events.BlockCreate(varBlock);
          //addVarBlock.run(true);
          varBlock.initSvg();
          valueBlock.initSvg();
          blockOut.render();
        }
      }
      
    }
}

// generate essence file from generated code
// This function adapted from https://blog.logrocket.com/programmatically-downloading-files-browser/#how-to-programmatically-download-file-html
// by Glad Chinda on LogRocket. Last accessed 27th February 2024.
function downloadEssenceCode() {
  // create file from the produced code.
  let filename = prompt("Please enter essence file name", "test");
  filename = filename + ".essence"
  let code = essenceGenerator.workspaceToCode(ws);
  let file = new File([code], filename);
  let url = URL.createObjectURL(file);
  const a = document.createElement("a");
  //sets download URL and download name.
  a.href = url;
  a.download = filename;

  // release URL when clicked
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      removeEventListener('click', clickHandler);
    }, 150);
  };

  a.addEventListener('click', clickHandler, false);

  //automatic download
  a.click();
  
  document.body.appendChild(a)
}