import * as Blockly from 'blockly/core';


class CustomConstantProvider extends Blockly.blockRendering.ConstantProvider {
    init() {
    // First, call init() in the base provider to store the default objects.
    super.init();

    // Add calls to create shape objects for the new connection shapes.
    this.RECT_INPUT_OUTPUT = this.makeRectangularInputConn();
    this.TRIANGLE_INPUT_OUTPUT = this.makeTriangleInputConn();
    this.ROUND_INPUT_OUTPUT = this.makeRoundInputConn();
  }

  shapeFor(connection) {
    console.log(this.SHAPES);
    console.log(connection);
    let check = connection.getCheck();
    // For connections with no check, match any child block.
    if (!check && connection.targetConnection) {
      check = connection.targetConnection.getCheck();
    }
    console.log(check);
    if (check && check.includes('multiplicative_op')) {
        //need to overwrite init with shape definitions
        return this.RECT_INPUT_OUTPUT;
    } else if (check && check.includes('additive_op')) {
        return this.TRIANGLE_INPUT_OUTPUT;
    } else if (check && check.includes('comp_op')) {
       return this.ROUND_INPUT_OUTPUT;
    }

    return super.shapeFor(connection);
  }

  /**
   * @returns Rectangular puzzle tab for use with input and output connections.
   */
  makeRectangularInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line(
          [
            Blockly.utils.svgPaths.point(-width, 0),
            Blockly.utils.svgPaths.point(0, dir * height),
            Blockly.utils.svgPaths.point(width, 0),
          ]);
    }
    const pathUp = makeMainPath(-1);
    const pathDown = makeMainPath(1);

    return {
      width: width,
      height: height,   
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }

  makeTriangleInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(-width, dir*height / 2),
          Blockly.utils.svgPaths.point(width, dir*height / 2)]);
    }
    const pathUp = makeMainPath(-1);
    const pathDown = makeMainPath(1);

    return {
      width: width,
      height: height,   
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }

  makeRoundInputConn(dir){
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(-width, dir*height/2),
          Blockly.utils.svgPaths.point(0, dir*height*0.3),
          Blockly.utils.svgPaths.point(width, dir*height/2)]);
    }
    const pathUp = makeMainPath(-1);
    const pathDown = makeMainPath(1);

    return {
      width: width,
      height: height,   
      pathUp: pathUp,
      pathDown: pathDown,
    };

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

