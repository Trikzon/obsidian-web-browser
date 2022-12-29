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
import { ItemView, WorkspaceLeaf } from "obsidian";

export default abstract class RenamableItemView extends ItemView {
    public displayName: string;

    constructor(leaf: WorkspaceLeaf, displayName: string) {
        super(leaf);
        this.displayName = displayName;
    }

    public rename(displayName: string) {
        this.displayName = displayName;
        this.leaf.tabHeaderInnerTitleEl.innerText = displayName;
    }

    getDisplayText(): string {
        return this.displayName;
    }
}
