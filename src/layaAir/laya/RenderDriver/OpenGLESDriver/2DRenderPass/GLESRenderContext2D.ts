import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { GLESInternalRT } from "../RenderDevice/GLESInternalRT";
import { GLESRenderGeometryElement } from "../RenderDevice/GLESRenderGeometryElement";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";
import { GLESVertexBuffer } from "../RenderDevice/GLESVertexBuffer";
import { GLESREnderElement2D } from "./GLESRenderElement2D";

export class GLESREnderContext2D implements IRenderContext2D {

    static isCreateBlitScreenELement = false;

    static blitScreenElement: GLESREnderElement2D;

    private _tempList: any = [];

    /**
     * @internal
     */
    _nativeObj: any;

    sceneData: ShaderData;

    private _dist: GLESInternalRT;

    public get invertY(): boolean {
        return this._nativeObj.invertY;
    }

    public set invertY(value: boolean) {
        this._nativeObj.invertY = value;
    }

    public get pipelineMode(): string {
        return this._nativeObj.pipelineMode;
    }

    public set pipelineMode(value: string) {
        this._nativeObj.pipelineMode = value;
    }

    constructor() {
        this._nativeObj = new (window as any).conchGLESRenderContext2D();
        this._nativeObj.setGlobalConfigShaderData((Shader3D._configDefineValues as any)._nativeObj);
        this._nativeObj.pipelineMode = "Forward";
        (!GLESREnderContext2D.isCreateBlitScreenELement) && this.setBlitScreenElement();

    }


    private setBlitScreenElement() {
        let blitScreenElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        let shaderData = LayaGL.renderDeviceFactory.createShaderData();
        let _vertices: Float32Array = new Float32Array([
            1, 1, 1, 1,
            1, -1, 1, 0,
            -1, 1, 0, 1,
            -1, -1, 0, 0]);

        let _vertexBuffer = new GLESVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
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
        blitScreenElement.geometry = geometry as GLESRenderGeometryElement;
        blitScreenElement.materialShaderData = shaderData as GLESShaderData;
        blitScreenElement.subShader = subShader;
        blitScreenElement.renderStateIsBySprite = false;

        this._nativeObj.setBlitScreenElement((blitScreenElement as GLESREnderElement2D)._nativeObj);
        GLESREnderContext2D.isCreateBlitScreenELement = true;
        GLESREnderContext2D.blitScreenElement = blitScreenElement as GLESREnderElement2D;
    }

    drawRenderElementList(list: FastSinglelist<GLESREnderElement2D>): number {
        this._tempList.length = 0;
        let listelement = list.elements;
        listelement.forEach((element) => {
            this._tempList.push(element._nativeObj);
        });
        return this._nativeObj.drawRenderElementList(this._tempList, list.length);
    }

    setRenderTarget(value: GLESInternalRT, clear: boolean, clearColor: Color): void {
        this._dist = value;
        this._nativeObj.setRenderTarget(value ? value._nativeObj : null, clear, clearColor);
    }

    getRenderTarget(): GLESInternalRT {
        return this._dist;
    }

    setOffscreenView(width: number, height: number): void {
        this._nativeObj.setOffscreenView(width, height);
    }

    drawRenderElementOne(node: GLESREnderElement2D): void {
        this._nativeObj.drawRenderElementOne(node._nativeObj);
    }

    runOneCMD(cmd: IRenderCMD): void {
        //TODO
    }

    runCMDList(cmds: IRenderCMD[]): void {
        //throw new Error("Method not implemented.");
        //TODO
    }





}