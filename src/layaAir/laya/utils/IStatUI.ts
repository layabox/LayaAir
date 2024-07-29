export type StatUnit = "M" | "K" | "int";//M计算会除以1024*1024，k会除以1024，int不做处理
export type StatColor = "yellow" | "white" | "red";//颜色
export type StatMode = "summit" | "average";//是否根据帧分配

export interface StatUIParams {
    title: string,//显示title
    value: string,//对应Stat的数据
    color: StatColor,//显示颜色
    units: StatUnit,//"M"/"k"/"int"//显示单位
    mode: StatMode//"resource/average"//显示模式
}

export interface StatToggleUIParams {
    title: string,//显示title
    value: string,//Toggle
    color: StatColor,//显示颜色
}

/**
 * @en Interface for displaying and managing performance statistics.
 * @zh 用于显示和管理性能统计信息的接口。
 */
export interface IStatUI {
    /**
     * @en Displays performance statistics.
     * @param x The X-axis display position.
     * @param y The Y-axis display position.
     * @param views The array of views to be displayed.
     * @zh 显示性能统计信息。
     * @param x X轴显示位置。
     * @param y Y轴显示位置。
     * @param views 显示的视图数组。
     */
    show(x?: number, y?: number, views?: Array<StatUIParams>): void;
    /**
     * @en Toggles the display of performance statistics.
     * @param x The X-axis display position.
     * @param y The Y-axis display position.
     * @param views The array of views to be toggled.
     * @zh 切换性能统计信息的显示。
     * @param x X轴显示位置。
     * @param y Y轴显示位置。
     * @param views 切换的视图数组。
     */
    showToggle(x?: number, y?: number, views?: Array<StatToggleUIParams>): void;
    /**
     * @en Hides performance statistics.
     * @zh 隐藏性能统计信息。
     */
    hide(): void;

    /**
     * @en Interface for updating each frame.
     * @zh 每帧更新的调用接口。
     */
    update(): void;
    /**
    * @en Rendering interface.
    * @param ctx The rendering context.
    * @param x The X-axis position.
    * @param y The Y-axis position.
    * @zh 渲染接口。
    * @param ctx 渲染上下文。
    * @param x X轴位置。
    * @param y Y轴位置。
    */
    render(ctx: any, x: number, y: number): void;
}

