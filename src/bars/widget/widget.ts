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

import WidgetBar from "./widget_bar";
import { setIcon, View } from "obsidian";

export abstract class Widget {
    protected readonly view: View;
    protected readonly widgetBar: WidgetBar;

    constructor(view: View, widgetBar: WidgetBar) {
        this.view = view;
        this.widgetBar = widgetBar;
    }

    abstract create(): HTMLElement;
}

export abstract class ButtonWidget extends Widget {
    protected readonly icon: string;
    protected readonly label: string;
    protected buttonEl: HTMLAnchorElement;

    protected constructor(view: View, widgetBar: WidgetBar, icon: string, label: string) {
        super(view, widgetBar);
        this.icon = icon;
        this.label = label;
    }

    create(): HTMLElement {
        this.buttonEl = document.createElement("a");
        this.buttonEl.addClass("clickable-icon");
        this.buttonEl.addClass("view-action");
        this.buttonEl.addClass("bifrost-button-widget");
        this.buttonEl.ariaLabel = this.label;
        setIcon(this.buttonEl, this.icon);

        this.buttonEl.addEventListener("click", (event: MouseEvent) => { this.onClicked(event) });

        return this.buttonEl;
    }

    protected abstract onClicked(event: MouseEvent): void;
}
