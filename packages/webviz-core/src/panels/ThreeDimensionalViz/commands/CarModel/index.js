// @flow
//
//  Copyright (c) 2019-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.
// import { vec3, vec4 } from "gl-matrix";
import React from "react";
import { GLTFScene, parseGLB, type Pose, type Scale, type CommonCommandProps } from "regl-worldview";

import freight100URL from "webviz-core/src/panels/ThreeDimensionalViz/commands/CarModel/freight100.glb";
import freight500URL from "webviz-core/src/panels/ThreeDimensionalViz/commands/CarModel/freight500.glb";
import freight1500URL from "webviz-core/src/panels/ThreeDimensionalViz/commands/CarModel/freight1500.glb";

import { type InteractionData } from "webviz-core/src/panels/ThreeDimensionalViz/Interactions/types";

function loadModel(carURL: string) {
  return async function () {
    const response = await fetch(carURL);
    if (!response.ok) {
      throw new Error(`unable to load car model: ${response.status}`);
    }
    const model = await parseGLB(await response.arrayBuffer());
    const nodes = [...model.json.nodes];
    // overwrite the translation component of the root node so the car's center is its rear axle
    const translation = [0, 0, 0];
    nodes[0] = { ...nodes[0], translation };
    return {
      ...model,
      json: {
        ...model.json,
        nodes,
      }
    };
  }
}

type Props = {|
  children: {|
    pose: Pose,
      scale ?: Scale,
      alpha ?: number,
      interactionData ?: InteractionData,
  |},
  ...CommonCommandProps,
|};


const loadFreight100 = loadModel(freight100URL);
const loadFreight500 = loadModel(freight500URL);
const loadFreight1500 = loadModel(freight1500URL);

// default scale is 1.0 because the model's units are meters
export function Freight100Model({
  children: { pose, alpha = 1, scale = { x: 1.0, y: 1.0, z: 1.0 }, interactionData },
  layerIndex,
}: Props) {
  return (
    <GLTFScene layerIndex={layerIndex} model={loadFreight100}>
      {{ pose, alpha, scale, interactionData }}
    </GLTFScene>
  );
}

export function Freight500Model({
  children: { pose, alpha = 1, scale = { x: 1.0, y: 1.0, z: 1.0 }, interactionData },
  layerIndex,
}: Props) {
  return (
    <GLTFScene layerIndex={layerIndex} model={loadFreight500}>
      {{ pose, alpha, scale, interactionData }}
    </GLTFScene>
  );
}
export function Freight1500Model({
  children: { pose, alpha = 1, scale = { x: 1.0, y: 1.0, z: 1.0 }, interactionData },
  layerIndex,
}: Props) {
  return (
    <GLTFScene layerIndex={layerIndex} model={loadFreight1500}>
      {{ pose, alpha, scale, interactionData }}
    </GLTFScene>
  );
}