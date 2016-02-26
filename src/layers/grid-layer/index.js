// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import MapLayer from '../map-layer';
import {Program} from 'luma.gl';
const glslify = require('glslify');

const ATTRIBUTES = {
  positions: {size: 3, '0': 'x', '1': 'y', '2': 'unused'},
  colors: {size: 3, '0': 'red', '1': 'green', '2': 'blue'}
};

export default class GridLayer extends MapLayer {

  static get attributes() {
    return ATTRIBUTES;
  }

  /**
   * @classdesc
   * GridLayer
   *
   * @class
   * @param {object} opts
   * @param {number} opts.unitWidth - width of the unit rectangle
   * @param {number} opts.unitHeight - height of the unit rectangle
   */
  constructor(opts) {
    super({
      unitWidth: 100,
      unitHeight: 100,
      numCol: 100,
      ...opts
    });
  }

  initializeState() {
    super.initializeState();

    const {gl, attributes} = this.state;

    const program = new Program(
      gl,
      glslify('./vertex.glsl'),
      glslify('./fragment.glsl'),
      'grid'
    );

    const geometry = {
      drawType: 'TRIANGLE_FAN',
      vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
    };

    const primitive = {
      id: this.props.id,
      instanced: true,
      ...geometry
    };

    this.setState({
      program,
      primitive
    });

    attributes.addInstanced(ATTRIBUTES, {
      positions: {update: this.calculatePositions},
      colors: {update: this.calculateColors}
    });
  }

  willReceiveProps(oldProps, newProps) {
    const {attributes} = this.state;

    const cellSizeChanged =
      newProps.unitWidth !== oldProps.unitWidth ||
      newProps.unitHeight !== oldProps.unitHeight;

    if (cellSizeChanged || this.state.viewportChanged) {
      const numCol = Math.ceil(this.width * 2 / this.unitWidth);
      const numRow = Math.ceil(this.height * 2 / this.unitHeight);
      this.setState({
        numCol,
        numRow,
        numInstances: numCol * numRow
      });
    }

    attributes.invalidateAll();
  }

  updateUniforms() {
    super.updateUniforms();

    const {maxCount} = this.state;

    const {unitWidth, unitHeight} = this.props;
    const MARGIN = 2;
    const scale = new Float32Array([
      unitWidth - MARGIN * 2,
      unitHeight - MARGIN * 2,
      1
    ]);

    this.setUniforms({
      maxCount,
      scale
    });
  }

  calculatePositions(attribute, numInstances) {
    const {numCol, unitWidth, unitHeight, width, height} = this.props;
    const {value, size} = attribute;

    for (let i = 0; i < numInstances; i++) {
      const x = i % numCol;
      const y = Math.floor(i / numCol);
      value[i * size + 0] = x * unitWidth - width;
      value[i * size + 1] = y * unitHeight - height;
      value[i * size + 2] = 0;
    }
  }

  calculateColors(attribute) {
    const {data, numCol, unitWidth, unitHeight, width, height} = this.props;
    const {value, size} = attribute;

    value.fill(0.0);

    for (const point of data) {
      const pixel = this.project([point.position.x, point.position.y]);
      const space = this.screenToSpace(pixel.x, pixel.y);

      const colId = Math.floor((space.x + width) / unitWidth);
      const rowId = Math.floor((space.y + height) / unitHeight);

      const i3 = (colId + rowId * numCol) * size;
      value[i3 + 0] += 1;
      value[i3 + 1] += 5;
      value[i3 + 2] += 1;
    }

    this.state.maxCount = Math.max(...value);
  }

}
