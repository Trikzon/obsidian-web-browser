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
import { Plugin } from "obsidian";
import { BIFROST_VIEW_TYPE, BifrostView } from "./bifrost_view";
import { BifrostSettings, BifrostSettingTab, DEFAULT_SETTINGS } from "./settings";

export default class BifrostPlugin extends Plugin {
    settings: BifrostSettings;

    static get(): BifrostPlugin {
        return app.plugins.plugins["bifrost"];
    }

	async onload() {
        await this.loadSettings();
        this.addSettingTab(new BifrostSettingTab(app, this));

        // TODO: Support Chrome extensions
        // const path = "/Users/diontryban/Library/Mobile Documents/com~apple~CloudDocs/Documents/Projects/Dev Vault/.obsidian/plugins/bifrost-browser/extensions/darkreader-chrome-mv3"
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // require("electron").remote.session.defaultSession.loadExtension(path, { allowFileAccess: true }).then(({ id }: { string }) => {
        //     this.loadedExtensions.push(id);
        //     console.log("Loaded chrome extension with id: " + id);
        // });

        this.registerView(BIFROST_VIEW_TYPE, (leaf) => new BifrostView(leaf));
        this.addCommand({
            id: "test",
            name: "Test",
            callback: () => {
                BifrostView.spawnBifrostView(false);
            }
        })
	}

	onunload() { }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
        await this.saveSettings();
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
