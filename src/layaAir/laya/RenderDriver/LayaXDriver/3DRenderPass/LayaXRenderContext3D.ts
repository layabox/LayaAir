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
import { LayaXBlitRenderFeature } from "./LayaXBlitRenderFeature";
import { LayaXRenderElement3D } from "./LayaXRenderElement3D";

/**
 * LayaX render context for 3D.
 *
 * 将 ShaderData、ModuleData 和翻转状态绑定到 C++ 上下文。
 * 常规相机 pass 由 LayaXForwardAddClusterRP 配置；独立 draw 经 BlitRenderFeature
 * 录制，clearRenderTarget 经缓存的 SetRenderTarget 命令提交并消费清除状态。
 */
export class LayaXRenderContext3D implements IRenderContext3D {

    /** Native C++ LayaXRenderContext object (conchLayaXRenderContext). */
    _nativeObj: any;

    // ------------------------------------------------------------------
    // ShaderData bindings → Native C++ → LayaX C API
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
    // ModuleData bindings → Native C++ → LayaX C API
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
    // IRenderContext3D methods
    // ------------------------------------------------------------------

    /** BlitRenderFeature 实例（惰性创建） */
    private _blitFeature: LayaXBlitRenderFeature;

    /** 缓存当前 destRT（由 setRenderTarget 设置，drawRenderElementOne 消费） */
    private _destRT: InternalRenderTarget | null = null;
    /** 缓存当前 viewport */
    private _viewport: Viewport = new Viewport(0, 0, 0, 0);
    /** 缓存当前 scissor (x, y, w, h) */
    private _scissor: Vector4 = new Vector4();
    /** 缓存当前 offsetScale (ox, oy, sx, sy) */
    private _offsetScale: Vector4 = new Vector4(0, 0, 1, 1);
    private _clearCommand: any;
    private _clearFlag: number = RenderClearFlag.Nothing;
    private _clearColor: Color = new Color();
    private _clearDepth: number = 1;
    private _clearStencil: number = 0;
    private _clearColorRGBA: number[] = [];
    private _clearColorEnabled: number[] = [];

    setRenderTarget(value: InternalRenderTarget, clearFlag: RenderClearFlag): void {
        this._destRT = value;
        this._clearFlag = clearFlag ?? RenderClearFlag.Nothing;
    }

    setViewPort(value: Viewport): void {
        value.cloneTo(this._viewport);
    }

    setScissor(value: Vector4): void {
        value.cloneTo(this._scissor);
    }

    setClearData(clearFlag: number, color: Color, depth: number, stencil: number, colorValues?: readonly (Color | null)[]): number {
        this._clearFlag = clearFlag;
        color.cloneTo(this._clearColor);
        this._clearDepth = depth;
        this._clearStencil = stencil;
        const rgba = this._clearColorRGBA;
        const enabled = this._clearColorEnabled;
        const count = (clearFlag & RenderClearFlag.Color) ? colorValues?.length ?? 0 : 0;
        rgba.length = count * 4;
        enabled.length = count;
        for (let i = 0; i < count; i++) {
            const value = colorValues[i];
            enabled[i] = value ? 1 : 0;
            rgba[i * 4] = value?.r ?? 0;
            rgba[i * 4 + 1] = value?.g ?? 0;
            rgba[i * 4 + 2] = value?.b ?? 0;
            rgba[i * 4 + 3] = value?.a ?? 0;
        }
        return 0;
    }

    clearRenderTarget(): void {
        if (this._clearFlag === RenderClearFlag.Nothing) return;
        const cmd = this._clearCommand ||= new (window as any).conchLayaXSetRenderTargetCMD();
        cmd.setRT(this._destRT ? (this._destRT as any)._nativeObj : null);
        cmd.setClearFlag(this._clearFlag);
        const color = this._clearColor;
        cmd.clearColorValue(color.r, color.g, color.b, color.a);
        cmd.clearDepthValue(this._clearDepth);
        cmd.clearStencilValue(this._clearStencil);
        cmd.setClearColorValues(this._clearColorRGBA, this._clearColorEnabled);
        cmd.execute();
        this._clearFlag = RenderClearFlag.Nothing;
        this._clearColorRGBA.length = 0;
        this._clearColorEnabled.length = 0;
    }

    drawRenderElementList(list: FastSinglelist<IRenderElement3D>): number {
        if (!list) return 0;
        for (let i = 0, n = list.length; i < n; i++) {
            this.drawRenderElementOne(list.elements[i]);
        }
        return list.length;
    }

    drawRenderElementOne(node: IRenderElement3D): number {
        if (!node) return 0;
        this.clearRenderTarget();
        if (!this._blitFeature) {
            this._blitFeature = new LayaXBlitRenderFeature();
        }
        this._blitFeature.dispatch(
            node as LayaXRenderElement3D,
            this._destRT,
            this._globalShaderData,
            this._sceneData,
            this._cameraData,
            this._viewport,
            this._scissor,
            this._offsetScale
        );
        return 1;
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
