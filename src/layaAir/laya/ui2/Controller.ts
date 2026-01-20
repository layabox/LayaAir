import { EventDispatcher } from "../events/EventDispatcher";
import type { GWidget } from "./GWidget";
import { Event } from "../events/Event";
import { ControllerRef } from "./ControllerRef";
import { Mutable } from "../../ILaya";
import { GearDisplay } from "./gear/GearDisplay";

/**
 * @en A controller defines a set of pages, which can be used in conjunction with Gears to switch the properties of nodes between different pages.
 * @zh 控制器定义了一组页面，通过与齿轮(Gears)配合使用，可以实现节点的属性在不同页面间切换。
 */
export class Controller extends EventDispatcher {
    private _selectedIndex: number;
    private _previousIndex: number;
    private _pages: string[];

    /** @readonly */
    owner: GWidget;
    /** @readonly */
    name: string;

    /**
     * @en Indicates whether the controller is currently changing.
     * @zh 指示控制器当前是否正在更改。
     */
    readonly changing: boolean;

    /**
     * @internal
     */
    _refs: Set<ControllerRef>;

    /** @ignore @blueprintIgnore */
    constructor() {
        super();

        this.name = "";
        this._pages = [];
        this._selectedIndex = -1;
        this._previousIndex = -1;
        this._refs = new Set();
    }

    /**
     * @en Pages of the controller.
     * @zh 控制器的页面。
     */
    get pages(): Array<string> {
        return this._pages;
    }

    set pages(value: Array<string>) {
        this._pages = value;

        if (value.length > 0 && this._selectedIndex == -1)
            this.selectedIndex = 0;
    }

    /**
     * @en The number of pages in the controller.
     * @zh 控制器中的页面数量。
     */
    get numPages() {
        return this._pages.length;
    }

    set numPages(value: number) {
        this._pages.length = value;
        for (let i = 0; i < value; i++)
            if (this._pages[i] == null) this._pages[i] = "";
    }

    /**
     * @en Adds a new page to the controller.
     * @param name The name of the new page. If not provided, an empty string will be used.
     * @zh 向控制器添加一个新页面。
     * @param name 新页面的名称。如果未提供，将使用空字符串。
     */
    addPage(name?: string) {
        name = name || "";
        this._pages.push(name);

        if (this._selectedIndex == -1)
            this.selectedIndex = 0;

        return this;
    }

    /**
     * @en Index of the currently selected page.
     * @zh 当前选中页面的索引。
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value: number) {
        if (this._pages.length == 0)
            return;

        if (this._selectedIndex != value) {
            if (value > this._pages.length - 1) {
                console.warn(`index out of bounds: ${value}`);
                return;
            }

            this._previousIndex = this._selectedIndex;
            this._selectedIndex = value;

            (<Mutable<this>>this).changing = true;
            try {
                for (let ref of this._refs) {
                    ref.onChanged(this);
                }
                GearDisplay.checkAll(this);
                this.event(Event.CHANGED);
            }
            finally {
                (<Mutable<this>>this).changing = false;
            }
        }
    }

    /**
     * @en Name of the currently selected page.
     * @zh 当前选中页面的名称。
     */
    get selectedPage(): string {
        if (this._selectedIndex < 0 || this._selectedIndex >= this._pages.length)
            return null;
        else
            return this._pages[this._selectedIndex];
    }

    set selectedPage(value: string) {
        let i = this._pages.indexOf(value);
        if (i === -1)
            i = 0;
        this.selectedIndex = i;
    }

    /**
     * @en Index of the previously selected page.
     * @zh 上一个选中页面的索引。
     */
    get previousIndex(): number {
        return this._previousIndex;
    }

    /**
     * @en Index of the opposite page. ie. If the current index is 0, the opposite index will be 1, else if the current index is greate than 0, the opposite index will be 0.
     * @zh 相反页面的索引。即如果当前索引为0，则相反索引为1；如果当前索引大于0，则相反索引为0。
     */
    set oppositeIndex(value: number) {
        if (value > 0)
            this.selectedIndex = 0;
        else if (this._pages.length > 1)
            this.selectedIndex = 1;
    }

    /** @internal @blueprintEvent */
    Controller_bpEvent: {
        [Event.CHANGED]: () => void;
    };
}