import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Vector3 } from "../../../maths/Vector3";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderData, ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { GLESInternalRT } from "../RenderDevice/GLESInternalRT";
import { GLESRenderGeometryElement } from "../RenderDevice/GLESRenderGeometryElement";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";
import { GLESVertexBuffer } from "../RenderDevice/GLESVertexBuffer";
import { GLESRenderElement2D } from "./GLESRenderElement2D";

export class GLESRenderContext2D implements IRenderContext2D {

    static isCreateBlitScreenELement = false;

    static blitScreenElement: GLESRenderElement2D;

    private _tempList: any = [];

    /**
     * @internal
     */
    _nativeObj: any;

    private _dist: GLESInternalRT;

    /** @internal Shared Ctx2DProps block: slot0=invertY(i32 0/1), 1=offW(u32), 2=offH(u32), 3=offX(i32), 4=offY(i32). */
    private _ctx2dBuf = new ArrayBuffer(5 * 4);
    private _ctx2dI32 = new Int32Array(this._ctx2dBuf);
    private _ctx2dU32 = new Uint32Array(this._ctx2dBuf);

    /** @internal pipelineMode TS cache + change dedupe; GLES C++ consumes it so it is pushed to native on change. */
    private _pipelineMode: string = "Forward";

    public get invertY(): boolean {
        return this._ctx2dI32[0] !== 0;
    }

    public set invertY(value: boolean) {
        this._ctx2dI32[0] = value ? 1 : 0;
    }

    public get pipelineMode(): string {
        return this._pipelineMode;
    }

    public set pipelineMode(value: string) {
        if (this._pipelineMode === value) return;
        this._pipelineMode = value;
        this._nativeObj.pipelineMode = value;
    }

    constructor() {
        this._nativeObj = new (window as any).conchGLESRenderContext2D();
        this._nativeObj.bindContext2DBuffer(this._ctx2dBuf);
        this._nativeObj.setGlobalConfigShaderData((Shader3D._configDefineValues as any)._nativeObj);
        this._nativeObj.pipelineMode = "Forward";
    }

    private _passData: GLESShaderData = null;
    private _passDataShell: GLESShaderData = new GLESShaderData(null, false);
    public get passData(): GLESShaderData {
        this._passDataShell._nativeObj = this._nativeObj.getPassData();
        return this._passDataShell;
    }
    public set passData(value: GLESShaderData) {
        this._passData = value;
        this._nativeObj.setPassData(value ? value._nativeObj : null);
    }


    drawRenderElementList(list: FastSinglelist<GLESRenderElement2D>): number {
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

    setOffscreenView(width: number, height: number, x: number = 0, y: number = 0): void {
        // Write the shared block directly (zero crossing); GLES C++ setRenderTarget reads it.
        this._ctx2dU32[1] = width;
        this._ctx2dU32[2] = height;
        this._ctx2dI32[3] = x;
        this._ctx2dI32[4] = y;
    }

    getOffscreenView(out: Vector4): void {
        out.setValue(this._ctx2dI32[3], this._ctx2dI32[4], this._ctx2dU32[1], this._ctx2dU32[2]);
    }

    drawRenderElementOne(node: GLESRenderElement2D): void {
        this._nativeObj.drawRenderElementOne(node._nativeObj);
    }

    runOneCMD(cmd: IRenderCMD): void {
        this._nativeObj.runOneCMD((cmd as any)._nativeObj);
    }

    runCMDList(cmds: IRenderCMD[]): void {
        let nativeobCMDs: any[] = [];
        cmds.forEach(element => {
            nativeobCMDs.push((element as any)._nativeObj);
        });

        this._nativeObj.runCMDList(nativeobCMDs);
    }





}