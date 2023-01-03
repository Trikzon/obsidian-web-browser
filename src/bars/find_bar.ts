/*
 * This file is part of obsidian-bifrost. (https://github.com/trikzon/obsidian-bifrost)
 * Copyright (C) 2023 Dion Tryban (aka Trikzon)
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

import { WebView } from "../views/web_view";

export class FindBar {
    private readonly barEl: HTMLDivElement;
    private readonly buttonPrevEl: HTMLButtonElement;
    private readonly buttonNextEl: HTMLButtonElement;
    private readonly buttonCloseEl: HTMLSpanElement;
    private readonly inputEl: HTMLInputElement;
    private readonly ordinalEl: HTMLDivElement;
    private readonly matchesEl: HTMLDivElement;
    private readonly webView: WebView;

    public constructor(webView: WebView) {
        this.webView = webView;

        this.barEl = document.createElement("div");
        this.barEl.addClass("document-search-container");
        this.barEl.addClass("bifrost-find-bar");
        this.barEl.style.display = "none";
        this.webView.contentEl.prepend(this.barEl);

        const containerEl = this.barEl.createEl("div", { cls: "document-search" });

        this.inputEl = containerEl.createEl("input", {
            cls: "document-search-input",
            placeholder: "Find",
            type: "text"
        });

        const activeMatchEl = containerEl.createEl("div", { cls: "bifrost-find-bar-active-match" });
        this.ordinalEl = activeMatchEl.createEl("div", { text: "0" });
        activeMatchEl.createEl("div", { text: "/" });
        this.matchesEl = activeMatchEl.createEl("div", { text: "0" });

        // TODO: Add aria-labels to the buttons.
        const buttonsEl = containerEl.createEl("div", { cls: "document-search-buttons" });
        this.buttonPrevEl = buttonsEl.createEl("button", { cls: "document-search-button", text: "Prev" });
        this.buttonNextEl = buttonsEl.createEl("button", { cls: "document-search-button", text: "Next" });
        this.buttonCloseEl = buttonsEl.createEl("span", { cls: "document-search-close-button" });

        this.webView.webviewEl.addEventListener("found-in-page", (event: Electron.FoundInPageEvent) => {
            this.ordinalEl.innerText = event.result.activeMatchOrdinal.toString();
            this.matchesEl.innerText = event.result.matches.toString();
        });

        this.inputEl.addEventListener("input", (_: Event) => {
            if (this.inputEl.value !== "") {
                this.webView.webviewEl.findInPage(this.inputEl.value, {
                    forward: true,
                    findNext: true,
                    matchCase: false
                });
            } else {
                this.stopFindInPage();
            }
        });
        this.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
            if (this.inputEl.value !== "" && event.key === "Enter") {
                this.webView.webviewEl.findInPage(this.inputEl.value, {
                    forward: !event.shiftKey,
                    findNext: false,
                    matchCase: false
                });
            } else if (event.key === "Escape") {
                this.toggle();
            }
        });

        this.buttonPrevEl.addEventListener("click", (_: MouseEvent) => {
            if (this.inputEl.value !== "") {
                this.webView.webviewEl.findInPage(this.inputEl.value, {
                    forward: false,
                    findNext: false,
                    matchCase: false
                });
            }
        });
        this.buttonNextEl.addEventListener("click", (_: MouseEvent) => {
            if (this.inputEl.value !== "") {
                this.webView.webviewEl.findInPage(this.inputEl.value, {
                    forward: true,
                    findNext: false,
                    matchCase: false
                });
            }
        });

        this.buttonCloseEl.addEventListener("click", (_: MouseEvent) => {
            this.toggle();
        });
    }

    public toggle() {
        if (this.barEl.style.display === "none") {
            this.barEl.style.display = "";
            this.inputEl.focus();
            this.inputEl.value = "";
        } else {
            this.barEl.style.display = "none";
            this.stopFindInPage();
        }
    }

    private stopFindInPage() {
        this.webView.webviewEl.stopFindInPage("clearSelection");
        this.ordinalEl.innerText = "0";
        this.matchesEl.innerText = "0";
    }
}
