import { Sprite } from "../display/Sprite"
import { SpriteConst } from "../display/SpriteConst"
import { Stage } from "../display/Stage"
import { RenderSprite } from "../renders/RenderSprite"
import { Context } from "../renders/Context"
import { ILaya } from "../../ILaya";
/**
 * @en QuickTestTool class for rendering and performance testing.
 * @zh 用于渲染和性能测试的 QuickTestTool 类。
 */
export class QuickTestTool {

    private static showedDic: any = {};
    private static _rendertypeToStrDic: any = {};
    private static _typeToNameDic: any = {};

    //TODO:coverage
    /**
     * @en Get the name of a specific render command type.
     * @param type The render command type.
     * @returns The name of the render command type.
     * @zh 获取特定渲染命令类型的名称。
     * @param type 渲染命令类型。
     * @returns 渲染命令类型的名称。
     */
    static getMCDName(type: number): string {
        return QuickTestTool._typeToNameDic[type];
    }

    //TODO:coverage
    /**
     * @en Show render type information.
     * @param type The render type.
     * @param force Whether to force display even if it has been shown before.
     * @zh 显示渲染类型信息。
     * @param type 渲染类型。
     * @param force 是否强制显示，即使之前已经显示过。
     */
    static showRenderTypeInfo(type: any, force: boolean = false): void {
        if (!force && QuickTestTool.showedDic[type])
            return;
        QuickTestTool.showedDic[type] = true;
        if (!QuickTestTool._rendertypeToStrDic[type]) {
            var arr: any[] = [];
            var tType: number;
            tType = 1;
            while (tType <= type) {
                if (tType & type) {
                    arr.push(QuickTestTool.getMCDName(tType & type));
                }
                tType = tType << 1;
            }
            QuickTestTool._rendertypeToStrDic[type] = arr.join(",");
        }
        console.log("cmd:", QuickTestTool._rendertypeToStrDic[type]);

    }

    //TODO:coverage
    static __init__(): void {

        QuickTestTool._typeToNameDic[SpriteConst.ALPHA] = "ALPHA";
        QuickTestTool._typeToNameDic[SpriteConst.TRANSFORM] = "TRANSFORM";
        QuickTestTool._typeToNameDic[SpriteConst.TEXTURE] = "TEXTURE";
        QuickTestTool._typeToNameDic[SpriteConst.GRAPHICS] = "GRAPHICS";
        QuickTestTool._typeToNameDic[SpriteConst.CHILDS] = "CHILDS";
        QuickTestTool._typeToNameDic[SpriteConst.TRANSFORM | SpriteConst.ALPHA] = "TRANSFORM|ALPHA";

        QuickTestTool._typeToNameDic[SpriteConst.CANVAS] = "CANVAS";
        QuickTestTool._typeToNameDic[SpriteConst.BLEND] = "BLEND";
        QuickTestTool._typeToNameDic[SpriteConst.FILTERS] = "FILTERS";
        QuickTestTool._typeToNameDic[SpriteConst.MASK] = "MASK";
        QuickTestTool._typeToNameDic[SpriteConst.CLIP] = "CLIP";
        // QuickTestTool._typeToNameDic[SpriteConst.LAYAGL3D] = "LAYAGL3D";
    }
    _renderType: number;
    _repaint: number;
    _x: number;
    _y: number;
    //TODO:coverage
    constructor() {

    }

    /**
     * @en Update and render the display object. Called by the system.
     * @param context The rendering context reference.
     * @param x The X-axis coordinate.
     * @param y The Y-axis coordinate.
     * @zh 更新、呈现显示对象。由系统调用。
     * @param context 渲染的上下文引用。
     * @param x X轴坐标。
     * @param y Y轴坐标。
     */
    //TODO:coverage
    render(context: Context, x: number, y: number): void {
        QuickTestTool._addType(this._renderType);
        QuickTestTool.showRenderTypeInfo(this._renderType);
        //if (_renderType == (SpriteConst.IMAGE | SpriteConst.GRAPHICS | SpriteConst.CHILDS))
        //{
        //debugger;
        //}
        //@ts-ignore
        RenderSprite.renders[this._renderType]._fun(this, context, x + this._x, y + this._y);
        this._repaint = 0;
    }

    private static _PreStageRender: Function;

    /**@internal */
    //TODO:coverage
    _stageRender(context: Context, x: number, y: number): void {
        QuickTestTool._countStart();
        QuickTestTool._PreStageRender.call(ILaya.stage, context, x, y);//TODO TS
        QuickTestTool._countEnd();
    }
    private static _countDic: any = {};

    //TODO:coverage
    private static _countStart(): void {
        var key: string;
        for (key in QuickTestTool._countDic) {
            QuickTestTool._countDic[key] = 0;
        }
    }
    private static _i: number = 0;

    //TODO:coverage
    private static _countEnd(): void {
        QuickTestTool._i++;
        if (QuickTestTool._i > 60) {
            QuickTestTool.showCountInfo();
            QuickTestTool._i = 0;
        }
    }

    /**@internal */
    private static _addType(type: number): void {
        if (!QuickTestTool._countDic[type]) {
            QuickTestTool._countDic[type] = 1;
        } else {
            QuickTestTool._countDic[type] += 1;
        }
    }

    //TODO:coverage
    /**
     * @en Show count information for render types.
     * @zh 显示渲染类型的计数信息。
     */
    static showCountInfo(): void {
        console.log("===================");
        var key: string;
        for (key in QuickTestTool._countDic) {
            console.log("count:" + QuickTestTool._countDic[key]);
            QuickTestTool.showRenderTypeInfo(key, true);
        }
    }

    //TODO:coverage
    /**
     * @en Enable quick test mode.
     * @zh 启用快速测试模式。
     */
    static enableQuickTest(): void {
        QuickTestTool.__init__();
        Sprite["prototype"]["render"] = QuickTestTool["prototype"]["render"];
        QuickTestTool._PreStageRender = Stage["prototype"]["render"];
        Stage["prototype"]["render"] = QuickTestTool["prototype"]["_stageRender"];
    }
}


