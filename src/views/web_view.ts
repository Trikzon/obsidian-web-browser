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
import WidgetBar from "../widgets/widget_bar";
import RenamableItemView from "./renamable_item_view";
import { Navigable, NavigatedCallback } from "./navigable";
import { webContents } from "@electron/remote";
import { ViewStateResult } from "obsidian";

export const WEB_VIEW_TYPE = "bifrost-web-view";

export interface WebViewState {
    url: string
}

export class WebView extends RenamableItemView implements Navigable {
    private readonly navigatedCallbacks: Array<NavigatedCallback> = new Array<NavigatedCallback>();
    private webviewEl: Electron.WebviewTag;
    private widgetBar: WidgetBar;

    static async spawn(newLeaf: boolean, state: WebViewState) {
        await app.workspace.getLeaf(newLeaf).setViewState({ type: WEB_VIEW_TYPE, active: true, state });
    }

    async onOpen() {
        this.contentEl.addClass("bifrost-view-content");
        this.navigation = true;

        this.webviewEl = document.createElement("webview");
        this.webviewEl.addClass("bifrost-webview");
        this.contentEl.appendChild(this.webviewEl);

        this.widgetBar = new WidgetBar(this);

        this.webviewEl.addEventListener("focus", (_: FocusEvent) => {
            app.workspace.setActiveLeaf(this.leaf);
        });
        this.webviewEl.addEventListener("page-title-updated", (event: Electron.PageTitleUpdatedEvent) => {
            this.rename(event.title);
        });
        this.webviewEl.addEventListener("will-navigate", (event: Electron.WillNavigateEvent) => {
            this.navigate(event.url, false);
        });
        this.webviewEl.addEventListener("did-navigate-in-page", (event: Electron.DidNavigateInPageEvent) => {
            this.navigate(event.url, false);
        });
        this.webviewEl.addEventListener("dom-ready", (_: Event) => {
            const contents = webContents.fromId(this.webviewEl.getWebContentsId());

            contents.setWindowOpenHandler((details: Electron.HandlerDetails) => {
                WebView.spawn(true, { url: details.url });

                return { action: "deny" };
            })

            // Get the keyboard events from the webview and dispatch it to Obsidian.
            // Credit to @Quorafind on GitHub who submitted this as a PR before Bifröst rewrite.
            contents.on("before-input-event", (event: Electron.Event, input: Electron.Input) => {
                if (input.type !== "keyDown") { return; }

                activeDocument.body.dispatchEvent(new KeyboardEvent("keydown", {
                    code: input.code,
                    key: input.key,
                    shiftKey: input.shift,
                    altKey: input.alt,
                    ctrlKey: input.control,
                    metaKey: input.meta,
                    repeat: input.isAutoRepeat
                }));
            });
        });
    }

    async setState(state: WebViewState, result: ViewStateResult) {
        this.navigate(state.url, true);
    }

    getState(): WebViewState {
        return { url: this.webviewEl.src };
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
