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
 * 职责精简：只负责 ShaderData / ModuleData / InvertY 绑定到 Rust。
 * 渲染 Pass 配置（viewport/scissor/clear/RT）由 LayaXForwardAddClusterRP 直接设置。
 * RenderElement 是 Rust 侧持久对象，draw 方法为 no-op。
 */
export class LayaXRenderContext3D implements IRenderContext3D {

    /** Native C++ LayaXRenderContext object (conchLayaXRenderContext). */
    _nativeObj: any;

    // ------------------------------------------------------------------
    // ShaderData bindings → C++ → Rust FFI
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

    private _cameraData: ShaderData;
    public get cameraData(): ShaderData { return this._cameraData; }
    public set cameraData(value: ShaderData) {
        this._cameraData = value;
        if (this._nativeObj) {
            this._nativeObj.setCameraShaderData(value ? (value as any)._nativeObj : null);
        }
    }

    // ------------------------------------------------------------------
    // ModuleData bindings → C++ → Rust FFI
    // ------------------------------------------------------------------

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

    // ------------------------------------------------------------------
    // Simple properties (interface compat)
    // ------------------------------------------------------------------

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
    // Constructor
    // ------------------------------------------------------------------

    constructor() {
        this.cameraUpdateMask = 0;
        this._nativeObj = new (window as any).conchLayaXRenderContext();
    }

    // ------------------------------------------------------------------
    // IRenderContext3D methods — pass config is handled by ForwardAddClusterRP
    // ------------------------------------------------------------------

    setRenderTarget(value: InternalRenderTarget, clearFlag: RenderClearFlag): void {
        // No-op: RT is set via LayaXForwardAddClusterRP.setDestTarget → Rust FFI
    }

    setViewPort(value: Viewport): void {
        // No-op: viewport is set via LayaXForwardAddClusterRP.setViewPort → Rust FFI
    }

    setScissor(value: Vector4): void {
        // No-op: scissor is set via LayaXForwardAddClusterRP.setScissor → Rust FFI
    }

    setClearData(clearFlag: number, color: Color, depth: number, stencil: number): number {
        // No-op: clear is set via LayaXForwardAddClusterRP.setClearFlag/setClearColor → Rust FFI
        return 0;
    }

    clearRenderTarget(): void {
        // No-op: clear is part of the render pass begin in Rust
    }

    drawRenderElementList(list: FastSinglelist<IRenderElement3D>): number {
        // No-op: RenderElements are persistent Rust objects
        return list ? list.length : 0;
    }

    drawRenderElementOne(node: IRenderElement3D): number {
        // No-op: RenderElements are persistent Rust objects
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
