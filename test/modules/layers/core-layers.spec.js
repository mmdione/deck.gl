// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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
/* eslint-disable func-style, no-console, max-len */
import test from 'tape-catch';

import {
  ScatterplotLayer,
  IconLayer,
  ArcLayer,
  LineLayer,
  ScreenGridLayer,
  PointCloudLayer,
  PathLayer
  // TextLayer
} from 'deck.gl';

import * as FIXTURES from 'deck.gl/test/data';

import {autoTestLayer} from './test-utils';

test('ScreenGridLayer', t => {
  autoTestLayer(t, {
    Layer: ScreenGridLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => d.COORDINATES,
      gpuAggregation: false
    },
    assert: ({layer}) => {
      t.deepEquals(
        layer.state.model.program.uniforms.cellScale,
        layer.state.cellScale,
        'should update cellScale'
      );
    }
  });

  t.end();
});

test('ScatterplotLayer', t => {
  autoTestLayer(t, {
    Layer: ScatterplotLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => d.COORDINATES
    },
    assert: ({layer}) => {
      t.is(
        layer.state.model.program.uniforms.radiusScale,
        layer.props.radiusScale,
        'should update radiusScale'
      );
    }
  });

  t.end();
});

test('ArcLayer', t => {
  autoTestLayer(t, {
    Layer: ArcLayer,
    sampleProps: {
      data: FIXTURES.routes,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    }
  });

  t.end();
});

test('PointCloudLayer', t => {
  autoTestLayer(t, {
    Layer: PointCloudLayer,
    sampleProps: {
      data: FIXTURES.getPointCloud(),
      getPosition: d => d.position
    },
    assert: ({layer}) => {
      t.is(
        layer.state.model.program.uniforms.radiusPixels,
        layer.props.radiusPixels,
        'should update radiusPixels'
      );
    }
  });

  t.end();
});

test('LineLayer', t => {
  autoTestLayer(t, {
    Layer: LineLayer,
    sampleProps: {
      data: FIXTURES.routes,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    }
  });

  t.end();
});

test('IconLayer', t => {
  autoTestLayer(t, {
    Layer: IconLayer,
    sampleProps: {
      data: FIXTURES.points,
      iconAtlas: {},
      iconMapping: {
        marker: {x: 0, y: 0, width: 24, height: 24}
      },
      getPosition: d => d.COORDINATES,
      getIcon: d => 'marker'
    }
  });

  t.end();
});

test('PathLayer', t => {
  autoTestLayer(t, {
    Layer: PathLayer,
    sampleProps: {
      data: FIXTURES.zigzag,
      getPath: d => d.path
    },
    assert: ({layer}) => {
      t.is(
        layer.state.model.program.uniforms.widthMinPixels,
        layer.props.widthMinPixels,
        'should update widthMinPixels'
      );
    }
  });

  t.end();
});

/* TextLayer tests don't work under Node due to fontAtlas needing canvas
test('Text#constructor', t => {
  const data = [
    {
      text: 'north',
      coordinates: [0, 100]
    },
    {
      text: 'south',
      coordinates: [0, -100]
    },
    {
      text: 'east',
      coordinates: [100, 0]
    },
    {
      text: 'west',
      coordinates: [-100, 0]
    }
  ];

  testLayer({
    Layer: TextLayer,
    testCases: [
      {props: []},
      {props: null},
      {
        props: {
          data,
          getText: d => d.text,
          getPosition: d => d.coordinates
        }
      },
      {
        updateProps: {
          data: data.slice(0, 2)
        },
        assert({layer, oldState}) {
          t.ok(layer.state.data.length !== oldState.data.length, 'should update state.data');
        }
      }
    ]
  });

  t.end();
});
*/
