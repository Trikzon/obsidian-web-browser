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
import WidgetBar from "../bars/widget/widget_bar";
import RenamableItemView from "./renamable_item_view";
import { Navigable, NavigatedCallback } from "./navigable";
import { webContents } from "@electron/remote";
import { ViewStateResult } from "obsidian";
import { FindBar } from "../bars/find_bar";

export const WEB_VIEW_TYPE = "bifrost-web-view";

export interface WebViewState {
    url: string
}

export class WebView extends RenamableItemView implements Navigable {
    private readonly navigatedCallbacks: Array<NavigatedCallback> = new Array<NavigatedCallback>();
    public webviewEl: Electron.WebviewTag;
    private widgetBar: WidgetBar;
    public findBar: FindBar;

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
        this.findBar = new FindBar(this);

        this.webviewEl.addEventListener("focus", (_: FocusEvent) => {
            app.workspace.setActiveLeaf(this.leaf);
        });
        this.webviewEl.addEventListener("page-title-updated", (event: Electron.PageTitleUpdatedEvent) => {
            this.rename(event.title);
        });
        this.webviewEl.addEventListener("will-navigate", (event: Electron.WillNavigateEvent) => {
            this.navigate(event.url, true, false);
        });
        this.webviewEl.addEventListener("did-navigate-in-page", (event: Electron.DidNavigateInPageEvent) => {
            this.navigate(event.url, true, false);
        });
        this.webviewEl.addEventListener("dom-ready", (_: Event) => {
            const contents = webContents.fromId(this.webviewEl.getWebContentsId());

            // TODO: Fix bug where when the plugin is disabled and re-enabled, already opened WebViews have duplicated
            //       setWindowOpenHandler implementations causing multiple tabs to be opened.
            contents.setWindowOpenHandler((details: Electron.HandlerDetails) => {
                WebView.spawn(true, { url: details.url });

                return { action: "allow" };
            });

            // TODO: Fix bug where this event gets fired multiple times when the plugin is disabled and re-enabled.
            //       Likely the same issue as the contents.setWindowOpenHandler duplicating.
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

            contents.on("destroyed", () => {
            });
        });
    }

    async setState(state: WebViewState, result: ViewStateResult) {
        this.navigate(state.url, false, true);
    }

    getState(): WebViewState {
        return { url: this.webviewEl.src };
    }

    getViewType(): string {
        return WEB_VIEW_TYPE;
    }

    navigate(url: string, addToHistory: boolean, updateWebview: boolean) {
        if (addToHistory) {
            // TODO: Replace all references to a url as a string with a URL object.
            const newUrl = new URL(url);
            const currentUrl = new URL(this.getUrl());

            // Add current URL to history if new host is different.
            if (newUrl.host !== currentUrl.host) {
                this.addToHistory();
            // Add current URL to history if new pathname is different.
            } else if (newUrl.pathname !== currentUrl.pathname) {
                this.addToHistory();
            } else {
                const newFirstSearchParam = newUrl.searchParams.entries().next().value;
                const currentFirstSearchParam = currentUrl.searchParams.entries().next().value;

                // Add current URL to history if one has search params but the other doesn't.
                if (!newFirstSearchParam !== !currentFirstSearchParam) {
                    this.addToHistory();
                } else if (newFirstSearchParam && currentFirstSearchParam) {
                    // TODO: Assess whether this is a good way of doing this.
                    // Add current URL to history if new first search parameter is different.
                    // This allows urls such as https://duckduckgo.com/?q=test and https://duckduckgo.com/?q=test&ia=definition
                    // to not repeatedly be added to the history, but https://duckduckgo.com/?q=example will.
                    if (newFirstSearchParam[0] !== currentFirstSearchParam[0] || newFirstSearchParam[1] !== currentFirstSearchParam[1]) {
                        this.addToHistory();
                    }
                }
            }
        }
        if (updateWebview) {
            this.webviewEl.src = url;
        }
        for (const callback of this.navigatedCallbacks) {
            callback(url);
        }
    }

    private addToHistory() {
        this.leaf.history.backHistory.push({
            state: {
                type: WEB_VIEW_TYPE,
                state: this.getState()
            },
            title: this.displayName,
            icon: "search"
        });
        this.headerEl.children[1].children[0].setAttribute("aria-disabled", "false");
    }

    on(name: "navigated", callback: NavigatedCallback) {
        this.navigatedCallbacks.push(callback);
    }

    getUrl(): string {
        return this.webviewEl.src;
    }
}
