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
import WidgetBar from "../widgets/widget_bar";
import RenamableItemView from "./renamable_item_view";
import { Navigable, NavigatedCallback } from "./navigable";

export const WEB_VIEW_TYPE = "bifrost-web-view";

export class WebView extends RenamableItemView implements Navigable {
    private readonly navigatedCallbacks: Array<NavigatedCallback> = new Array<NavigatedCallback>();
    private webviewEl: Electron.WebviewTag;
    private widgetBar: WidgetBar;

    static async spawnBifrostView(newLeaf: boolean) {
        await app.workspace.getLeaf(newLeaf).setViewState({ type: WEB_VIEW_TYPE });
    }

    async onOpen() {
        this.contentEl.addClass("bifrost-view-content");
        this.navigation = true;

        this.webviewEl = document.createElement("webview");
        this.webviewEl.addClass("bifrost-webview");
        this.contentEl.appendChild(this.webviewEl);

        this.widgetBar = new WidgetBar(this);

        this.navigate(BifrostPlugin.get().settings.url, true);

        this.webviewEl.addEventListener("dom-ready", (_: Event) => {
            this.onDomReady();
        });
    }

    private onDomReady() {
        this.webviewEl.addEventListener("page-title-updated", (event: Electron.PageTitleUpdatedEvent) => {
            this.rename(event.title);
        });
        this.webviewEl.addEventListener("will-navigate", (event: Electron.WillNavigateEvent) => {
            this.navigate(event.url, false);
        });
        this.webviewEl.addEventListener("did-navigate-in-page", (event: Electron.DidNavigateInPageEvent) => {
            this.navigate(event.url, false);
        });
    }

    getViewType(): string {
        return WEB_VIEW_TYPE;
    }

    navigate(url: string, updateWebview: boolean) {
        if (updateWebview) {
            this.webviewEl.src = url;
        }

        for (const callback of this.navigatedCallbacks) {
            callback(url);
        }
    }

    on(name: "navigated", callback: NavigatedCallback) {
        this.navigatedCallbacks.push(callback);
    }
}
