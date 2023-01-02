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
import { View } from "obsidian";
import { Widget } from "./widget";
import SearchWidget from "./search_widget";
import { ExternalBrowserWidget } from "./external_browser_widget";

export default class WidgetBar {
    private readonly view: View;
    private readonly leftWidgetContainer: HTMLDivElement;
    private readonly centerWidgetContainer: HTMLDivElement;
    private readonly rightWidgetContainer: HTMLDivElement;

    constructor(view: View) {
        this.view = view;

        this.leftWidgetContainer = view.headerEl.find(".view-header-nav-buttons") as HTMLDivElement;
        this.leftWidgetContainer.addClass("bifrost-left-widget-container");

        this.centerWidgetContainer = view.headerEl.find(".view-header-title-container") as HTMLDivElement;
        this.centerWidgetContainer.empty();
        this.centerWidgetContainer.addClass("bifrost-center-widget-container");

        this.rightWidgetContainer = view.headerEl.find(".view-actions") as HTMLDivElement;
        this.rightWidgetContainer.addClass("bifrost-right-widget-container");

        this.addWidgets();
    }

    private addWidgets() {
        this.addWidget(new SearchWidget(this.view, this), "center");

        this.addWidget(new ExternalBrowserWidget(this.view, this), "right");
    }

    public addWidget(widget: Widget, location: "left" | "center" | "right") {
        switch (location) {
            case "left":
                this.leftWidgetContainer.appendChild(widget.create()); break;
            case "center":
                this.centerWidgetContainer.appendChild(widget.create()); break;
            case "right":
                this.rightWidgetContainer.prepend(widget.create()); break;
        }
    }
}
