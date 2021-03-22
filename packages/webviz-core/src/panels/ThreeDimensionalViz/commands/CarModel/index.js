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

import carModelURL from "webviz-core/src/panels/ThreeDimensionalViz/commands/CarModel/freight100.glb";
import { type InteractionData } from "webviz-core/src/panels/ThreeDimensionalViz/Interactions/types";

async function loadCarModel() {
  const response = await fetch(carModelURL);
  if (!response.ok) {
    throw new Error(`unable to load car model: ${response.status}`);
  }
  const model = await parseGLB(await response.arrayBuffer());
  const nodes = [...model.json.nodes];
  // overwrite the translation component of the root node so the car's center is its rear axle
  const translation = [0, 0, 0];
  nodes[0] = { ...nodes[0], translation };
  // function x(a) {
  //   nodes[0] = a;
  // }
  return {
    ...model,
    json: {
      ...model.json,
      nodes,
    },
  };

  // return {
  //   ...model,
  //   json: {
  //     ...model.json,
  //     nodes,

  //     // // change sampler minFilter to avoid blurry textures
  //     // samplers: model.json.samplers.map((sampler) => ({
  //     //   ...sampler,
  //     //   minFilter: WebGLRenderingContext.LINEAR,
  //     // })),
  //   },
  // };
}

type Props = {|
  children: {|
    pose: Pose,
    scale?: Scale,
    alpha?: number,
    interactionData?: InteractionData,
  |},
  ...CommonCommandProps,
|};

// default scale is 1.0 because the model's units are meters
export default function CarModel({
  children: { pose, alpha = 1, scale = { x: 1.0, y: 1.0, z: 1.0 }, interactionData },
  layerIndex,
}: Props) {
  // console.log(pose);
  // pose.position = { x: 1, y: 1, z: 1 }
  return (
    <GLTFScene layerIndex={layerIndex} model={loadCarModel}>
      {{ pose, alpha, scale, interactionData }}
    </GLTFScene>
  );
}
