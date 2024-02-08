import { Camera } from "../../../d3/core/Camera";
import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { Viewport } from "../../../d3/math/Viewport";
import { CameraCullInfo } from "../../../d3/shadowMap/ShadowSliceData";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { DepthTextureMode } from "../../../resource/RenderTexture";
import { IForwardAddClusterRP } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { RTCameraNodeData } from "../../RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleData";
import { RTBaseRenderNode } from "../../RenderModuleData/RuntimeModuleData/3D/RTBaseRenderNode";



export class GLESForwardAddClusterRP implements IForwardAddClusterRP {
    public get enableOpaque(): boolean {
        return this._nativeObj._enableOpaque;
    }
    public set enableOpaque(value: boolean) {
        this._nativeObj._enableOpaque = value;
    }
    public get enableCMD(): boolean {
        return this._nativeObj._enableCMD;
    }
    public set enableCMD(value: boolean) {
        this._nativeObj._enableCMD = value;
    }
    public get enableTransparent(): boolean {
        return this._nativeObj._enableTransparent;
    }
    public set enableTransparent(value: boolean) {
        this._nativeObj._enableTransparent = value;
    }
    public get enableOpaqueTexture(): boolean {
        return this._nativeObj._enableOpaqueTexture;
    }
    public set enableOpaqueTexture(value: boolean) {
        this._nativeObj._enableOpaqueTexture = value;
    }
    private _destTarget: InternalRenderTarget;
    public get destTarget(): InternalRenderTarget {
        return this._destTarget;
    }
    public set destTarget(value: InternalRenderTarget) {
        this._destTarget = value;
        this._nativeObj.setDestTarget(value);
    }
    public get pipelineMode(): string {
        return this._nativeObj._pipelineMode;
    }
    public set pipelineMode(value: string) {
        this._nativeObj._pipelineMode = value;
    }
    private _depthTarget: InternalRenderTarget;
    public get depthTarget(): InternalRenderTarget {
        return this._depthTarget;
    }
    public set depthTarget(value: InternalRenderTarget) {
        this._depthTarget = value;
        this._nativeObj.setDepthTarget(value);
    }
    public get depthPipelineMode(): string {
        return this._nativeObj._depthPipelineMode;
    }
    public set depthPipelineMode(value: string) {
        this._nativeObj._depthPipelineMode = value;
    }
    private _depthNormalTarget: InternalRenderTarget;
    public get depthNormalTarget(): InternalRenderTarget {
        return this._depthNormalTarget;
    }
    public set depthNormalTarget(value: InternalRenderTarget) {
        this._depthNormalTarget = value;
        this._nativeObj.setDepthNormalTarget(value);
    }
    public get depthNormalPipelineMode(): string {
        return this._nativeObj._depthNormalPipelineMode;
    }
    public set depthNormalPipelineMode(value: string) {
        this._nativeObj._depthNormalPipelineMode = value;
    }
    private _skyRenderNode: RTBaseRenderNode;
    public get skyRenderNode(): RTBaseRenderNode {
        return this._skyRenderNode;
    }
    public set skyRenderNode(value: RTBaseRenderNode) {
        this._skyRenderNode = value;
        this._nativeObj.setSkyRenderNode(value ? value._nativeObj : null);
    }
    public get depthTextureMode(): DepthTextureMode {
        return this._nativeObj._depthTextureMode;
    }
    public set depthTextureMode(value: DepthTextureMode) {
        this._nativeObj._depthTextureMode = value;
    }
    private _opaqueTexture: InternalRenderTarget;
    public get opaqueTexture(): InternalRenderTarget {
        return this._opaqueTexture;
    }
    public set opaqueTexture(value: InternalRenderTarget) {
        this._opaqueTexture = value;
        this._nativeObj.setOpaqueTexture(value);
    }
    private _camera: RTCameraNodeData;
    public get camera(): RTCameraNodeData {
        return this._camera;
    }
    public set camera(value: RTCameraNodeData) {
        this._camera = value;
        this._nativeObj.setCameraNodeData(value);
    }
    private _clearColor: Color;
    public get clearColor(): Color {
        return this._clearColor;
    }
    public set clearColor(value: Color) {
        this._clearColor = value;
        this._nativeObj.setClearColor(value);
    }
    public get clearFlag(): number {
        return this._nativeObj._clearFlag;
    }
    public set clearFlag(value: number) {
        this._nativeObj._clearFlag = value;
    }
    /**@internal */
    _cameraCullInfo: CameraCullInfo;
    setCameraCullInfo(value: Camera): void {
        this._cameraCullInfo.position = value._transform.position;
        this._cameraCullInfo.cullingMask = value.cullingMask;
        this._cameraCullInfo.staticMask = value.staticMask;
        this._cameraCullInfo.boundFrustum = value.boundFrustum;
        this._cameraCullInfo.useOcclusionCulling = value.useOcclusionCulling;
        this._nativeObj.setCameraCullInfo(this._cameraCullInfo);
    }

    setViewPort(value: Viewport): void {
        this._nativeObj.setViewport(value);
    }

    setScissor(value: Vector4): void {
        this._nativeObj.setScissor(value);
    }

    setBeforeForwardCmds(value: CommandBuffer[]): void {
        //throw new Error("Method not implemented.");
    }

    setBeforeSkyboxCmds(value: CommandBuffer[]): void {
        //throw new Error("Method not implemented.");
    }

    setBeforeTransparentCmds(value: CommandBuffer[]): void {
        //throw new Error("Method not implemented.");
    }

    _nativeObj: any;

    constructor() {
        this._cameraCullInfo = new CameraCullInfo();
        this._nativeObj = new (window as any).conchRTForwardAddClusterRP();
    }

}