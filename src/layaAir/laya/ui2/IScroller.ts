
import { Rectangle } from "../maths/Rectangle";
import { Prefab } from "../resource/HierarchyResource";
import { ScrollBarDisplay, ScrollBounceBackEffect, ScrollDirection, ScrollTouchEffect } from "./Const";
import type { GPanel } from "./GPanel";
import type { GScrollBar } from "./GScrollBar";
import type { GWidget } from "./GWidget";

export interface IScroller {
    get owner(): GPanel;
    set owner(value: GPanel);

    get hScrollBar(): GScrollBar;
    get vScrollBar(): GScrollBar;

    get header(): GWidget;
    get footer(): GWidget;

    get hScrollBarRes(): Prefab;
    set hScrollBarRes(value: Prefab);

    get vScrollBarRes(): Prefab;
    set vScrollBarRes(value: Prefab);

    get headerRes(): Prefab;
    set headerRes(value: Prefab);

    get footerRes(): Prefab;
    set footerRes(value: Prefab);

    get direction(): ScrollDirection;
    set direction(value: ScrollDirection);

    get barDisplay(): ScrollBarDisplay;
    set barDisplay(value: ScrollBarDisplay);

    get barOnLeft(): boolean;
    set barOnLeft(value: boolean);

    get barFloating(): boolean;
    set barFloating(value: boolean);

    get barMargin(): Array<number>;
    set barMargin(value: Array<number>);

    get bouncebackEffect(): ScrollBounceBackEffect;
    set bouncebackEffect(value: ScrollBounceBackEffect);

    get touchEffect(): ScrollTouchEffect;
    set touchEffect(value: ScrollTouchEffect);

    get touchEffectButton(): number;
    set touchEffectButton(value: number);

    get pageMode(): boolean;
    set pageMode(value: boolean);

    set step(value: number);
    get step(): number;

    get snapToItem(): boolean;
    set snapToItem(value: boolean);

    get inertiaDisabled(): boolean;
    set inertiaDisabled(value: boolean);

    get paddingMaskDisabled(): boolean;
    set paddingMaskDisabled(value: boolean);

    get mouseWheelDisabled(): boolean;
    set mouseWheelDisabled(value: boolean);

    get decelerationRate(): number;
    set decelerationRate(value: number);

    get percX(): number;
    set percX(value: number);
    setPercX(value: number, ani?: boolean): void;

    get percY(): number;
    set percY(value: number);
    setPercY(value: number, ani?: boolean): void;

    get posX(): number;
    set posX(value: number);
    setPosX(value: number, ani?: boolean): void;

    get posY(): number;
    set posY(value: number);
    setPosY(value: number, ani?: boolean): void;

    get pageX(): number;
    set pageX(value: number);

    get pageY(): number;
    set pageY(value: number);

    setPageX(value: number, ani?: boolean): void;
    setPageY(value: number, ani?: boolean): void;

    get contentWidth(): number;
    get contentHeight(): number;

    get viewWidth(): number;
    get viewHeight(): number;
    setViewSize(width: number, height: number): void;

    get isBottomMost(): boolean;
    get isRightMost(): boolean;

    get scrollingPosX(): number;
    get scrollingPosY(): number;

    scrollTop(ani?: boolean): void;
    scrollBottom(ani?: boolean): void;
    scrollUp(ratio?: number, ani?: boolean): void;
    scrollDown(ratio?: number, ani?: boolean): void;
    scrollLeft(ratio?: number, ani?: boolean): void;
    scrollRight(ratio?: number, ani?: boolean): void;
    scrollTo(target: GWidget, ani?: boolean, setFirst?: boolean): void;
    scrollTo(target: GWidget, ani?: boolean, secondTarget?: GWidget): void;
    scrollTo(target: Rectangle, ani?: boolean, setFirst?: boolean): void;
    scrollTo(target: number, ani?: boolean, setFirst?: boolean): void;

    isChildInView(obj: GWidget): boolean;
    getFirstChildInView(): number;

    get isDragged(): boolean;
    cancelDragging(): void;

    lockHeader(size: number): void;
    lockFooter(size: number): void;

    destroy(): void;

    /** @internal */
    _setDefaultDirection(): void;
    /** @internal */
    _ownerSizeChanged(): void;
    /** @internal */
    _ownerContentSizeChanged(): void;
    /** @internal */
    _shouldCheckOverflow(): number;
    /** @internal */
    _changeContentSizeOnScrolling(deltaWidth: number, deltaHeight: number, deltaPosX: number, deltaPosY: number): void;
    /** @internal */
    _updateScrollBarVisible(): void;
    /** @internal */
    _processClipping(): void;
    /** @internal */
    createHzScrollBar(force?: boolean): void;
    /** @internal */
    createVtScrollBar(force?: boolean): void;
}