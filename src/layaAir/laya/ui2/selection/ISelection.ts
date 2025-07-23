import { Event } from "../../events/Event";
import { SelectionMode } from "../Const";
import type { GWidget } from "../GWidget";

export interface ISelection {
    /**
     * @en The selection mode of the selection.
     * @zh 选择的模式。
     */
    mode: SelectionMode;

    /**
     * @en Scroll the item into view when it is selected.
     * @zh 选择时滚动到视图中。
     */
    scrollItemToViewOnClick: boolean;

    /**
     * @en The currently selected item.
     * @zh 当前选中的项。
     */
    get index(): number;
    set index(value: number);

    /**
     * @en The currently selected items.
     * @param out An optional array to store the selected items.
     * @returns The currently selected items.
     * @zh 当前选中的项。
     * @param out 可选的数组，用于存储选中的项。 
     * @returns 返回当前选中的项。
     */
    get(out?: number[]): number[];

    /**
     * @en Add an item to the selection.
     * @param index The index of the item to add.
     * @param scrollItToView Whether to scroll the item into view.
     * @zh 添加一个项到选择中。
     * @param index 要添加的项的索引。
     * @param scrollItToView 是否将该项滚动到视图中。
     */
    add(index: number, scrollItToView?: boolean): void;

    /**
     * @en Remove an item from the selection.
     * @param index The index of the item to remove.
     * @zh 从选择中移除一个项。
     * @param index 要移除的项的索引。
     */
    remove(index: number): void;

    /**
     * @en Clear the selection.
     * @zh 清除选择。
     */
    clear(): void;

    /**
     * @en Select all items.
     * @zh 选择所有项。
     */
    selectAll(): void;

    /**
     * @en Invert the selection.
     * @zh 反选。
     */
    selectReverse(): void;

    /**
     * @en Enable or disable focus events.
     * @param enabled Whether to enable focus events.
     * @zh 启用或禁用焦点事件。
     * @param enabled 是否启用焦点事件。 
     */
    enableFocusEvents(enabled: boolean): void;

    /**
     * @en Enable or disable arrow key navigation.
     * @param enabled Whether to enable arrow key navigation. 
     * @param keySelectEvent The event name to trigger when an item is selected using arrow keys.
     * @zh 启用或禁用箭头键导航。
     * @param enabled 是否启用箭头键导航。
     * @param keySelectEvent 使用箭头键选择项时触发的事件名称。
     */
    enableArrowKeyNavigation(enabled: boolean, keySelectEvent?: string): void;

    /** @ignore @blueprintIgnore */
    handleClick(item: GWidget, evt: Event): void;

    /** @ignore @blueprintIgnore */
    handleArrowKey(dir: number): number;

    /** @internal */
    destroy(): void;

    /** @internal */
    _refresh(): void;
}