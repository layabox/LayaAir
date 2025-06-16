import { GWidget } from "./GWidget";
import { Layout } from "./layout/Layout";
import { ILayout } from "./layout/ILayout";
import { LayoutChangedReason } from "./Const";
import { UIEvent } from "./UIEvent";

/**
 * @blueprintInheritable
 */
export class GBox extends GWidget {
    protected _layout: ILayout;

    constructor(layoutClass?: new (...args: any[]) => ILayout) {
        super();

        this._layout = new (layoutClass || Layout)(this);
    }

    public get layout(): ILayout {
        return this._layout;
    }

    public setLayoutChangedFlag(reason?: LayoutChangedReason): void {
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