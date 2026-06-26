import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { StatElement } from "../../../layagl/StatisticsContext";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { FastSinglelist } from "../../../utils/SingletonList";
import { WebGL2DStencilState } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLInternalRT } from "../RenderDevice/WebGLInternalRT";

import { WebGLRenderElement2D } from "./WebGLRenderElement2D";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebGLStencilClip2D, WebGLStencilDrawItem } from "./WebGLStencilClip2D";

export class WebglRenderContext2D implements IRenderContext2D {

    _clearColor: Color = new Color(0, 0, 0, 0);
    _destRT: WebGLInternalRT;
    invertY: boolean = false;
    pipelineMode: string = "Forward";
    passData: WebGLShaderData;

    _globalConfigShaderData: WebDefineDatas;

    /** @internal 快速路径：上一个渲染元素的状态，供 Primitive 元素做状态跳过 */
    _prevTypeKey: number = -1;
    /** @internal */
    _prevTextureKey: number = -1;
    /** @internal */
    _prevClip: any = null;
    /** @internal */
    _prevShaderIns: WebGLShaderInstance = null;
    /** @internal */
    _prevRenderType: number = -1;
    /** @internal */
    stencilClip2D: WebGLStencilClip2D;
    private _stencilDrawItems: WebGLStencilDrawItem[] = [];
    private _stencilOpCache: Map<number, Vector3> = new Map();

    private _offscreenWidth: number;
    private _offscreenHeight: number;
    private _offscreenX: number = 0;
    private _offscreenY: number = 0;

    constructor() {
        this._globalConfigShaderData = Shader3D._configDefineValues as WebDefineDatas;
        this.stencilClip2D = new WebGLStencilClip2D(this);
    }

    drawRenderElementList(list: FastSinglelist<WebGLRenderElement2D>): number {
        let time = performance.now();
        const useStencilItems = this.stencilClip2D.buildDrawItems(list, this._stencilDrawItems);
        if (useStencilItems)
            this.prepareRenderElementItems(this._stencilDrawItems);
        else
            this.prepareRenderElementList(list);
        LayaGL.statAgent.recordTimeData(StatElement.T_2DContextPre, performance.now() - time);
        time = performance.now();
        if (useStencilItems)
            this.drawRenderElementItems(this._stencilDrawItems);
        else
            this.drawRenderElementListRange(list, 0, list.length);
        LayaGL.statAgent.recordTimeData(StatElement.T_2DContextRender, performance.now() - time);
        return 0;
    }

    /** @internal */
    prepareRenderElementList(list: FastSinglelist<WebGLRenderElement2D>): void {
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            let element = list.elements[i];
            element._prepare(this);
        }
    }

    /** @internal */
    prepareRenderElementItems(items: WebGLStencilDrawItem[]): void {
        for (let i = 0, n = items.length; i < n; i++) {
            items[i]._prepare(this);
        }
    }

    /** @internal */
    drawRenderElementListRange(list: FastSinglelist<WebGLRenderElement2D>, start: number, end: number): number {
        this.resetFastState();
        for (var i: number = start; i < end; i++) {
            const element = list.elements[i];
            element._render(this);
            this._prevRenderType = element.owner ? element.owner.renderType : -1;
        }
        LayaGL.statAgent.recordCTData(StatElement.CT_2DDrawCall, end - start);
        LayaGL.renderEngine._framePassCount++;
        return 0;
    }

    /** @internal */
    drawRenderElementItems(items: WebGLStencilDrawItem[]): number {
        this.resetFastState();
        let drawCount = 0;
        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];
            item._render(this);
            this._prevRenderType = item.owner ? item.owner.renderType : -1;
            drawCount++;
        }
        LayaGL.statAgent.recordCTData(StatElement.CT_2DDrawCall, drawCount);
        LayaGL.renderEngine._framePassCount++;
        return 0;
    }

    setOffscreenView(width: number, height: number, x: number = 0, y: number = 0): void {
        this._offscreenWidth = width;
        this._offscreenHeight = height;
        this._offscreenX = x;
        this._offscreenY = y;
    }

    getOffscreenView(out: Vector4): void {
        out.setValue(this._offscreenX, this._offscreenY, this._offscreenWidth, this._offscreenHeight);
    }

    /** @internal */
    resetFastState(): void {
        this._prevTypeKey = -1;
        this._prevTextureKey = -1;
        this._prevClip = null;
        this._prevShaderIns = null;
        this._prevRenderType = -1;
    }

    /** @internal */
    applyStencil2DToShaderData(shaderData: WebGLShaderData, stencilState: WebGL2DStencilState): void {
        if (!shaderData)
            return;

        if (!stencilState || !stencilState.enabled) {
            shaderData.setInt(Shader3D.STENCIL_TEST, RenderState.STENCILTEST_OFF);
            shaderData.setBool(Shader3D.STENCIL_WRITE, RenderState.Default.stencilWrite);
            shaderData.setInt(Shader3D.STENCIL_WRITE_MASK, RenderState.Default.stencilWriteMask);
            shaderData.setInt(Shader3D.STENCIL_READ_MASK, RenderState.Default.stencilReadMask);
            shaderData.setInt(Shader3D.STENCIL_Ref, RenderState.Default.stencilRef);
            shaderData.setVector3(Shader3D.STENCIL_Op, RenderState.Default.stencilOp);
            return;
        }

        shaderData.setInt(Shader3D.STENCIL_TEST, stencilState.test);
        shaderData.setBool(Shader3D.STENCIL_WRITE, stencilState.write);
        shaderData.setInt(Shader3D.STENCIL_WRITE_MASK, stencilState.writeMask);
        shaderData.setInt(Shader3D.STENCIL_READ_MASK, stencilState.readMask);
        shaderData.setInt(Shader3D.STENCIL_Ref, stencilState.ref);
        shaderData.setVector3(Shader3D.STENCIL_Op, this._getStencilOpVector(stencilState));
    }

    private _getStencilOpVector(state: WebGL2DStencilState): Vector3 {
        const key = (state.opFail & 0xFF) | ((state.opZFail & 0xFF) << 8) | ((state.opZPass & 0xFF) << 16);
        let value = this._stencilOpCache.get(key);
        if (!value) {
            value = new Vector3(state.opFail, state.opZFail, state.opZPass);
            this._stencilOpCache.set(key, value);
        }
        return value;
    }

    setRenderTarget(value: WebGLInternalRT, clear: boolean, clearColor: Color): void {
        this._destRT = value;
        clearColor.cloneTo(this._clearColor);
        WebGLEngine.instance._GLRenderState.clearRenderStateCache();
        if (this._destRT) {
            const layer = this._destRT._arrayLayerIndex;
            WebGLEngine.instance.getTextureContext().bindRenderTarget(this._destRT, layer >= 0 ? layer : 0);
            WebGLEngine.instance.viewport(this._offscreenX, this._offscreenY, this._destRT._textures[0].width, this._destRT._textures[0].height);
        } else {
            WebGLEngine.instance.getTextureContext().bindoutScreenTarget();
            WebGLEngine.instance.viewport(this._offscreenX, this._offscreenY, this._offscreenWidth, this._offscreenHeight);
        }
        WebGLEngine.instance.scissorTest(false);
        WebGLEngine.instance.clearRenderTexture(clear ? RenderClearFlag.Color | RenderClearFlag.Stencil : RenderClearFlag.Nothing, this._clearColor);
    }

    getRenderTarget(): WebGLInternalRT {
        return this._destRT;
    }

    drawRenderElementOne(node: WebGLRenderElement2D): void {
        node._prepare(this);
        node._render(this);
        this._prevRenderType = node.owner ? node.owner.renderType : -1;
        LayaGL.statAgent.recordCTData(StatElement.CT_2DDrawCall, 1);
        LayaGL.renderEngine._framePassCount++;
    }

    runOneCMD(cmd: IRenderCMD): void {
        cmd.apply(this);
    }

    runCMDList(cmds: IRenderCMD[]): void {
        cmds.forEach(element => {
            element.apply(this);
        });
    }


}
