import { GWidget } from "./GWidget";
import { Layout } from "./layout/Layout";
import { ILayout } from "./layout/ILayout";
import { LayoutChangedReason } from "./Const";
import { UIEvent } from "./UIEvent";

/**
 * @en GBox is a container widget that uses a layout to arrange its children.
 * @zh GBox 是一个容器小部件，使用布局来排列其子元素。
 * @blueprintInheritable
 */
export class GBox extends GWidget {
    protected _layout: ILayout;

    constructor(layoutClass?: new (...args: any[]) => ILayout) {
        super();

        this._layout = new (layoutClass || Layout)(this);
    }

    /**
     * @en The layout used by this GBox to arrange its children.
     * @zh 此 GBox 用于排列其子元素的布局。
     */
    get layout(): ILayout {
        return this._layout;
    }

    /**
     * @en Sets the flag indicating that the layout has changed.
     * @param reason The reason for the layout change, if any.
     * @zh 设置标志，指示布局已更改。
     * @param reason 布局更改的原因（如果有的话）。
     */
    setLayoutChangedFlag(reason?: LayoutChangedReason): void {
        this._layout?.setChangedFlag(reason);
    }

    protected _sizeChanged(changeByLayout?: boolean): void {
        if (changeByLayout)
            this._layout.refresh();
    }

    /** @internal @blueprintEvent */
    GBox_bpEvent: {
        [UIEvent.ContentSizeChanged]: () => void;
    };
}