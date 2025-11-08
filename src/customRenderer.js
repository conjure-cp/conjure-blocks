import * as Blockly from 'blockly/core';


class CustomConstantProvider extends Blockly.blockRendering.ConstantProvider {
  shapeFor(connection) {
    console.log(connection);
    let check = connection.getCheck();
    // For connections with no check, match any child block.
    if (!check && connection.targetConnection) {
      check = connection.targetConnection.getCheck();
    }
    console.log(check.includes("expression"));
    if (check && check.includes('expression')) {
        //need to overwrite init with shape definitions
        return this.NOTCH;
    }

    return super.shapeFor(connection);
  }
}



class CustomRenderer extends Blockly.blockRendering.Renderer {
  constructor() {
    super();
  }
   
 makeConstants_() {
    return new CustomConstantProvider();
  }
}

Blockly.blockRendering.register('custom_renderer', CustomRenderer);

