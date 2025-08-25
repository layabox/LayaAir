
import { Rectangle } from "../maths/Rectangle";
import { Prefab } from "../resource/HierarchyResource";
import { ScrollBarDisplay, ScrollBounceBackEffect, ScrollDirection, ScrollTouchEffect } from "./Const";
import type { GPanel } from "./GPanel";
import type { GScrollBar } from "./GScrollBar";
import type { GWidget } from "./GWidget";

/**
 * @en Interface for Scroller component.
 * @zh Scroller 组件接口。
 */
export interface IScroller {
    /**
     * @en The owner panel of the scroller.
     * @zh Scroller 的拥有者面板。
     */
    get owner(): GPanel;
    set owner(value: GPanel);

    /**
     * @en The horizontal scroll bar of the scroller.
     * @zh Scroller 的水平滚动条。
     */
    get hScrollBar(): GScrollBar;
    get vScrollBar(): GScrollBar;

    /**
     * @en The header widget of the scroller.
     * @zh Scroller 的页头部件。
     */
    get header(): GWidget;
    /**
     * @en The footer widget of the scroller.
     * @zh Scroller 的页尾部件。
     */
    get footer(): GWidget;

    /**
     * @en The horizontal scroll bar resource.
     * @zh 水平滚动条资源。
     */
    get hScrollBarRes(): Prefab;
    set hScrollBarRes(value: Prefab);

    /**
     * @en The vertical scroll bar resource.
     * @zh 垂直滚动条资源。
     */
    get vScrollBarRes(): Prefab;
    set vScrollBarRes(value: Prefab);

    /**
     * @en The header resource.
     * @zh 页头资源。
     */
    get headerRes(): Prefab;
    set headerRes(value: Prefab);

    /**
     * @en The footer resource.
     * @zh 页尾资源。
     */
    get footerRes(): Prefab;
    set footerRes(value: Prefab);

    /**
     * @en The direction of the scroller.
     * @zh Scroller 的方向。
     */
    get direction(): ScrollDirection;
    set direction(value: ScrollDirection);

    /**
     * @en The display mode of the scroll bar. The global default value can be set through `UIConfig2.defaultScrollBarDisplay`.
     * @zh 滚动条的显示模式。全局的默认值可以通过`UIConfig2.defaultScrollBarDisplay`设置。
     */
    get barDisplay(): ScrollBarDisplay;
    set barDisplay(value: ScrollBarDisplay);

    /**
     * @en Whether the scroll bar is on the left side.
     * @zh 滚动条是否在左侧。
     */
    get barOnLeft(): boolean;
    set barOnLeft(value: boolean);

    /**
     * @en Whether the scroll bar is floating. Floating scroll bars do not occupy viewport space.
     * @zh 滚动条是否浮动。浮动的滚动条不占用视口空间。
     */
    get barFloating(): boolean;
    set barFloating(value: boolean);

    /**
     * @en The margin around the scroll bar.
     * @zh 滚动条周围的边距。
     */
    get barMargin(): Array<number>;
    set barMargin(value: Array<number>);

    /**
     * @en The bounce back effect of the scroller. Default value can be set globally through `UIConfig2.defaultScrollBounceEffect`.
     * @zh Scroller 的回弹效果。全局的默认值可以通过`UIConfig2.defaultScrollBounceEffect`设置。
     */
    get bouncebackEffect(): ScrollBounceBackEffect;
    set bouncebackEffect(value: ScrollBounceBackEffect);

    /**
     * @en The touch effect of the scroller. Default value can be set globally through `UIConfig2.defaultScrollTouchEffect`.
     * @zh Scroller 的触摸效果。全局的默认值可以通过`UIConfig2.defaultScrollTouchEffect`设置。
     */
    get touchEffect(): ScrollTouchEffect;
    set touchEffect(value: ScrollTouchEffect);

    /**
     * @en The touch effect for buttons in the scroller. Default value can be set globally through `UIConfig2.touchEffectButton`.
     * @zh 用于触摸拖动的鼠标按键，开启了touchEffect后有效。 0-左键，1-中键，2-右键。
     */
    get touchEffectButton(): number;
    set touchEffectButton(value: number);

    /**
     * @en Whether the scroller is in page mode.
     * @zh Scroller 是否处于分页模式。
     */
    get pageMode(): boolean;
    set pageMode(value: boolean);

    /**
     * @en The step size for scrolling when using the mouse wheel. The global default value can be set through `UIConfig2.defaultScrollStep`.
     * @zh 当使用鼠标滚轮滚动时，每次滚动的距离。全局的默认值可以通过`UIConfig2.defaultScrollStep`设置。
     */
    set step(value: number);
    get step(): number;

    /**
     * @en Whether to snap to the nearest item when scrolling.
     * @zh 滚动时是否对齐到最近的项。
     */
    get snapToItem(): boolean;
    set snapToItem(value: boolean);

    /**
     * @en Whether to disable inertia scrolling.
     * @zh 是否禁用惯性滚动。
     */
    get inertiaDisabled(): boolean;
    set inertiaDisabled(value: boolean);

    /**
     * @en Whether to disable padding mask. Generally, the viewport does not include the padding area set around it, meaning that the empty space around the container will also be clipped. If needed, this option can be checked to prevent clipping of the empty space around the container.
     * @zh 禁用裁剪边缘。一般情况下，视口不包括边缘设置的部分，也即是容器设置四周的留空部分也会被裁剪。如果需要，可以勾选这个选项，使容器四周的留空部分不被裁剪。
     */
    get paddingMaskDisabled(): boolean;
    set paddingMaskDisabled(value: boolean);

    /**
     * @en Whether to disable mouse wheel scrolling.
     * @zh 禁用鼠标滚轮滚动。
     */
    get mouseWheelDisabled(): boolean;
    set mouseWheelDisabled(value: boolean);

    /**
     * @en The deceleration rate of the scroller. The global default value can be set through `UIConfig2.defaultScrollDecelerationRate`.
     * @zh Scroller 的减速率。全局的默认值可以通过`UIConfig2.defaultScrollDecelerationRate`设置。
     */
    get decelerationRate(): number;
    set decelerationRate(value: number);

    /**
     * @en The percentage of the scroller's position in the x-direction. The value ranges from 0 to 1.
     * @zh Scroller 在 x 方向上的位置百分比。值范围是0到1。
     */
    get percX(): number;
    set percX(value: number);

    /**
     * @en Sets the percentage of the scroller's position in the x-direction.
     * @param value The percentage value, ranging from 0 to 1. 
     * @param ani Whether to animate the change.
     * @zh 设置 Scroller 在 x 方向上的位置百分比。
     * @param value 百分比值，范围是0到1。
     * @param ani 是否使用动画过渡。 
     */
    setPercX(value: number, ani?: boolean): void;

    /**
     * @en The percentage of the scroller's position in the y-direction. The value ranges from 0 to 1.
     * @zh Scroller 在 y 方向上的位置百分比。值范围是0到1。
     */
    get percY(): number;
    set percY(value: number);

    /**
     * @en Sets the percentage of the scroller's position in the y-direction.
     * @param value The percentage value, ranging from 0 to 1. 
     * @param ani Whether to animate the change.
     * @zh 设置 Scroller 在 y 方向上的位置百分比。
     * @param value 百分比值，范围是0到1。
     * @param ani 是否使用动画过渡。 
     */
    setPercY(value: number, ani?: boolean): void;

    /**
     * @en The x-coordinate of the top-left corner of the scroller's content.
     * @zh Scroller 内容的左上角 x 坐标。
     */
    get posX(): number;
    set posX(value: number);

    /**
     * @en Sets the x-coordinate of the top-left corner of the scroller's content.
     * @param value The x-coordinate value.
     * @param ani Whether to animate the change.
     * @zh 设置 Scroller 内容的左上角 x 坐标。
     * @param value x 坐标值。
     * @param ani 是否使用动画过渡。
     */
    setPosX(value: number, ani?: boolean): void;

    /**
     * @en The y-coordinate of the top-left corner of the scroller's content.
     * @zh Scroller 内容的左上角 y 坐标。
     */
    get posY(): number;
    set posY(value: number);

    /**
     * @en Sets the y-coordinate of the top-left corner of the scroller's content.
     * @param value The y-coordinate value.
     * @param ani Whether to animate the change.
     * @zh 设置 Scroller 内容的左上角 y 坐标。
     * @param value y 坐标值。
     * @param ani 是否使用动画过渡。
     */
    setPosY(value: number, ani?: boolean): void;

    /**
     * @en If the scroller is in page mode, returns the index of the current page in the x-direction.
     * @zh 如果 Scroller 处于分页模式，则返回水平方向上当前页的索引。
     */
    get pageX(): number;
    set pageX(value: number);

    /**
     * @en If the scroller is in page mode, sets the index of the current page in the y-direction.
     * @zh 如果 Scroller 处于分页模式，则设置垂直方向上当前页的索引。
     */
    get pageY(): number;
    set pageY(value: number);

    /**
     * @en Sets the index of the current page in the x-direction.
     * @param value The page index value. 
     * @param ani Whether to animate the change. 
     */
    setPageX(value: number, ani?: boolean): void;

    /**
     * @en Sets the index of the current page in the y-direction.
     * @param value The page index value. 
     * @param ani Whether to animate the change. 
     */
    setPageY(value: number, ani?: boolean): void;

    /**
     * @en The number of pages in the x-direction.
     * @zh Scroller 在水平方向上的页数。
     */
    get pageCountX(): number;

    /**
     * @en The number of pages in the y-direction.
     * @zh Scroller 在垂直方向上的页数。
     */
    get pageCountY(): number;

    /**
     * @en The width of the content area.
     * @zh Scroller 内容区域的宽度。
     */
    get contentWidth(): number;

    /**
     * @en The height of the content area.
     * @zh Scroller 内容区域的高度。
     */
    get contentHeight(): number;

    /**
     * @en The width of the viewport.
     * @zh Scroller 视口的宽度。
     */
    get viewWidth(): number;

    /**
     * @en The height of the viewport.
     * @zh Scroller 视口的高度。
     */
    get viewHeight(): number;

    /**
     * @en Sets the size of the viewport.
     * @param width The width of the viewport.
     * @param height The height of the viewport.
     * @zh 设置 Scroller 视口的大小。
     * @param width 视口的宽度。
     * @param height 视口的高度。
     */
    setViewSize(width: number, height: number): void;

    /**
     * @en Whether the scrolling has reached the bottom-most position.
     * @zh 是否已滚动到最底。
     */
    get isBottomMost(): boolean;

    /**
     * @en Whether the scrolling has reached the right-most position.
     * @zh 是否已滚动到最右侧。
     */
    get isRightMost(): boolean;

    /**
     * @en When no bounce occurs, the value is the same as posX; when a bounce occurs, posX is constrained between 0 and overlapSize.x, while scrollingPosX returns the actual position value.
     * @zh 当没有发生回弹时，返回值和posX一致；当发生回弹时，posX会被限制在0和overlapSize.x之间，而scrollingPosX会返回真实的位置值。
     */
    get scrollingPosX(): number;

    /**
     * @en When no bounce occurs, the value is the same as posY; when a bounce occurs, posY is constrained between 0 and overlapSize.y, while scrollingPosY returns the actual position value.
     * @zh 当没有发生回弹时，返回值和posY一致；当发生回弹时，posY会被限制在0和overlapSize.y之间，而scrollingPosY会返回真实的位置值。
     */
    get scrollingPosY(): number;

    /**
     * @en Scrolls to the top of the content area.
     * @param ani Whether to animate the scroll action.
     * @zh 滚动到内容区域的顶部。
     * @param ani 是否使用动画过渡。 
     */
    scrollTop(ani?: boolean): void;

    /**
     * @en Scrolls to the bottom of the content area.
     * @param ani Whether to animate the scroll action.
     * @zh 滚动到内容区域的底部。
     * @param ani 是否使用动画过渡。 
     */
    scrollBottom(ani?: boolean): void;

    /**
     * @en Scrolls up once, with the step size controlled by the ratio parameter.
     * @param ratio The ratio of the step size, ranging from 0 to 1, with a default value of 1. The base is the value of the `step` property, and if in page mode, the base is the height of the page.
     * @param ani Whether to use an animated transition, default is false.
     * @zh 向上滚动一次，步长由ratio参数控制。
     * @param ratio 步长的比例，范围是0到1，默认值为1。基数是`step`属性的值，如果在分页模式，则基数为页面的高度。
     * @param ani 是否使用动画过渡，默认值为false。
     */
    scrollUp(ratio?: number, ani?: boolean): void;

    /**
     * @en Scrolls down once, with the step size controlled by the ratio parameter.
     * @param ratio The ratio of the step size, ranging from 0 to 1, with a default value of 1. The base is the value of the `step` property    , and if in page mode, the base is the height of the page.
     * @param ani Whether to use an animated transition, default is false.
     * @zh 向下滚动一次，步长由ratio参数控制。
     * @param ratio 步长的比例，范围是0到1，默认值为1。基数是`step`属性的值，如果在分页模式，则基数为页面的高度。
     * @param ani 是否使用动画过渡，默认值为false。
     */
    scrollDown(ratio?: number, ani?: boolean): void;

    /**
     * @en Scrolls to the left once, with the step size controlled by the ratio parameter.
     * @param ratio The ratio of the step size, ranging from 0 to 1, with a default value of 1. The base is the value of the `step` property, and if in page mode, the base is the width of the page. 
     * @param ani Whether to use an animated transition, default is false.
     * @zh 向左滚动一次，步长由ratio参数控制。
     * @param ratio 步长的比例，范围是0到1，默认值为1。基数是`step`属性的值，如果在分页模式，则基数为页面的宽度。
     * @param ani 是否使用动画过渡，默认值为false. 
     */
    scrollLeft(ratio?: number, ani?: boolean): void;

    /**
     * @en Scrolls to the right once, with the step size controlled by the ratio parameter.
     * @param ratio The ratio of the step size, ranging from 0 to 1, with a default value of 1. The base is the value of the `step` property, and if in page mode, the base is the width of the page.
     * @param ani Whether to use an animated transition, default is false.
     * @zh 向右滚动一次，步长由ratio参数控制。
     * @param ratio 步长的比例，范围是0到1，默认值为1。基数是`step`属性的值，如果在分页模式，则基数为页面的宽度。
     * @param ani 是否使用动画过渡，默认值为false。
     */
    scrollRight(ratio?: number, ani?: boolean): void;

    /**
     * @en Scrolls to a specific target widget, with an option to animate the scroll action.
     * @param target The target widget to scroll to.
     * @param ani Whether to animate the scroll action, default is false.
     * @param setFirst If true, sets the target as the first child in view.
     * @zh 滚动到指定的目标部件，可以选择是否使用动画过渡。
     * @param target 要滚动到的目标部件。
     * @param ani 是否使用动画过渡，默认值为false。
     * @param setFirst 如果为true，则将目标设置为视图中的第一个子项。
     */
    scrollTo(target: GWidget, ani?: boolean, setFirst?: boolean): void;

    /**
     * @en Scrolls to a specific target rectangle, with an option to animate the scroll action.
     * @param target The target rectangle to scroll to.
     * @param ani Whether to animate the scroll action, default is false.
     * @param secondTarget If not null, sets it as the first child in view.
     * @zh 滚动到指定的目标矩形，可以选择是否使用动画过渡。
     * @param target 要滚动到的目标矩形。
     * @param ani 是否使用动画过渡，默认值为false。
     * @param secondTarget 如果不为空，则将它设置为视图中的第一个子项。
     */
    scrollTo(target: GWidget, ani?: boolean, secondTarget?: GWidget): void;

    /**
     * @en Scrolls to a specific target rectangle, with an option to animate the scroll action.
     * @param target The target rectangle to scroll to.
     * @param ani Whether to animate the scroll action, default is false.
     * @param setFirst If true, sets the target as the first child in view.
     * @zh 滚动到指定的目标矩形，可以选择是否使用动画过渡。
     * @param target 要滚动到的目标矩形。
     * @param ani 是否使用动画过渡，默认值为false。
     * @param setFirst 如果为true，则将目标设置为视图中的第一个子项。
     */
    scrollTo(target: Rectangle, ani?: boolean, setFirst?: boolean): void;

    /**
     * @en Scrolls to a child with specific index, with an option to animate the scroll action.
     * @param target The index of the child to scroll to.
     * @param ani Whether to animate the scroll action, default is false.
     * @param setFirst If true, sets the target as the first child in view.
     * @zh 滚动到指定索引的子项，可以选择是否使用动画过渡。
     * @param target 要滚动到的子项索引。
     * @param ani 是否使用动画过渡，默认值为false。
     * @param setFirst 如果为true，则将目标设置为视图中的第一个子项。
     */
    scrollTo(target: number, ani?: boolean, setFirst?: boolean): void;

    /**
     * @en Checks if a specific child widget is currently in view.
     * @param obj The child widget to check.
     * @returns Returns true if the child widget is in view, otherwise false.
     * @zh 检查指定的子部件是否在视图中。
     * @param obj 要检查的子部件。
     * @returns 如果子部件在视图中，则返回true，否则返回false。 
     */
    isChildInView(obj: GWidget): boolean;

    /**
     * @en Gets the index of the first child widget that is currently in view.
     * @returns Returns the index of the first child widget in view, or -1 if no child is in view.
     * @zh 获取当前在视图中的第一个子部件的索引。
     * @returns 返回视图中第一个子部件的索引，如果没有子部件在视图中，则返回 -1。
     */
    getFirstChildInView(): number;

    /**
     * @en Whether the scroller is currently being dragged.
     * @returns Returns true if the scroller is being dragged, otherwise false.
     * @zh Scroller 是否正在被拖动。
     * @returns 如果 Scroller 正在被拖动，则返回 true，否则返回 false。
     */
    get isDragged(): boolean;

    /**
     * @en Cancels the current dragging operation.
     * @zh 取消当前的拖动操作。
     */
    cancelDragging(): void;

    /**
     * @en Locks the header widget, keeping it visible and fixed at the top during scrolling.
     * @param size The size of the header.
     * @zh 锁定页头部件，即使其显示，并在滚动时保持在顶部。
     * @param size 页头的大小。
     */
    lockHeader(size: number): void;

    /**
     * @en Locks the footer widget, keeping it visible and fixed at the bottom during scrolling.
     * @param size The size of the footer.
     * @zh 锁定页尾部件，即使其显示，并在滚动时保持在底部。
     * @param size 页尾的大小。
     */
    lockFooter(size: number): void;

    /** @internal */
    destroy(): void;

    /** @internal */
    _loop: number;
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