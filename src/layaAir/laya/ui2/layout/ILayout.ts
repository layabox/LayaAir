import { StretchParam } from "../StretchParam";
import { AlignType, VAlignType, LayoutType, PageMode, LayoutChangedReason, StretchMode } from "../Const";
import { Point } from "../../maths/Point";

export interface ILayout {

    get type(): LayoutType;
    set type(value: LayoutType);

    get rows(): number;
    set rows(value: number);

    get columns(): number;
    set columns(value: number);

    get rowGap(): number;
    set rowGap(value: number);

    get columnGap(): number;
    set columnGap(value: number);

    /**
     * [UP，RIGHT，DOWN，LEFT]
     */
    get padding(): Array<number>;
    set padding(value: Array<number>);

    get align(): AlignType;
    set align(value: AlignType);

    get valign(): VAlignType;
    set valign(value: VAlignType);

    get stretchX(): StretchMode;
    set stretchX(value: StretchMode);

    get stretchY(): StretchMode;
    set stretchY(value: StretchMode);

    get stretchParamsX(): Array<StretchParam>;
    get stretchParamsY(): Array<StretchParam>;

    get foldInvisibles(): boolean;
    set foldInvisibles(value: boolean);

    get minChildSize(): number;
    set minChildSize(value: number);

    get pageMode(): PageMode;
    set pageMode(value: PageMode);

    get viewWidth(): number;
    set viewWidth(value: number);

    get viewHeight(): number;
    set viewHeight(value: number);

    get contentWidth(): number;
    set contentWidth(value: number);

    get contentHeight(): number;
    set contentHeight(value: number);

    /**
     * dir正数表示右移或者下移，负数表示左移或者上移
     */
    getSnappingPosition(xValue: number, yValue: number, xDir: number, yDir: number, resultPoint?: Point): Point;

    resizeToFit(childCount?: number, minSize?: number): void;

    setChangedFlag(reason?: LayoutChangedReason): void;

    refresh(force?: boolean): void;

    /** @internal */
    setContentSize(aw: number, ah: number): void;

    /** @internal */
    _disabled: boolean;
}
