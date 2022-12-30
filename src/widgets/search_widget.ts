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
import Widget from "./widget";
import { isNavigable, Navigable } from "../views/navigable";
import { WebView } from "../views/web_view";

export default class SearchWidget extends Widget {
    private inputEl: HTMLInputElement;

    create(): HTMLElement {
        this.inputEl = document.createElement("input");
        this.inputEl.addClass("bifrost-search-widget");
        this.inputEl.type = "text";
        this.inputEl.placeholder = "Search with DuckDuckGo or enter address";

        if (isNavigable(this.view)) {
            const navigable: Navigable = this.view;

            this.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    navigable.navigate(this.sanitizeSearch(this.inputEl.value), true);
                }
            }, false);

            navigable.on("navigated", (url: string) => {
                this.inputEl.value = url;
            });
        } else {
            this.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    WebView.spawn(event.metaKey, { url: this.sanitizeSearch(this.inputEl.value) });
                }
            }, false);
        }

        return this.inputEl;
    }

    private sanitizeSearch(search: string): string {
        let url: URL;
        try {
            url = new URL(search);
        } catch {
            url = new URL("https://" + search);
        }

        // If the search is [non-whitespace characters] + "." + [non-whitespace characters], treat it as a URL.
        // Otherwise, treat it as a search query for a search engine.
        const matches = url.host.match(/\S+\.\S+/g);
        if (!(matches && matches[0] === url.host)) {
            url = new URL(search, "https://duckduckgo.com/?q=");
        }

        return url.href;
    }
}
