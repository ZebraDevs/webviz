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

type OccupancyGridSettings = {|
    alpha?: number,
        map ?: "map" | "local_obstacles",
|};

export default function OccupancyGridSettingsEditor(props: TopicSettingsEditorProps<OccupancyGridMessage, OccupancyGridSettings>) {
    const { message, settings, onFieldChange, onSettingsChange } = props;
    const badrgbOverloadTypeSetting = React.useMemo(() => !["map", "local_obstacles"].includes(settings.map), [
        settings,
    ]);
    const alpha = settings.alpha != null ? settings.alpha : 0.5;

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
            <SLabel>NOTE: Changes in this panel will only take effect when you play next or move the slider.</SLabel>
            <SLabel>Map Colors</SLabel>
            <div
                style={{ display: "flex", margin: "4px", flexDirection: "column" }}
                onChange={(e) => {
                    onSettingsChange({ ...settings, map: e.target.value });
                }}>
                {[
                    { value: "map", title: "Normal Map Colors" },
                    { value: "local_obstacles", title: "Local Obstacle Map Colors" },
                ].map(({ value, title }) => (
                    <div key={value} style={{ marginBottom: "4px", display: "flex" }}>
                        <input
                            type="radio"
                            value={value}
                            checked={settings.map === value || (value === "map" && badrgbOverloadTypeSetting)}
                        />
                        <label>{title}</label>
                    </div>
                ))}
            </div>
            <SLabel>Alpha</SLabel>
            <SInput
                type="number"
                value={alpha.toString()}
                min={0}
                max={1}
                step={0.1}
                onChange={(e) => onSettingsChange({ ...settings, alpha: parseFloat(e.target.value) })}
            />
        </Flex>
    );
}