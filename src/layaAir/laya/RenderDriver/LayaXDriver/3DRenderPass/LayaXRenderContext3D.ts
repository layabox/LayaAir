import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ICameraNodeData, ISceneNodeData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";

/**
 * LayaX render context for 3D.
 *
 * RenderElement 已改为持久 handle 模式（每个 element 通过 _nativeObj 注册到 Rust），
 * 不再需要 POD 序列化提交。
 *
 * drawRenderElementList / drawRenderElementOne 保留接口兼容但为 no-op，
 * 因为 layax_execute_forward_pass 直接从 Rust 侧 render_elements 读取。
 */
export class LayaXRenderContext3D implements IRenderContext3D {

    /** Native C++ LayaXRenderContext object (conchLayaXRenderContext). */
    _nativeObj: any;

    // ------------------------------------------------------------------
    // IRenderContext3D property implementations
    // ------------------------------------------------------------------

    private _globalShaderData: ShaderData;
    public get globalShaderData(): ShaderData { return this._globalShaderData; }
    public set globalShaderData(value: ShaderData) {
        this._globalShaderData = value;
        if (this._nativeObj) {
            this._nativeObj.setGlobalShaderData(value ? (value as any)._nativeObj : null);
        }
    }

    private _sceneData: ShaderData;
    public get sceneData(): ShaderData { return this._sceneData; }
    public set sceneData(value: ShaderData) {
        this._sceneData = value;
        if (this._nativeObj) {
            this._nativeObj.setSceneShaderData(value ? (value as any)._nativeObj : null);
        }
    }

    private _sceneModuleData: ISceneNodeData;
    public get sceneModuleData(): ISceneNodeData { return this._sceneModuleData; }
    public set sceneModuleData(value: ISceneNodeData) {
        this._sceneModuleData = value;
        if (this._nativeObj) {
            this._nativeObj.setSceneModuleData(value ? (value as any)._nativeObj : null);
        }
    }

    private _cameraModuleData: ICameraNodeData;
    public get cameraModuleData(): ICameraNodeData { return this._cameraModuleData; }
    public set cameraModuleData(value: ICameraNodeData) {
        this._cameraModuleData = value;
        if (this._nativeObj) {
            this._nativeObj.setCameraModuleData(value ? (value as any)._nativeObj : null);
        }
    }

    private _cameraData: ShaderData;
    public get cameraData(): ShaderData { return this._cameraData; }
    public set cameraData(value: ShaderData) {
        this._cameraData = value;
        if (this._nativeObj) {
            this._nativeObj.setCameraShaderData(value ? (value as any)._nativeObj : null);
        }
    }

    private _sceneUpdateMask: number = 0;
    public get sceneUpdateMask(): number { return this._sceneUpdateMask; }
    public set sceneUpdateMask(value: number) { this._sceneUpdateMask = value; }

    private _cameraUpdateMask: number = 0;
    public get cameraUpdateMask(): number { return this._cameraUpdateMask; }
    public set cameraUpdateMask(value: number) { this._cameraUpdateMask = value; }

    private _pipelineMode: string = "Forward";
    public get pipelineMode(): string { return this._pipelineMode; }
    public set pipelineMode(value: string) { this._pipelineMode = value; }

    private _invertY: boolean = false;
    public get invertY(): boolean { return this._invertY; }
    public set invertY(value: boolean) {
        this._invertY = value;
        if (this._nativeObj) {
            this._nativeObj.setInvertY(value);
        }
    }

    preDrawUniformMaps: Set<string> = new Set<string>();

    // ------------------------------------------------------------------
    // Recorded render pass state
    // ------------------------------------------------------------------

    private _rtHandle: number = 0;
    private _clearFlag: number = 0;
    private _clearColor: Color = new Color(0, 0, 0, 1);
    private _clearDepth: number = 1.0;
    private _clearStencil: number = 0;
    private _viewport: Viewport = new Viewport(0, 0, 0, 0);
    private _scissor: Vector4 = new Vector4(0, 0, 0, 0);

    // ------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------

    constructor() {
        this.cameraUpdateMask = 0;
        this._nativeObj = new (window as any).conchLayaXRenderContext();
    }

    // ------------------------------------------------------------------
    // Render pass lifecycle
    // ------------------------------------------------------------------

    /**
     * Begin the current render pass: send RT/clear/viewport/scissor to Rust.
     */
    _start(): void {
        this._nativeObj.beginRenderPass(
            this._rtHandle,
            this._clearFlag,
            this._clearColor.r, this._clearColor.g,
            this._clearColor.b, this._clearColor.a,
            this._clearDepth,
            this._clearStencil,
            this._viewport.x, this._viewport.y,
            this._viewport.width, this._viewport.height,
            this._scissor.x | 0, this._scissor.y | 0,
            this._scissor.z | 0, this._scissor.w | 0
        );
    }

    /**
     * End the current render pass.
     */
    _submit(): void {
        this._nativeObj.endRenderPass();
    }

    // ------------------------------------------------------------------
    // IRenderContext3D methods
    // ------------------------------------------------------------------

    setRenderTarget(value: InternalRenderTarget, clearFlag: RenderClearFlag): void {
        if (value) {
            this._rtHandle = (value as any)._nativeObj ? (value as any)._nativeObj.handle || 0 : 0;
        } else {
            this._rtHandle = 0;
        }
        this._clearFlag = clearFlag;
    }

    setViewPort(value: Viewport): void {
        this._viewport.x = value.x;
        this._viewport.y = value.y;
        this._viewport.width = value.width;
        this._viewport.height = value.height;
    }

    setScissor(value: Vector4): void {
        this._scissor.x = value.x;
        this._scissor.y = value.y;
        this._scissor.z = value.z;
        this._scissor.w = value.w;
    }

    setClearData(clearFlag: number, color: Color, depth: number, stencil: number): number {
        this._clearFlag = clearFlag;
        if (color) {
            this._clearColor.r = color.r;
            this._clearColor.g = color.g;
            this._clearColor.b = color.b;
            this._clearColor.a = color.a;
        }
        this._clearDepth = depth;
        this._clearStencil = stencil;
        return 0;
    }

    clearRenderTarget(): void {
        // Clear is handled as part of beginRenderPass
    }

    /**
     * No-op: RenderElement 已是 Rust 侧持久对象。
     * Forward pass 直接从 Rust render_elements 读取，不需要 TS 侧提交。
     */
    drawRenderElementList(list: FastSinglelist<IRenderElement3D>): number {
        return list ? list.length : 0;
    }

    /**
     * No-op: 同上。
     */
    drawRenderElementOne(node: IRenderElement3D): number {
        return node ? 1 : 0;
    }

    runOneCMD(cmd: IRenderCMD): void {
        if (cmd) {
            cmd.apply(this);
        }
    }

    runCMDList(cmds: IRenderCMD[]): void {
        if (!cmds) return;
        for (let i = 0, n = cmds.length; i < n; i++) {
            cmds[i].apply(this);
        }
    }
}
