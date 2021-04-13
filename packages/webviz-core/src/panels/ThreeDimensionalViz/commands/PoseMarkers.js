// @flow
//
//  Copyright (c) 2019-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.
import { vec3 } from "gl-matrix";
import React, { type Node } from "react";
import {
  Arrows,
  FilledPolygons,
  pointToVec3,
  vec3ToPoint,
  orientationToVec4,
  type Arrow,
  type CommonCommandProps,
} from "regl-worldview";

import { Freight100Model, Freight500Model, Freight1500Model } from "./CarModel";
import carOutlinePoints from "./CarModel/freight100Outline.json";
import { useExperimentalFeature } from "webviz-core/src/components/ExperimentalFeatures";
import { getGlobalHooks } from "webviz-core/src/loadWebviz";

type Props = {
  children: Arrow[],
  ...CommonCommandProps,
};

const { originalScaling, updatedScaling } = getGlobalHooks().getPoseErrorScaling();

const getScaledCarOutlineBufferPoints = (scaling: { x: number, y: number }) => {
  const vectorSum = carOutlinePoints.reduce(
    (prev, curr) => {
      prev.x += curr.x;
      prev.y += curr.y;
      prev.z += curr.z;
      return prev;
    },
    { x: 0, y: 0, z: 0 }
  );

  const vectorAverage = { x: vectorSum.x / carOutlinePoints.length, y: vectorSum.y / carOutlinePoints.length, z: 0 };
  const scaledVectorAverage = { x: vectorAverage.x * scaling.x, y: vectorAverage.y * scaling.y, z: 0 };

  const transform_x = scaledVectorAverage.x - vectorAverage.x;
  const transform_y = scaledVectorAverage.y - vectorAverage.y;

  const scaledAndTransformedPoints = carOutlinePoints.map(({ x, y, z }) => ({
    x: x * scaling.x - transform_x,
    y: y * scaling.y - transform_y,
    z,
  }));

  return scaledAndTransformedPoints;
};

export default React.memo < Props > (function PoseMarkers({ children, layerIndex }: Props): Node[] {
  const useUpdatedScaling = useExperimentalFeature("updatedPoseErrorScaling");
  const scaledCarOutlineBufferPoints = React.useMemo(
    () => getScaledCarOutlineBufferPoints(useUpdatedScaling ? updatedScaling : originalScaling),
    [useUpdatedScaling]
  );
  const models = [];
  const filledPolygons = [];
  const arrowMarkers = [];
  children.forEach((marker, i) => {
    const { pose, settings, interactionData } = marker;
    if (settings?.addCarOutlineBuffer) {
      filledPolygons.push({
        pose,
        interactionData,
        points: scaledCarOutlineBufferPoints,
        color: { r: 0.6666, g: 0.6666, b: 0.6666, a: 1 },
      });
    }

    switch (settings?.modelType) {
      case "freight100-outline": {
        filledPolygons.push({
          pose,
          interactionData,
          points: carOutlinePoints,
          color: settings?.overrideColor ?? { r: 0.3313, g: 0.3313, b: 0.3375, a: 1 },
        });
        break;
      }
      case "freight100-model": {
        models.push(
          <Freight100Model layerIndex={layerIndex} key={i}>
            {{ pose, alpha: settings.alpha || 1, interactionData }}
          </Freight100Model>
        );
        break;
      }
      case "freight500-model": {
        models.push(
          <Freight500Model layerIndex={layerIndex} key={i}>
            {{ pose, alpha: settings.alpha || 1, interactionData }}
          </Freight500Model>
        );
        break;
      }
      case "freight1500-model": {
        models.push(
          <Freight1500Model layerIndex={layerIndex} key={i}>
            {{ pose, alpha: settings.alpha || 1, interactionData }}
          </Freight1500Model>
        );
        break;
      }
      case "arrow":
      default: {
        if (settings && settings.overrideColor) {
          marker = { ...marker, color: settings.overrideColor };
        }
        // the total length of the arrow is 4.7, we move the tail backwards by 0.88 (prev implementation)

        if (settings && settings.size) {
          marker = {
            ...marker,
            scale: {
              x: settings.size.shaftWidth || marker.scale.x,
              y: settings.size.headWidth || marker.scale.y,
              z: settings.size.headLength || marker.scale.z,
            },
          };
        }
        const pos = pointToVec3(marker.pose.position);
        const orientation = orientationToVec4(marker.pose.orientation);
        const dir = vec3.transformQuat([0, 0, 0], [1, 0, 0], orientation);
        const tipPointFloat = 3.82;
        const tailPointFloat = -0.88;
        let tailPoint = vec3.scaleAndAdd([0, 0, 0], pos, dir, tailPointFloat);
        let tipPoint = vec3.scaleAndAdd([0, 0, 0], pos, dir, tipPointFloat);
        if (settings && settings.size) {
          tailPoint = vec3.scaleAndAdd([0, 0, 0], pos, dir, settings.size.tailPoint || tailPointFloat);
          tipPoint = vec3.scaleAndAdd([0, 0, 0], pos, dir, settings.size.tipPoint || tipPointFloat);
        }
        marker = { ...marker, points: [vec3ToPoint(tailPoint), vec3ToPoint(tipPoint)] };

        arrowMarkers.push({ ...marker });

        break;
      }
    }
  });

  return [
    <FilledPolygons layerIndex={layerIndex} key={`cruise-pose`}>
      {filledPolygons}
    </FilledPolygons>,
    ...models,
    <Arrows layerIndex={layerIndex} key="arrows">
      {arrowMarkers}
    </Arrows>,
  ];
});
