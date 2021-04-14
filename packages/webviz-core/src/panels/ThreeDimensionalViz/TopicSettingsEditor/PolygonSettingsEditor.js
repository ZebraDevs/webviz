// @flow
//
//  Copyright (c) 2020-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

import React from "react";

import { type TopicSettingsEditorProps } from ".";
import { SLabel, SInput } from "./common";
import Flex from "webviz-core/src/components/Flex";
import Icon from "webviz-core/src/components/Icon";
import { getGlobalHooks } from "webviz-core/src/loadWebviz";
import type { OccupancyGridMessage } from "webviz-core/src/types/Messages";
import { colors } from "webviz-core/src/util/sharedStyleConstants";
import ColorPickerForTopicSettings from "./ColorPickerForTopicSettings";

type OccupancyGridSettings = {|
    scale?: number,
        overrideColor ?: ? string,
|};

export default function PolygonSettingsEditor(props: TopicSettingsEditorProps<OccupancyGridMessage, PolygonSettings>) {
    const { message, settings, onFieldChange, onSettingsChange } = props;
    const alpha = settings.alpha != null ? settings.alpha : 1.0;
    const scale = settings.scale != null ? settings.scale : 0.2;

    if (!message) {
        return (
            <div style={{ color: colors.TEXT_MUTED }}>
                <small>Waiting for messages...</small>
            </div>
        );
    }
    const copy = getGlobalHooks().perPanelHooks().ThreeDimensionalViz.copy.OccupancyGridSettingsEditor;
    return (
        <Flex col>
            <SLabel>Color of outline</SLabel>
            <ColorPickerForTopicSettings
                color={settings.overrideColor}
                onChange={(newColor) => onFieldChange("overrideColor", newColor)}
            />
            <SLabel>Scale</SLabel>
            <SInput
                type="number"
                value={scale.toString()}
                step={0.01}
                onChange={(e) => onSettingsChange({ ...settings, scale: parseFloat(e.target.value) })}
            />
        </Flex>
    );
}