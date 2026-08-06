import { Camera } from "../../../d3/core/Camera";
import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { DepthTextureMode } from "../../../resource/RenderTexture";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXCameraNodeData } from "../RenderModuleData/LayaXCameraNodeData";

/**
 * TS-owned main-pass config buffer layout (mixed i32/u32/f32). Contract shared with C++
 * `LayaXForwardAddClusterRP_JS` and Rust `layax_main_pass_bind_config_buffer` /
 * `layax_execute_forward_pass` — changing it requires updating all three. u32 slots use
 * the Uint32Array view, i32 (scissor) the Int32Array view, the rest Float32Array.
 */
const enum MSlot {
    EnableOpaque = 0,      // u32 (0/1)
    EnableTransparent = 1,
    EnableCMD = 2,
    DepthTextureMode = 3,  // u32
    ClearFlag = 4,         // u32
    ClearColorR = 5,       // f32
    ClearColorG = 6,
    ClearColorB = 7,
    ClearColorA = 8,
    ClearDepth = 9,        // f32
    ClearStencil = 10,     // u32
    ViewportX = 11,        // f32
    ViewportY = 12,
    ViewportW = 13,
    ViewportH = 14,
    ScissorX = 15,         // i32
    ScissorY = 16,
    ScissorW = 17,
    ScissorH = 18,
    CullMask = 19,         // u32
    StaticMask = 20,       // u32
    CamPosX = 21,          // f32
    CamPosY = 22,
    CamPosZ = 23,
    Count = 24,
}

export class LayaXForwardAddClusterRP {

    _nativeObj: any;

    // TS owns this buffer; Rust caches its raw pointer via bindBuffer and applies it each
    // frame in layax_execute_forward_pass. Instance field → stays alive (GC).
    private _buf: ArrayBuffer;
    private _f32: Float32Array;
    private _u32: Uint32Array;
    private _i32: Int32Array;

    // Pipeline mode strings stay native property fields (read by RT3DRenderPass C++).
    public get pipelineMode(): string { return this._nativeObj.pipelineMode; }
    public set pipelineMode(value: string) { this._nativeObj.pipelineMode = value; }

    public get depthPipelineMode(): string { return this._nativeObj.depthPipelineMode; }
    public set depthPipelineMode(value: string) { this._nativeObj.depthPipelineMode = value; }

    public get depthNormalPipelineMode(): string { return this._nativeObj.depthNormalPipelineMode; }
    public set depthNormalPipelineMode(value: string) { this._nativeObj.depthNormalPipelineMode = value; }

    public get depthTextureMode(): DepthTextureMode { return this._u32[MSlot.DepthTextureMode]; }
    public set depthTextureMode(value: DepthTextureMode) { this._u32[MSlot.DepthTextureMode] = value; }

    blitOpaqueBuffer: CommandBuffer; // TODO

    private _depthTarget: InternalRenderTarget;
    public get depthTarget(): InternalRenderTarget {
        return this._depthTarget;
    }
    public set depthTarget(value: InternalRenderTarget) {
        this._depthTarget = value;
        this._nativeObj.setDepthTarget((value as any)._nativeObj);
    }

    private _destTarget: InternalRenderTarget;
    public get destTarget(): InternalRenderTarget {
        return this._destTarget;
    }
    public set destTarget(value: InternalRenderTarget) {
        this._destTarget = value;
        this._nativeObj.setDestTarget((value as any)._nativeObj);
    }

    private _depthNormalTarget: InternalRenderTarget;
    public get depthNormalTarget(): InternalRenderTarget {
        return this._depthNormalTarget;
    }
    public set depthNormalTarget(value: InternalRenderTarget) {
        this._depthNormalTarget = value;
        this._nativeObj.setDepthNormalTarget((value as any)._nativeObj);
    }

    public get enableCMD(): boolean { return this._u32[MSlot.EnableCMD] !== 0; }
    public set enableCMD(value: boolean) { this._u32[MSlot.EnableCMD] = value ? 1 : 0; }

    public get enableOpaque(): boolean { return this._u32[MSlot.EnableOpaque] !== 0; }
    public set enableOpaque(value: boolean) { this._u32[MSlot.EnableOpaque] = value ? 1 : 0; }

    public get enableTransparent(): boolean { return this._u32[MSlot.EnableTransparent] !== 0; }
    public set enableTransparent(value: boolean) { this._u32[MSlot.EnableTransparent] = value ? 1 : 0; }

    private _camera: LayaXCameraNodeData;
    public get camera(): LayaXCameraNodeData {
        return this._camera;
    }
    public set camera(value: LayaXCameraNodeData) {
        this._camera = value;
        this._nativeObj.setCameraNodeData(value._nativeObj);
    }

    private _clearColor: Color;
    public get clearColor(): Color {
        return this._clearColor;
    }
    public set clearColor(value: Color) {
        this._clearColor = value;
        this._f32[MSlot.ClearColorR] = value.r;
        this._f32[MSlot.ClearColorG] = value.g;
        this._f32[MSlot.ClearColorB] = value.b;
        this._f32[MSlot.ClearColorA] = value.a;
    }

    private _clearFlag: number;
    public get clearFlag(): number {
        return this._clearFlag;
    }
    public set clearFlag(value: number) {
        this._clearFlag = value;
        this._u32[MSlot.ClearFlag] = value;
    }

    /**@internal */
    setCameraCullInfo(value: Camera, sceneManager: ISceneRenderManager): void {
        // In LayaX, camera position/frustum data flows through the camera ECS bridge.
        // Pass culling mask and static mask to Rust for layer-based culling.
        let pos = value._transform.position;
        this._u32[MSlot.CullMask] = value.cullingMask;
        this._u32[MSlot.StaticMask] = value.staticMask;
        this._f32[MSlot.CamPosX] = pos.x;
        this._f32[MSlot.CamPosY] = pos.y;
        this._f32[MSlot.CamPosZ] = pos.z;
        // Refresh the native view every frame. The JSVM may relocate an
        // ArrayBuffer backing store after allocation-heavy scene setup (for
        // example NavMesh construction), so a pointer captured only in the
        // constructor can become stale.
        this._nativeObj.bindBuffer(this._buf);
    }

    setViewPort(value: Viewport): void {
        this._f32[MSlot.ViewportX] = value.x;
        this._f32[MSlot.ViewportY] = value.y;
        this._f32[MSlot.ViewportW] = value.width;
        this._f32[MSlot.ViewportH] = value.height;
    }

    setScissor(value: Vector4): void {
        // Int32Array assignment truncates to int32 (matches the previous C++ static_cast).
        this._i32[MSlot.ScissorX] = value.x;
        this._i32[MSlot.ScissorY] = value.y;
        this._i32[MSlot.ScissorW] = value.z;
        this._i32[MSlot.ScissorH] = value.w;
    }

    private _getRenderCMDArray(cmds: IRenderCMD[]) {
        let nativeobCMDs: any[] = [];
        cmds.forEach(element => {
            nativeobCMDs.push((element as any)._nativeObj);
        });
        return nativeobCMDs;
    }

    setSkyRenderNode(value: IBaseRenderNode): void {
        this._nativeObj.setSkyRenderNode(value ? (value as any)._nativeObj : null);
    }

    setBeforeSkyboxCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._nativeObj.clearBeforeSkyboxCmds();
            value.forEach(element => {
                element._apply(false);
                this._nativeObj.addBeforeSkyboxCmds(this._getRenderCMDArray(element._renderCMDs));
            });
        } else {
            this._nativeObj.clearBeforeSkyboxCmds();
        }
    }

    setBeforeForwardCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._nativeObj.clearBeforeForwardCmds();
            value.forEach(element => {
                element._apply(false);
                this._nativeObj.addBeforeForwardCmds(this._getRenderCMDArray(element._renderCMDs));
            });
        } else {
            this._nativeObj.clearBeforeForwardCmds();
        }
    }

    setBeforeTransparentCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._nativeObj.clearBeforeTransparentCmds();
            value.forEach(element => {
                element._apply(false);
                this._nativeObj.addBeforeTransparentCmds(this._getRenderCMDArray(element._renderCMDs));
            });
        } else {
            this._nativeObj.clearBeforeTransparentCmds();
        }
    }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXForwardAddClusterRP();
        // Attribute-offset config block. Seed defaults matching the previous native ctor
        // (enableOpaque/Transparent=true, enableCMD=false, depthTextureMode=0) and the fixed
        // clear depth/stencil (1.0 / 0) the old setClear FFI always passed.
        this._buf = new ArrayBuffer(MSlot.Count * 4);
        this._f32 = new Float32Array(this._buf);
        this._u32 = new Uint32Array(this._buf);
        this._i32 = new Int32Array(this._buf);
        this._u32[MSlot.EnableOpaque] = 1;
        this._u32[MSlot.EnableTransparent] = 1;
        this._u32[MSlot.EnableCMD] = 0;
        this._u32[MSlot.DepthTextureMode] = 0;
        this._f32[MSlot.ClearDepth] = 1.0;
        this._u32[MSlot.ClearStencil] = 0;
        this._nativeObj.bindBuffer(this._buf);
    }

    destroy() {
        this._nativeObj = null;
    }
}
