import { ScrollBarDisplay } from "./Const";

/**
 * @blueprintable
 */
export class UIConfig2 {
    /**
     * @en Resource using in Window.ShowModalWait for locking the window.
     * @zh 在Window.ShowModalWait中使用的资源，用于锁定窗口。
     */
    static windowModalWaiting: string;

    /** 
     * @en Resource using in GRoot.ShowModalWait for locking the screen.
     * @zh 在GRoot.ShowModalWait中使用的资源，用于锁定屏幕。
     */
    static globalModalWaiting: string;

    /**
     * @en When a modal window is in front, the background becomes dark.
     * @zh 当模态窗口在前面时，背景变暗。
     */
    static modalLayerColor: string = "rgba(50, 50, 50, 0.2)";

    /**
     * @en Default horizontal scrollbar resource.
     * @zh 默认水平滚动条资源。
     */
    static horizontalScrollBar: string = null;

    /**
     * @en Default horizontal scrollbar resource.
     * @zh 默认水平滚动条资源。
     */
    static verticalScrollBar: string = null;

    /**
     * @en Scrolling step in pixels
     * @zh 滚动步长（以像素为单位）
     */
    static defaultScrollStep: number = 25;

    /**
     * @en Deceleration ratio of scrollview when its in touch dragging.
     * @zh 滚动视图在触摸拖动时的减速比率。
     */
    static defaultScrollDecelerationRate: number = 0.967;

    /**
     * @en Default scrollbar display mode. Recommened visible for Desktop and Auto for mobile.
     * @zh 默认滚动条显示模式。推荐桌面使用Visible，移动端使用Auto。
     */
    static defaultScrollBarDisplay: number = ScrollBarDisplay.Always;

    /**
     * @en Allow dragging the content to scroll. Recommeded true for mobile.
     * @zh 允许拖动内容进行滚动。推荐在移动端使用true。
     */
    static defaultScrollTouchEffect: boolean = true;

    /**
     * @en The "rebound" effect in the scolling container. Recommeded true for mobile.
     * @zh 滚动容器中的“回弹”效果。推荐在移动端使用true。
     */
    static defaultScrollBounceEffect: boolean = true;

    /**
     * @en When the scroll container is set to "snap to item", this is the threshold for determining which item to snap to.
     * @zh 当滚动容器设置为“贴近ITEM”时，判定贴近到哪一个ITEM的滚动距离阀值。
     */
    static defaultScrollSnappingThreshold: number = 0.1;

    /**
     * @en When the scroll container is set to "page mode", this is the threshold for determining which page to scroll to.
     * @zh 当滚动容器设置为“页面模式”时，判定翻到哪一页的滚动距离阀值。
     */
    static defaultScrollPagingThreshold: number = 0.3;

    /**
     * @en Resources for PopupMenu.
     * @zh 弹出菜单的资源。
     */
    static popupMenu: string = null;

    /**
     * @en Resources for seperator of PopupMenu.
     * @zh 弹出菜单分隔符的资源。
     */
    static popupMenuSeperator: string = null;

    /**
     * @en Resources for tooltips.
     * @zh 工具提示的资源。
     */
    static tooltipsWidget: string = null;

    /**
     * @en Default delay in milliseconds before showing tooltips.
     * @zh 显示工具提示之前的默认延迟（以毫秒为单位）。
     */
    static defaultTooltipsShowDelay: number = 100;

    /**
     * @en Max items displayed in combobox without scrolling.
     * @zh 下拉框中不滚动时显示的最大项目数。
     */
    static defaultComboBoxVisibleItemCount: number = 20;

    /**
     * @en Pixel offsets of finger to trigger scrolling.
     * @zh 触发滚动的手指像素偏移量。
     */
    static touchScrollSensitivity: number = 20;

    /**
     * @en Pixel offsets of finger to trigger dragging.
     * @zh 触发拖动的手指像素偏移量。
     */
    static touchDragSensitivity: number = 10;

    /**
     * @en Pixel offsets of mouse pointer to trigger dragging.
     * @zh 鼠标指针触发拖动的像素偏移量。
     */
    static clickDragSensitivity: number = 2;

    /**
     * @en When click the window, brings to front automatically.
     * @zh 点击窗口时自动将其置于前面。
     */
    static bringWindowToFrontOnClick: boolean = true;
}