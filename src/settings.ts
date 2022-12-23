/*
 * This file is part of obsidian-bifrost. (https://github.com/trikzon/obsidian-bifrost)
 * Copyright (C) 2022 Dion Tryban (aka Trikzon)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import {App, PluginSettingTab, Setting, TextComponent} from "obsidian";
import BifrostPlugin from "./main";

export interface BifrostSettings {
    url: string,
}

export const DEFAULT_SETTINGS: Partial<BifrostSettings> = {
    url: "https://duckduckgo.com",
};

export class BifrostSettingTab extends PluginSettingTab {
    private plugin: BifrostPlugin;

    constructor(app: App, plugin: BifrostPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        new Setting(this.containerEl)
            .setName("Default url")
            .setDesc("Temporary setting for testing.")
            .addText((component: TextComponent) => {
                component.setValue(this.plugin.settings.url);
                component.onChange((value: string) => {
                    this.plugin.settings.url = value;
                    this.plugin.saveSettings();
                });
            });
    }

    hide() {
        this.containerEl.empty();
    }
}
