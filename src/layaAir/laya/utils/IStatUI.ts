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
 * @author laya
 */
export interface IStatUI {
    /**
     * 显示性能统计信息。
     * @param	x X轴显示位置。
     * @param	y Y轴显示位置。
     * @views
     */
    show(x?: number, y?: number, views?: Array<StatUIParams>): void;
    showToggle(x?: number, y?: number, views?: Array<StatToggleUIParams>): void;
    /**
     * 隐藏性能统计信息。
     */
    hide(): void;

    /**
     * 每帧更新的调用接口
     */
    update(): void;
    /**
     * 渲染接口
     */
    render(ctx: any, x: number, y: number): void;
}

