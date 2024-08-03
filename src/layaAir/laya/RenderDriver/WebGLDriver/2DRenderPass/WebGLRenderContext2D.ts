import { LayaEnv } from "../../../../LayaEnv";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { Command } from "../../../d3/core/render/command/Command";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLInternalRT } from "../RenderDevice/WebGLInternalRT";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLVertexBuffer } from "../RenderDevice/WebGLVertexBuffer";
import { WebGLRenderelement2D } from "./WebGLRenderElement2D";

export class WebglRenderContext2D implements IRenderContext2D {
    //兼容ConchWebGL
    static isCreateBlitScreenELement = false;
    //兼容ConchWebGL
    static blitScreenElement: WebGLRenderelement2D;
    static blitContext: WebglRenderContext2D;

    private _clearColor: Color = new Color(0, 0, 0, 0);
    _destRT: WebGLInternalRT;
    invertY: boolean = false;
    pipelineMode: string = "Forward";
    sceneData: WebGLShaderData;
    _globalConfigShaderData: WebDefineDatas;

    private _offscreenWidth: number;
    private _offscreenHeight: number;

    constructor() {
        this._globalConfigShaderData = Shader3D._configDefineValues;
        if (LayaEnv.isConch && !WebglRenderContext2D.isCreateBlitScreenELement) {
            (!WebglRenderContext2D.isCreateBlitScreenELement) && this.setBlitScreenElement();
            WebglRenderContext2D.blitContext = new WebglRenderContext2D();
            let engine = LayaGL.renderEngine as WebGLEngine;
            engine.on("endFrame", () => {
                let last_main_frame_buffer = WebGLEngine._lastFrameBuffer_WebGLOBJ;
                WebGLEngine._lastFrameBuffer_WebGLOBJ = null;
                WebglRenderContext2D.blitContext.setOffscreenView((engine as WebGLEngine).getInnerWidth(), (engine as WebGLEngine).getInnerHeight());

                WebglRenderContext2D.blitContext.setRenderTarget(null, false, Color.BLACK);
                WebglRenderContext2D.blitScreenElement.materialShaderData._setInternalTexture(Shader3D.propertyNameToID("u_MainTex"), WebGLEngine._lastFrameBuffer._textures[0]);
                WebglRenderContext2D.blitContext.drawRenderElementOne(WebglRenderContext2D.blitScreenElement);
                WebGLEngine._lastFrameBuffer_WebGLOBJ = last_main_frame_buffer;
            })
        }
    }

    /**
     * 兼容ConchWebGL
     */
    private setBlitScreenElement() {
        let blitScreenElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        let shaderData = LayaGL.renderDeviceFactory.createShaderData();
        let _vertices: Float32Array = new Float32Array([
            1, 1, 1, 1,
            1, -1, 1, 0,
            -1, 1, 0, 1,
            -1, -1, 0, 0]);

        let _vertexBuffer = new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
        _vertexBuffer.setDataLength(64);
        _vertexBuffer.setData(_vertices.buffer, 0, 0, _vertices.buffer.byteLength);
        let declaration = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, 0)]);
        _vertexBuffer.vertexDeclaration = declaration;
        let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.TriangleStrip, DrawType.DrawArray);
        geometry.setDrawArrayParams(0, 4);
        let bufferState = LayaGL.renderDeviceFactory.createBufferState();
        bufferState.applyState([_vertexBuffer], null);
        geometry.bufferState = bufferState;

        //Shader
        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            'a_PositionTexcoord': [0, ShaderDataType.Vector4]
        }
        let uniformMap = {
            "u_MainTex": ShaderDataType.Texture2D,
        };
        let shader = Shader3D.add("GLESblitScreen", false, false);
        shader.shaderType = ShaderFeatureType.D2;
        let subShader = new SubShader(attributeMap, uniformMap, {});
        shader.addSubShader(subShader);
        let vs = `
            #define SHADER_NAME GLESblitScreenVS

            varying vec2 v_Texcoord0;

            void main()
            {
                gl_Position = vec4(- 1.0 + (a_PositionTexcoord.x + 1.0), (1.0 - ((- 1.0 + (-a_PositionTexcoord.y + 1.0)) + 1.0) / 2.0) * 2.0 - 1.0, 0.0, 1.0);

                v_Texcoord0 = a_PositionTexcoord.zw;
            }
        `
        let fs = `
            #define SHADER_NAME GLESblitScreenFS

            #include "Color.glsl";

            varying vec2 v_Texcoord0;

            void main()
            {
                vec4 mainColor = texture2D(u_MainTex, v_Texcoord0);
               
                gl_FragColor = mainColor;
            }
        `
        let pass = subShader.addShaderPass(vs, fs);
        pass.statefirst = true;
        let blitState = pass.renderState;
        blitState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        blitState.depthWrite = false;
        blitState.cull = RenderState.CULL_NONE;
        blitState.blend = RenderState.BLEND_DISABLE;
        blitState.stencilRef = 1;
        blitState.stencilTest = RenderState.STENCILTEST_OFF;
        blitState.stencilWrite = false;
        blitState.stencilOp = new Vector3(RenderState.STENCILOP_KEEP, RenderState.STENCILOP_KEEP, RenderState.STENCILOP_REPLACE);


        blitScreenElement.geometry = geometry as WebGLRenderGeometryElement;
        blitScreenElement.materialShaderData = shaderData as WebGLShaderData;
        blitScreenElement.subShader = subShader;
        blitScreenElement.renderStateIsBySprite = false;


        WebglRenderContext2D.isCreateBlitScreenELement = true;
        WebglRenderContext2D.blitScreenElement = blitScreenElement as WebGLRenderelement2D;
    }

    drawRenderElementList(list: FastSinglelist<WebGLRenderelement2D>): number {
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            let element = list.elements[i];
            element._prepare(this);//render
        }
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            let element = list.elements[i];
            element._render(this);//render
        }
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

    drawRenderElementOne(node: WebGLRenderelement2D): void {
        node._prepare(this);
        node._render(this);
    }

}