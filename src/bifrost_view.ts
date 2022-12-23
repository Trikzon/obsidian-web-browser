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
import { ItemView } from "obsidian";
import BifrostPlugin from "./main";

export const BIFROST_VIEW_TYPE = "bifrost-view";

export class BifrostView extends ItemView {
    private webview: Electron.WebviewTag;

    static async spawnBifrostView(newLeaf: boolean) {
        await app.workspace.getLeaf(newLeaf).setViewState({ type: BIFROST_VIEW_TYPE });
    }

    async onOpen() {
        this.contentEl.addClass("bifrost-view-content");

        this.webview = document.createElement("webview");
        this.webview.addClass("bifrost-webview");
        this.contentEl.appendChild(this.webview);

        this.webview.setAttribute("src", BifrostPlugin.get().settings.url);
    }

    getDisplayText(): string {
        return "Bifröst";
    }

    getViewType(): string {
        return BIFROST_VIEW_TYPE;
    }
}
