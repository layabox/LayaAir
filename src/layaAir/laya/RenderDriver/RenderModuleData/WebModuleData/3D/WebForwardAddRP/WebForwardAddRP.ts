import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";
import { IDirShadowRP, IForwardAddRP, IMain3DRP, IRenderContext3D, ISpotShadowRP } from "../../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebForwardAddClusterRP } from "./WebForwardAddClusterRP";



export class WebForwardAddRP implements IForwardAddRP {

    /**@internal */
    protected _afterAllRenderCMDS: Array<CommandBuffer>;
    /**@internal */
    protected _beforeImageEffectCMDS: Array<CommandBuffer>;

    shadowCastPass: boolean;
    enableDirectLightShadow: boolean;
    enableSpotLightShadowPass: boolean;
    enablePostProcess: boolean;
    postProcess: CommandBuffer;

    mainRenderpass: IMain3DRP;
    dirShadowRenderPass: IDirShadowRP;
    spotShadowRenderPass: ISpotShadowRP;
    finalize: CommandBuffer;

    constructor() {
        this.finalize = new CommandBuffer();
    }

    /**
     * 设置后处理之前绘制的渲染命令
     * @param value 
     */
    setBeforeImageEffect(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._beforeImageEffectCMDS = value;
            value.forEach(element => element._apply(false));
        }
    }

    runBeforeImageEffectCMD(context: IRenderContext3D): void {
        this._renderCmd(this._beforeImageEffectCMDS, context)
    }

    /**
     * 设置所有渲染都结束后绘制的渲染命令
     * @param value 
     */
    setAfterEventCmd(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._afterAllRenderCMDS = value;
            value.forEach(element => element._apply(false));
        }
    }

    runAfterEventCMD(context: IRenderContext3D): void {
        this._renderCmd(this._afterAllRenderCMDS, context)
    }

    /**
    * 渲染命令
    * @param cmds 
    * @param context 
    */
    protected _renderCmd(cmds: CommandBuffer[], context: IRenderContext3D) {
        if (cmds && cmds.length > 0)
            cmds.forEach(value => context.runCMDList(value._renderCMDs));
    }


    destroy(): void {

    }



}