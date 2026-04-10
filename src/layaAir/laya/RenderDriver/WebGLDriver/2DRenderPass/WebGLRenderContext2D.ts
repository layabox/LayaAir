import { LayaEnv } from "../../../../LayaEnv";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../../layagl/LayaGL";
import { StatElement } from "../../../layagl/StatisticsContext";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderData, ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLInternalRT } from "../RenderDevice/WebGLInternalRT";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLVertexBuffer } from "../RenderDevice/WebGLVertexBuffer";
import { WebGLRenderElement2D } from "./WebGLRenderElement2D";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";

export class WebglRenderContext2D implements IRenderContext2D {

    private _clearColor: Color = new Color(0, 0, 0, 0);
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
    _globalAlpha = -1;
    
    private _offscreenWidth: number;
    private _offscreenHeight: number;

    constructor() {
        this._globalConfigShaderData = Shader3D._configDefineValues as WebDefineDatas;
    }

    drawRenderElementList(list: FastSinglelist<WebGLRenderElement2D>): number {
        let time = performance.now();
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            let element = list.elements[i];
            element._prepare(this);//render
        }
        LayaGL.statAgent.recordTimeData(StatElement.T_2DContextPre, performance.now() - time);
        time = performance.now();
        this._prevTypeKey = -1;
        this._prevTextureKey = -1;
        this._prevClip = null;
        this._prevShaderIns = null;
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            list.elements[i]._render(this);
        }
        LayaGL.statAgent.recordCTData(StatElement.CT_2DDrawCall, list.length);
        LayaGL.statAgent.recordTimeData(StatElement.T_2DContextRender, performance.now() - time);
        LayaGL.renderEngine._framePassCount++;
        return 0;
    }

    setOffscreenView(width: number, height: number): void {
        this._offscreenWidth = width;
        this._offscreenHeight = height;
    }

    setRenderTarget(value: WebGLInternalRT, clear: boolean, clearColor: Color): void {
        this._destRT = value;
        clearColor.cloneTo(this._clearColor);
        if (this._destRT) {
            WebGLEngine.instance.getTextureContext().bindRenderTarget(this._destRT);
            WebGLEngine.instance.viewport(0, 0, this._destRT._textures[0].width, this._destRT._textures[0].height);
        } else {
            WebGLEngine.instance.getTextureContext().bindoutScreenTarget();
            WebGLEngine.instance.viewport(0, 0, this._offscreenWidth, this._offscreenHeight);
        }
        WebGLEngine.instance.scissorTest(false);
        WebGLEngine.instance.clearRenderTexture(clear ? RenderClearFlag.Color : RenderClearFlag.Nothing, this._clearColor);
    }

    getRenderTarget(): WebGLInternalRT {
        return this._destRT;
    }

    drawRenderElementOne(node: WebGLRenderElement2D): void {
        node._prepare(this);
        node._render(this);
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