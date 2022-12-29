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
import Widget from "./widget";
import SearchWidget from "./search_widget";

export default class WidgetBar {
    private readonly view: View;
    private readonly widgetBarEl: HTMLDivElement;
    private readonly widgets: Array<Widget>;

    constructor(view: View) {
        this.view = view;

        this.widgetBarEl = view.headerEl.find(".view-header-title-container") as HTMLDivElement;
        this.widgetBarEl.empty();
        this.widgetBarEl.addClass("bifrost-widget-bar");

        this.widgets = new Array<Widget>();

        this.addWidgets();
        this.registerWidgets();
    }

    private addWidgets() {
        this.widgets.push(new SearchWidget(this.view, this));
    }

    private registerWidgets() {
        for (const widget of this.widgets) {
            this.widgetBarEl.appendChild(widget.create());
        }
    }
}
