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

import BifrostPlugin from "../main";
import { BifrostSettingTab } from "./settings_tab";

export interface SearchEngineInfo {
    icon?: string,
    queryUrl: string,
}

const DEFAULT_SETTINGS: Partial<BifrostSettings> = {
    searchEngine: "DuckDuckGo",
    searchEngines: {
        "Baidu (百度)": {
            queryUrl: "https://www.baidu.com/s?wd="
        },
        "Bing": {
            queryUrl: "https://www.bing.com/search?q="
        },
        "Brave": {
            queryUrl: "https://search.brave.com/search?q="
        },
        "DuckDuckGo": {
            queryUrl: "https://www.duckduckgo.com/?q="
        },
        "Google": {
            queryUrl: "https://www.google.com/search?q="
        },
        "Yahoo": {
            queryUrl: "https://search.yahoo.com/search?p="
        },
        "Yandex": {
            queryUrl: "https://yandex.com/search/?text="
        },
        "Wikipedia": {
            queryUrl: "https://en.wikipedia.org/w/index.php?search="
        }
    }
};

export class BifrostSettings {
    private static instance: BifrostSettings;

    static get(): BifrostSettings {
        if (this.instance) {
            return this.instance;
        }
        throw new Error("BifrostSettings instance is undefined.");
    }

    public searchEngine: string;
    public searchEngines: { [name: string]: SearchEngineInfo };

    public static async load(): Promise<BifrostSettings> {
        const plugin = BifrostPlugin.get();

        this.instance = Object.assign(
            new BifrostSettings(),
            DEFAULT_SETTINGS,
            await plugin.loadData()
        );
        await this.instance.save();

        plugin.addSettingTab(new BifrostSettingTab(app, plugin));

        return this.instance;
    }

    public async save() {
        await BifrostPlugin.get().saveData(this);
    }

    public getActiveSearchEngine(): {name: string, info: SearchEngineInfo} {
        if (!(this.searchEngine in this.searchEngines)) {
            const names = Object.keys(this.searchEngines);
            if (names.length > 0) {
                this.searchEngine = names[0];
            } else {
                if (DEFAULT_SETTINGS.searchEngine && DEFAULT_SETTINGS.searchEngines) {
                    this.searchEngine = DEFAULT_SETTINGS.searchEngine;
                    this.searchEngines = DEFAULT_SETTINGS.searchEngines;
                }
            }
            this.save();
        }
        return { name: this.searchEngine, info: this.searchEngines[this.searchEngine] };
    }
}
