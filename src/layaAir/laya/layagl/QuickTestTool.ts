import { Sprite } from "../display/Sprite"
import { SpriteConst } from "../display/SpriteConst"
import { Stage } from "../display/Stage"
import { RenderSprite } from "../renders/RenderSprite"
import { Context } from "../resource/Context"
import { ILaya } from "../../ILaya";
/**
 * ...
 * @author ww
 */
export class QuickTestTool {

    private static showedDic: any = {};
    private static _rendertypeToStrDic: any = {};
    private static _typeToNameDic: any = {};

    //TODO:coverage
    static getMCDName(type: number): string {
        return QuickTestTool._typeToNameDic[type];
    }

    //TODO:coverage
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
        QuickTestTool._typeToNameDic[SpriteConst.ONECHILD] = "ONECHILD";
        QuickTestTool._typeToNameDic[SpriteConst.CHILDS] = "CHILDS";
        QuickTestTool._typeToNameDic[SpriteConst.TRANSFORM | SpriteConst.ALPHA] = "TRANSFORM|ALPHA";

        QuickTestTool._typeToNameDic[SpriteConst.CANVAS] = "CANVAS";
        QuickTestTool._typeToNameDic[SpriteConst.BLEND] = "BLEND";
        QuickTestTool._typeToNameDic[SpriteConst.FILTERS] = "FILTERS";
        QuickTestTool._typeToNameDic[SpriteConst.MASK] = "MASK";
        QuickTestTool._typeToNameDic[SpriteConst.CLIP] = "CLIP";
        QuickTestTool._typeToNameDic[SpriteConst.LAYAGL3D] = "LAYAGL3D";
    }
    _renderType: number;
    _repaint: number;
    _x: number;
    _y: number;
    //TODO:coverage
    constructor() {

    }
    /**
     * 更新、呈现显示对象。由系统调用。
     * @param	context 渲染的上下文引用。
     * @param	x X轴坐标。
     * @param	y Y轴坐标。
     */
    //TODO:coverage
    render(context: Context, x: number, y: number): void {
        QuickTestTool._addType(this._renderType);
        QuickTestTool.showRenderTypeInfo(this._renderType);
        //if (_renderType == (SpriteConst.IMAGE | SpriteConst.GRAPHICS | SpriteConst.CHILDS))
        //{
        //debugger;
        //}
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
    static showCountInfo(): void {
        console.log("===================");
        var key: string;
        for (key in QuickTestTool._countDic) {
            console.log("count:" + QuickTestTool._countDic[key]);
            QuickTestTool.showRenderTypeInfo(key, true);
        }
    }

    //TODO:coverage
    static enableQuickTest(): void {
        QuickTestTool.__init__();
        Sprite["prototype"]["render"] = QuickTestTool["prototype"]["render"];
        QuickTestTool._PreStageRender = Stage["prototype"]["render"];
        Stage["prototype"]["render"] = QuickTestTool["prototype"]["_stageRender"];
    }
}


