import { Context } from "../resource/Context";
/**
 * ...
 * @author ww
 */
export declare class QuickTestTool {
    private static showedDic;
    private static _rendertypeToStrDic;
    private static _typeToNameDic;
    static getMCDName(type: number): string;
    static showRenderTypeInfo(type: any, force?: boolean): void;
    static __init__(): void;
    _renderType: number;
    _repaint: number;
    _x: number;
    _y: number;
    constructor();
    /**
     * 更新、呈现显示对象。由系统调用。
     * @param	context 渲染的上下文引用。
     * @param	x X轴坐标。
     * @param	y Y轴坐标。
     */
    render(context: Context, x: number, y: number): void;
    private static _PreStageRender;
    private static _countDic;
    private static _countStart;
    private static _i;
    private static _countEnd;
    static showCountInfo(): void;
    static enableQuickTest(): void;
}
