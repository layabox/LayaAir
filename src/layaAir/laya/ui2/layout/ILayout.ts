import { StretchParam } from "../StretchParam";
import { AlignType, VAlignType, LayoutType, LayoutChangedReason, StretchMode } from "../Const";
import { Point } from "../../maths/Point";

export interface ILayout {

    /**
     * @en The type of the layout.
     * @zh 布局的类型。
     */
    get type(): LayoutType;
    set type(value: LayoutType);

    /**
     * @en This option is only effective for FlowY layout type. If set to a value greater than 0, a new column will only be started when the number of items in each column reaches the specified value.
     * @zh 这个选项只对FlowY布局类型布局有效。如果设置了大于0的值，则每列的数量到达设定的值才会开启新的一列。
     */
    get rows(): number;
    set rows(value: number);

    /**
     * @en This option is only effective for FlowX layout type. If set to a value greater than 0, a new row will only be started when the number of items in each row reaches the specified value.
     * @zh 这个选项只对FlowX布局类型布局有效。如果设置了大于0的值，则每行的数量到达设定的值才会开启新的一行。
     */
    get columns(): number;
    set columns(value: number);

    /**
     * @en The gap between rows.
     * @zh 行间距。
     */
    get rowGap(): number;
    set rowGap(value: number);

    /**
     * @en The gap between columns.
     * @zh 列间距。
     */
    get columnGap(): number;
    set columnGap(value: number);

    /**
     * @zh 设定容器内部四个方向的留空。四个元素依次为[上，右，下，左]。
     * @en Set the padding for the four directions inside the container. The four elements are in the order of [UP, RIGHT, DOWN, LEFT].
     */
    get padding(): Array<number>;
    set padding(value: Array<number>);

    /**
     * @en The alignment of the layout.
     * @zh 布局的对齐方式。
     */
    get align(): AlignType;
    set align(value: AlignType);

    /**
     * @en The vertical alignment of the layout.
     * @zh 布局的垂直对齐方式。
     */
    get valign(): VAlignType;
    set valign(value: VAlignType);

    /**
     * @en The horizontal stretch mode of the layout.
     * @zh 在水平方向上的缩放操作。
     */
    get stretchX(): StretchMode;
    set stretchX(value: StretchMode);

    /**
     * @en The vertical stretch mode of the layout.
     * @zh 在垂直方向上的缩放操作。
     */
    get stretchY(): StretchMode;
    set stretchY(value: StretchMode);

    /**
     * @en The stretch parameters for the horizontal direction.
     * @zh 水平方向上的拉伸参数。
     */
    get stretchParamsX(): Array<StretchParam>;

    /**
     * @en The stretch parameters for the vertical direction.
     * @zh 垂直方向上的拉伸参数。
     */
    get stretchParamsY(): Array<StretchParam>;

    /**
     * @en If set to true, when an item is not visible (visible=false), it will not reserve space for it during layout, meaning the layout will ignore this item; if unchecked, it will reserve space for this item, resulting in a blank placeholder.
     * @zh 如果设置为true，当某个item不可见时（visible=false），布局时不会为他留位置，也就是排版时会忽略这个item；如果不勾选，则会为这个item保留位置，显示效果就是一个空白的占位。
     */
    get foldInvisibles(): boolean;
    set foldInvisibles(value: boolean);

    /**
     * @en The minimum size for child nodes. When automatically adjusting the size of child nodes based on layout parameters, it will not be smaller than this value. For example, if set to 30 and a node requires a width of 10 during layout, the final width of the node will be set to 30.
     * @zh 当根据布局参数自动改变子节点的大小时，不会小于这里设置的值。例如，如果这里设置了30，并且一个节点在排列时要求宽度为10，则节点最后的宽度会被设置为30。
     */
    get minChildSize(): number;
    set minChildSize(value: number);

    /**
     * @en Page mode.
     * @zh 分页模式。
     */
    get pageMode(): boolean;
    set pageMode(value: boolean);

    /**
     * @en The width of the view area.
     * @zh 视口区域的宽度。
     */
    get viewWidth(): number;
    set viewWidth(value: number);

    /**
     * @en The height of the view area.
     * @zh 视口区域的高度。
     */
    get viewHeight(): number;
    set viewHeight(value: number);

    /**
     * @en The width of the content area.
     * @zh 内容区域的宽度。
     */
    get contentWidth(): number;
    set contentWidth(value: number);

    /**
     * @en The height of the content area.
     * @zh 内容区域的高度。
     */
    get contentHeight(): number;
    set contentHeight(value: number);

    /**
     * @en Get the snapping position of the layout.
     * @param xValue The horizontal coordinate of the snapping position.
     * @param yValue The vertical coordinate of the snapping position.
     * @param xDir The horizontal direction of the snapping position, positive for right and negative for left.
     * @param yDir The vertical direction of the snapping position, positive for down and negative for up.
     * @param resultPoint The point object to store the result, if not provided, a new Point object will be created.
     * @returns The snapping position as a Point object.
     * @zh 获取对齐位置。
     * @param xValue 对齐位置的水平坐标。
     * @param yValue 对齐位置的垂直坐标。
     * @param xDir 对齐位置的水平方向，正数表示右移或者下移，负数表示左移或者上移。
     * @param yDir 对齐位置的垂直方向，正数表示下移或者右移，负数表示上移或者左移。
     * @param resultPoint 用于存储结果的点对象，如果未提供，将创建一个新的 Point 对象。
     * @returns 返回对齐位置的 Point 对象。
     */
    getSnappingPosition(xValue: number, yValue: number, xDir: number, yDir: number, resultPoint?: Point): Point;

    /**
     * @en Resize the container to fit specified child count and minimum size.
     * @param childCount The number of children to fit in the container.
     * @param minSize The minimum size for the container.
     * @zh 调整容器大小以适应指定的子节点数量和最小尺寸。
     * @param childCount 要适应容器的子节点数量。
     * @param minSize 容器的最小尺寸。
     */
    resizeToFit(childCount?: number, minSize?: number): void;

    /**
     * @en Notify the layout that any changes have occurred that require a layout update.
     * @param reason The reason for the layout change.
     * @zh 通知布局发生了任何需要更新布局的更改。
     * @param reason 布局更改的原因。
     */
    setChangedFlag(reason?: LayoutChangedReason): void;

    /**
     * @en Refresh the layout if necessary.
     * @param force Whether to force a refresh even if no changes have occurred.
     * @zh 如果需要，刷新布局。
     * @param force 是否强制刷新，即使没有发生更改。
     */
    refresh(force?: boolean): void;

    /** @internal */
    setContentSize(aw: number, ah: number): void;

    /** @internal */
    _disabled: boolean;
}
