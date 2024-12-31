import { Event } from "../../events/Event";
import { SelectionMode } from "../Const";
import type { GWidget } from "../GWidget";

export interface ISelection {
    mode: SelectionMode;
    scrollItemToViewOnClick: boolean;
    index: number;

    get(out?: number[]): number[];
    add(index: number, scrollItToView?: boolean): void;
    remove(index: number): void;
    clear(): void;
    selectAll(): void;
    selectReverse(): void;
    enableFocusEvents(enabled: boolean): void;
    handleClick(item: GWidget, evt: Event): void;
    enableArrowKeyNavigation(enabled: boolean, keySelectEvent?: string): void;
    handleArrowKey(dir: number): number;
}