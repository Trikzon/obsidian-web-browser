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

export type NavigatedCallback = (url: string) => void;

export interface Navigable {
    navigate(url: string, updateWebview: boolean): void;
    on(name: "navigated", callback: NavigatedCallback): void;
}

export function isNavigable(instance: any): instance is Navigable {
    try {
        return "navigate" in instance && typeof instance.navigate === "function"
            && "on" in instance && typeof instance.on === "function";
    } catch { // If instance is a primitive type, it will cause an error.
        return false;
    }
}