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
import { DropdownComponent, PluginSettingTab, Setting } from "obsidian";
import { BifrostSettings } from "./settings";

export class BifrostSettingTab extends PluginSettingTab {
    display() {
        const settings = BifrostSettings.get();

        // TODO: Create different tabs of settings (e.g. Chrome or Firefox Settings)
        new Setting(this.containerEl)
            .setName("Search Engine")
            .setDesc("")
            .addDropdown((component: DropdownComponent) => {
                for (const name of Object.keys(settings.searchEngines)) {
                    component.addOption(name, name);
                }
                component.setValue(settings.searchEngine);

                component.onChange((value: string) => {
                    settings.searchEngine = value;
                    settings.save();
                });
            });
    }

    hide() {
        this.containerEl.empty();
    }
}
