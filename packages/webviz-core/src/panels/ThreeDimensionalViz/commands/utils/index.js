// @flow
//
//  Copyright (c) 2018-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.
import tinycolor from "tinycolor2";

import type { OccupancyGridMessage } from "webviz-core/src/types/Messages";

export const COLORS = {
  WHITE: tinycolor("white"),
  BLACK: tinycolor("black"),
  RED: tinycolor("red"),
  PINK: tinycolor("pink"),
  LIME: tinycolor("lime"),
  CYAN: tinycolor("cyan"),
  WHITE: tinycolor("white"),
  AQUA: tinycolor("aqua"),
  BLUE: tinycolor("blue"),
  ORANGE: tinycolor("orange"),
  MAGENTA: tinycolor("magenta"),
  YELLOW: tinycolor("yellow"),
  GRAY: tinycolor("darkgray"), // gray and darkgray are named reversed for some reason
  DARKGRAY: tinycolor("gray"), // gray and darkgray are named reversed for some reason
  PURPLE: tinycolor("purple"),
};

export function setRgba(buffer: Uint8Array, index: number, color: tinycolor) {
  const rgba255 = color.toRgb();
  rgba255.a *= 255;
  buffer[index] = rgba255.r;
  buffer[index + 1] = rgba255.g;
  buffer[index + 2] = rgba255.b;
  buffer[index + 3] = rgba255.a;
}

// Ported from Rviz' Map palette
// https://github.com/ros-visualization/rviz/blob/22b81ecfea7ea7ed69e35d537abf6f50c8e5f1d7/src/rviz/default_plugin/map_display.cpp#L284
export const defaultMapPalette = (() => {
  const buff = new Uint8Array(256 * 4);
  let buff_index = 0;

  // Standard gray map palette values
  for (let i = 0; i <= 100; i++)
  {
    const v = 255 - (255 * i) / 100;
    buff[buff_index++] = v;    // red
    buff[buff_index++] = v;    // green
    buff[buff_index++] = v;    // blue
    buff[buff_index++] = 255;  // alpha
  }

  // illegal positive values in green
  for (let i = 101; i <= 127; i++)
  {
    buff[buff_index++] = 0;    // red
    buff[buff_index++] = 255;  // green
    buff[buff_index++] = 0;    // blue
    buff[buff_index++] = 255;  // alpha
  }

  // illegal negative (char) values in shades of red/yellow
  for (let i = 128; i <= 254; i++)
  {
    buff[buff_index++] = 255;                              // red
    buff[buff_index++] = (255 * (i - 128)) / (254 - 128);  // green
    buff[buff_index++] = 0;                                // blue
    buff[buff_index++] = 255;                              // alpha
  }

  // legal -1 value is tasteful blueish greenish grayish color
  buff[buff_index++] = 0x70;  // red
  buff[buff_index++] = 0x89;  // green
  buff[buff_index++] = 0x86;  // blue
  buff[buff_index++] = 255;   // alpha

  return buff;
})();


// Ported from Rviz's Costmap palette
// https://github.com/ros-visualization/rviz/blob/22b81ecfea7ea7ed69e35d537abf6f50c8e5f1d7/src/rviz/default_plugin/map_display.cpp#L322
export const defaultObstacleGridPalette = (() => {
  const buff = new Uint8Array(256 * 4);
  let buff_index = 0;

  // zero values have alpha=0
  buff[buff_index++] = 0;  // red
  buff[buff_index++] = 0;  // green
  buff[buff_index++] = 0;  // blue
  buff[buff_index++] = 0;  // alpha

  // Blue to red spectrum for most normal cost values
  for (let i = 1; i <= 98; i++)
  {
    const v = (255 * i) / 100;
    buff[buff_index++] = v;        // red
    buff[buff_index++] = 0;        // green
    buff[buff_index++] = 255 - v;  // blue
    buff[buff_index++] = 255;      // alpha
  }

  // inscribed obstacle values (99) in cyan
  buff[buff_index++] = 0;     // red
  buff[buff_index++] = 255;  // green
  buff[buff_index++] = 255;  // blue
  buff[buff_index++] = 255;  // alpha

  // lethal obstacle values (100) in purple
  buff[buff_index++] = 255;  // red
  buff[buff_index++] = 0;    // green
  buff[buff_index++] = 255;  // blue
  buff[buff_index++] = 255;  // alpha

  // illegal positive values in green
  for (let i = 101; i <= 127; i++)
  {
    buff[buff_index++] = 0;    // red
    buff[buff_index++] = 255;  // green
    buff[buff_index++] = 0;    // blue
    buff[buff_index++] = 255;  // alpha
  }

  // illegal negative (char) values in shades of red/yellow
  for (let i = 128; i <= 254; i++)
  {
    buff[buff_index++] = 255;                              // red
    buff[buff_index++] = (255 * (i - 128)) / (254 - 128);  // green
    buff[buff_index++] = 0;                                // blue
    buff[buff_index++] = 255;                              // alpha
  }

  // legal -1 value is tasteful blueish greenish grayish color
  buff[buff_index++] = 0x70;  // red
  buff[buff_index++] = 0x89;  // green
  buff[buff_index++] = 0x86;  // blue
  buff[buff_index++] = 255;   // alpha

  // Override individual colors below
  // https://github.com/cjds/carl/blob/master/carrack_ros/map_updater/include/impl/controller_costmap_republisher_block.hpp#L40
  setRgba(buff, 255 * 4, tinycolor("#559d95"));  // -1 UNKNOWN
  setRgba(buff, 0 * 4, tinycolor.fromRatio({r: 1, g: 1, b: 1, a: 0}));  // 0 FREE SPACE

  return buff;
})();

// convert a number array to a typed array
// passing a typed array to regl is orders of magnitude
// faster than passing a number[] and letting regl do the conversion
function toTypedArray(data: $ReadOnlyArray<number> | Int8Array): Uint8Array {
  if (data instanceof Int8Array) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i];
  }
  return result;
}

class TextureCacheEntry {
  marker: OccupancyGridMessage;
  texture: any;
  // regl context
  regl: any;

  constructor(regl: any, marker: OccupancyGridMessage) {
    this.marker = marker;
    this.regl = regl;
    const { info, data } = marker;

    this.texture = regl.texture({
      format: "alpha",
      mipmap: false,
      data: toTypedArray(data),
      width: info.width,
      height: info.height,
    });
  }

  // get the texture for a marker
  // if the marker is not the same reference
  // generate a new texture, otherwise keep the old one
  // uploading new texture data to the gpu is something
  // you only want to do when required - it takes several milliseconds
  getTexture(marker: OccupancyGridMessage) {
    if (this.marker === marker) {
      return this.texture;
    }
    this.marker = marker;
    const { info, data } = marker;
    this.texture = this.texture({
      format: "alpha",
      mipmap: false,
      data: toTypedArray(data),
      width: info.width,
      height: info.height,
    });
    return this.texture;
  }
}

export class TextureCache {
  store: { [string]: TextureCacheEntry } = {};
  // regl context
  regl: any;

  constructor(regl: any) {
    this.regl = regl;
  }

  // returns a regl texture for a given marker
  get(marker: OccupancyGridMessage) {
    const { name } = marker;
    const item = this.store[name];
    if (!item) {
      // if the item is missing initialize a new entry
      const entry = new TextureCacheEntry(this.regl, marker);
      this.store[name] = entry;
      return entry.texture;
    }
    return item.getTexture(marker);
  }
}
