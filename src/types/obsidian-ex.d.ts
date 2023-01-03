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
import BifrostPlugin from "../main";
import { Command } from "obsidian";

declare module "obsidian" {
    interface App {
        commands: {
            commands: {
                [id: string]: Command
            }
        },
        plugins: {
            plugins: {
                bifrost: BifrostPlugin
            }
        }
    }
    interface History {
        state: {
            type: string,
            state: any
        },
        title: string,
        icon: string
    }
    interface View {
        headerEl: HTMLDivElement;
    }
    interface WorkspaceLeaf {
        history: {
            backHistory: Array<History>,
            forwardHistory: Array<History>
        },
        tabHeaderInnerTitleEl: HTMLDivElement;
    }
}
