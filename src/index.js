/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * EDITED by N-J-Martin
 */
import Split from 'split.js'
//import vid from './conjure-blocks-example.mp4';
import * as Blockly from 'blockly';
import {jsonBlocks} from './blocks/json';
import {essenceGenerator} from './blocks/automatedBlocks';
import {jsonGenerator} from './generators/json';
import {save, load} from './serialization';
import {jsonToolbox} from './jsonToolbox';
import './index.css';
import {essenceBlocks} from './blocks/automatedBlocks';
import { autoToolbox } from './blocks/automatedBlocks';
// temp added bit
import {initTooltips } from './tooltips';
import { blocks } from 'blockly/blocks';

/*console.log(essenceBlocks);
for (let b of essenceBlocks){
  console.log(b);
}*/

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(essenceBlocks);
Blockly.common.defineBlocks(jsonBlocks);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const dataDiv = document.getElementById("dataInputDiv");
const ws = Blockly.inject(blocklyDiv, {toolbox:autoToolbox});
const dataWS = Blockly.inject(dataDiv, {toolbox: jsonToolbox});
var split = Split(['#outputPane','#blocklyDivOut', '#dataInputDivOut', '#blocklyDiv2Out'], {gutterSize: 20, minSize:0})

// resize workspaces
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target == blocklyDiv) {
      Blockly.svgResize(ws);
    } else if (entry.target == dataDiv) {
      Blockly.svgResize(dataWS);
    } else{
      Blockly.svgResize(blockOut);
    }
  }

})

resizeObserver.observe(dataDiv);
resizeObserver.observe(blocklyDiv);
resizeObserver.observe(outputDiv);
resizeObserver.observe(document.getElementById('blocklyDiv2'));

// testing adding blocks to input
/*let find = ws.newBlock("find_statement_list");
let stmt = ws.newBlock("find_statement");
find.initSvg();
stmt.initSvg();
let out = stmt.outputConnection
out.reconnect(find, "ADD0")
ws.render();
*/
// adds start block to data input section
let startBlock = dataWS.newBlock("object");
startBlock.initSvg();
dataWS.render()

const blockOut = Blockly.inject(document.getElementById('blocklyDiv2'), {scrollbars:true});

// add variable category to toolbox, by adding create int/bool buttons, each getter block for each variable 
// and a variable_list block
const createFlyout = function (ws) {
  let blockList = [];
  
  blockList.push({
    "kind": "button",
    "text": "create int_domain variable",
    "callbackKey": "int_callback"
  });

  blockList.push({
    "kind": "button",
    "text": "create bool_domain variable",
    "callbackKey": "bool_callback"
  });

  for (let v of ws.getVariablesOfType('int_domain')){
    blockList.push({
      'kind':'block',
      'type':'variables_get_integer',
      'fields': {
        'VAR': {
          "name": v.name,
          "type": "int_domain"
        }
      },
    })
  }

  for (let v of ws.getVariablesOfType('bool_domain')){
    blockList.push({
      'kind':'block',
      'type':'variables_get_bool',
      'fields': {
        'VAR': {
          "name": v.name,
          "type": "bool_domain"
        }
      }
    })
  }

  blockList.push({
    'kind':'block',
    'type': 'variable_list'
  })

  return blockList;

};

ws.registerToolboxCategoryCallback(
  'CREATE_TYPED_VARIABLE',
  createFlyout,
);

const int_button_callback = function () {
  Blockly.Variables.createVariableButtonHandler(ws, null, 'int_domain');
}
const bool_button_callback = function () {
  Blockly.Variables.createVariableButtonHandler(ws, null, 'bool_domain');
}
ws.registerButtonCallback('int_callback', int_button_callback);
ws.registerButtonCallback('bool_callback', bool_button_callback);


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

// generators for get variable blocks
essenceGenerator.forBlock['variables_get_integer'] = function(block) {
  var vars = block.getVars()
  const code = ws.getVariableById(vars[0]).name
  return [code, 0];
}
  
essenceGenerator.forBlock['variables_get_bool'] = function(block) {
  var vars = block.getVars()
  const code = ws.getVariableById(vars[0]).name
  return [code, 0];
}

jsonGenerator.forBlock['variables_get_dynamic'] = function(block) {
  var vars = block.getVars()
  const code = dataWS.getVariableById(vars[0]).name
  return [code, 0];
}
//add output button
var outputButton = document.getElementById("solve");
outputButton.addEventListener("click", getSolution);

// add download button
var downloadButton = document.getElementById("download");
downloadButton.addEventListener("click", downloadEssenceCode);

// add output text box 
var solutionText = document.createElement("Solution");
solutionText.style.scrollBehavior="auto";
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

// Load the initial state from storage and run the code/.
//load(ws);
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
  //ws.resize();
  runCode();
});

// change listener to add comment to describe the required input types on block creation.
ws.addChangeListener((e) => {

  if (e.type == Blockly.Events.BLOCK_CREATE) {
    for (let b of e.ids){
      let block = ws.getBlockById(b);
      let types = "";
      let slot = 1;
      
      // if has a mutator - i.e a list block, individual description for all inputs
      if (block.mutator & block.inputList[1]){
        types = "Click cog to change number of inputs. Each input requires a '" + block.inputList[1].connection.getCheck() + "' block.";
      } 
      else {
        // build description labelling input with types
         for (let i in block.inputList) {
            if (block.inputList[i].connection){
              types = types + "input " + slot +": " + block.inputList[i].connection.getCheck() +"\n";
              slot += 1;
            }
        
        }
      }
     
      
      // no comment if no inputs.
      if (types.length > 0 && !block.getCommentText()){
        block.setCommentText(types);
      }
      

    }
  }
})

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
// from https://conjure-aas.cs.st-andrews.ac.uk/
async function getSolution() {
    solutionText.innerHTML = "Solving..."
    // gets the data from the data input workspace
    let data = jsonGenerator.workspaceToCode(dataWS);
    console.log("data " + data);
    let code = essenceGenerator.workspaceToCode(ws);
    console.log("code " + code);
    const client = new ConjureClient("conjure-blocks");
    client.solve(code, {data : data})
      .then(result => outputSolution(result));   
}

// outputs the solution in blocks, and outputs the log
function outputSolution(solution) {
  solutionText.innerHTML = JSON.stringify(solution, undefined, 2);
  // clear any blocks from previous runs
  blockOut.clear();
  // if solved, create relevant blocks and add to output workspace
  if (solution.status == "ok"){
    for (let sol of solution.solution){
      let prev;
      for (let v in sol){
        blockOut.createVariable(v);
        let varBlock = blockOut.newBlock('variables_set');
        varBlock.setFieldValue(blockOut.getVariable(v).getId(), 'VAR');
        let valueBlock;
        switch (typeof(sol[v])){
          case("bigint"): 
          case("number"): {
              console.log("number");
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
          case("boolean"): {
            console.log("bool")
            valueBlock = blockOut.newBlock('logic_boolean');
            valueBlock.setFieldValue(sol[v], "BOOL");
            break;
          }
          default:{
            console.log("idk");
            valueBlock = null;
            break;
          }

        };
        varBlock.getInput("VALUE").connection.connect(valueBlock.outputConnection);
        // stop changes blocks
        varBlock.setEditable(false);
        valueBlock.setEditable(false);
        varBlock.initSvg();
        valueBlock.initSvg();
       
      }
    }  
    blockOut.render();
    blockOut.cleanUp();

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

// initialise the tooltips
initTooltips();

// help alert window
const dialog = document.getElementById("dialog")
const help = document.getElementById("help");
const close = document.getElementById("close");
help.addEventListener("click", helpPopUp);
close.addEventListener("click", closePopUp);

function helpPopUp() {
  dialog.showModal();
} 

function closePopUp() {
  dialog.close();
}

// save and load blocks, adapted from downloadEssenceCode code above 
function saveBlocks() {
  const data = Blockly.serialization.workspaces.save(ws);
  let filename = prompt("Please enter file name", "test");
  filename = filename + ".block"
  let file = new File([JSON.stringify(data)], filename);
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

var saveButton = document.getElementById("save");
saveButton.addEventListener("click", saveBlocks);


// load button
// adapted from https://developer.mozilla.org/en-US/docs/Web/API/FileReader, 
// https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications,
// and serialisation.js
var file = document.getElementById("Blockfile");
var loadButton = document.getElementById("load")

loadButton.addEventListener("click", (e) => {
  if (file) {
    file.click();
  }
})

file.addEventListener("change", () => {
 
  for (const f of file.files) {
    if (f.name.endsWith(".block")){ 
      const reader = new FileReader();
      const errorPopUp = document.getElementById("errorM");
      const errorClose = document.getElementById("closel");
      errorClose.addEventListener("click", () => {errorPopUp.close()});
      reader.onload = () => {
        
        Blockly.Events.disable();
        try{
          Blockly.serialization.workspaces.load(JSON.parse(reader.result), ws, false);
        } catch {
          errorPopUp.insertAdjacentText("afterbegin", "Error reading the file. Please try again.");
          errorPopUp.showModal();
        }
        Blockly.Events.enable();
      
      };
      reader.onerror = () => {
         errorPopUp.insertAdjacentText("afterbegin", "Error reading the file. Please try again.");
         errorPopUp.showModal();
      };
      reader.readAsText(f);
    } else {
      errorPopUp.insertAdjacentText("afterbegin", "Incorrect file type. Please try again with a .block file.");
      errorPopUp.showModal();
    }
    
  }
});
