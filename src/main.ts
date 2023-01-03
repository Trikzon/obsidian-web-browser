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
import { ItemView, Plugin, View, WorkspaceLeaf } from "obsidian";
import { WEB_VIEW_TYPE, WebView } from "./views/web_view";
import { BifrostSettings } from "./settings/settings";
import WidgetBar from "./bars/widget/widget_bar";
import { around } from "monkey-around";

export default class BifrostPlugin extends Plugin {
    static get(): BifrostPlugin {
        return app.plugins.plugins["bifrost"];
    }

	async onload() {
        await BifrostSettings.load();

        // TODO: Support Chrome extensions
        // const path = "/Users/diontryban/Library/Mobile Documents/com~apple~CloudDocs/Documents/Projects/Dev Vault/.obsidian/plugins/bifrost-browser/extensions/darkreader-chrome-mv3"
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // require("electron").remote.session.defaultSession.loadExtension(path, { allowFileAccess: true }).then(({ id }: { string }) => {
        //     this.loadedExtensions.push(id);
        //     console.log("Loaded chrome extension with id: " + id);
        // });

        this.registerView(WEB_VIEW_TYPE, (leaf) => new WebView(leaf, "Bifröst"));

        // Add widget bar to empty views.
        app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
            this.addWidgetBarToEmptyView(leaf.view);
        });
        this.registerEvent(app.workspace.on("layout-change", () => {
            const view = this.app.workspace.getActiveViewOfType(ItemView);
            if (view) { this.addWidgetBarToEmptyView(view); }
        }));

        // Patch the window.open function to open external links inside Bifröst's WebView.
        // TODO: Somehow override anchor tags with target="_blank".
        // @ts-ignore
        this.register(around(window, {
            open(old) {
                return function(url?: string | URL, target?: string, features?: string): WindowProxy | null {
                    if (!url) { return old(url, target, features); }

                    // Convert url to type URL.
                    const urlUrl: URL = typeof url === "string" ? new URL(url) : url;

                    // Allows Obsidian to open a popup window if url is "about:blank" and features is not null.
                    // TODO: Find out if there's a better way to detect a popup window.
                    if (urlUrl.toString() === "about:blank" && features) {
                        return old(url, target, features);
                    }

                    // Allow Obsidian to open non-web urls outside Bifröst's WebView.
                    if (urlUrl.protocol !== "http:" && urlUrl.protocol !== "https:") {
                        return old(url, target, features);
                    }

                    WebView.spawn(true, { url: urlUrl.toString() });
                    return null;
                }
            }
        }));

        app.workspace.onLayoutReady(() => this.onLayoutReady());
    }

    private onLayoutReady() {
        this.register(around(app.commands.commands["editor:open-search"], {
            checkCallback(old) {
                return function(checking: boolean): boolean | void {
                    const view = app.workspace.getActiveViewOfType(WebView);
                    if (!view) { return old ? old(checking) : false; }

                    if (!checking) {
                        view.findBar.toggle();
                    }

                    return true;
                }
            }
        }));
    }

    private addWidgetBarToEmptyView(view: View) {
        if (view && view.hasOwnProperty("emptyStateEl")) {
            if (!view.headerEl.find(".bifrost-widget-bar")) {
                new WidgetBar(view);
            }
        }
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(WEB_VIEW_TYPE);

        // Cleanup widget bars from all empty views.
        app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
            if (leaf.view.hasOwnProperty("emptyStateEl")) {
                leaf.detach();
            }
        });
    }
}
