import { Camera } from "../../../../../d3/core/Camera";
import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";
import { CameraCullInfo } from "../../../../../d3/shadowMap/ShadowSliceData";
import { Color } from "../../../../../maths/Color";
import { Vector4 } from "../../../../../maths/Vector4";
import { Viewport } from "../../../../../maths/Viewport";
import { DepthTextureMode } from "../../../../../resource/RenderTexture";
import { ISceneRenderManager } from "../../../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { InternalRenderTarget } from "../../../../DriverDesign/RenderDevice/InternalRenderTarget";
import { IRenderCMD } from "../../../../DriverDesign/RenderDevice/IRenderCMD";
import { RTCameraNodeData } from "../RT3DRenderModuleData";
import { RTBaseRenderNode } from "../RTBaseRenderNode";



export class RTForwardAddClusterRP {
    public get pipelineMode(): string {
        return this._nativeObj.pipelineMode;
    }
    public set pipelineMode(value: string) {
        this._nativeObj.pipelineMode = value;
    }

    public get depthPipelineMode(): string {
        return this._nativeObj.depthPipelineMode;
    }
    public set depthPipelineMode(value: string) {
        this._nativeObj.depthPipelineMode = value;
    }

    public get depthNormalPipelineMode(): string {
        return this._nativeObj.depthNormalPipelineMode;
    }
    public set depthNormalPipelineMode(value: string) {
        this._nativeObj.depthNormalPipelineMode = value;
    }

    public get depthTextureMode(): DepthTextureMode {
        return this._nativeObj.depthTextureMode;
    }
    public set depthTextureMode(value: DepthTextureMode) {
        this._nativeObj.depthTextureMode = value;
    }

    blitOpaqueBuffer: CommandBuffer;//TODO

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

    public get enableCMD(): boolean {
        return this._nativeObj.enableCMD;
    }
    public set enableCMD(value: boolean) {
        this._nativeObj.enableCMD = value;
    }

    public get enableOpaque(): boolean {
        return this._nativeObj.enableOpaque;
    }
    public set enableOpaque(value: boolean) {
        this._nativeObj.enableOpaque = value;
    }

    public get enableTransparent(): boolean {
        return this._nativeObj.enableTransparent;
    }
    public set enableTransparent(value: boolean) {
        this._nativeObj.enableTransparent = value;
    }

    private _skyRenderNode: RTBaseRenderNode;
    public get skyRenderNode(): RTBaseRenderNode {
        return this._skyRenderNode;
    }
    public set skyRenderNode(value: RTBaseRenderNode) {
        this._skyRenderNode = value;
        this._nativeObj.setSkyRenderNode(value ? value._nativeObj : null);
    }

    private _camera: RTCameraNodeData;
    public get camera(): RTCameraNodeData {
        return this._camera;
    }
    public set camera(value: RTCameraNodeData) {
        this._camera = value;
        this._nativeObj.setCameraNodeData(value._nativeObj);
    }


    private _clearColor: Color;
    public get clearColor(): Color {
        return this._clearColor;
    }
    public set clearColor(value: Color) {
        this._clearColor = value;
        this._nativeObj.setClearColor(value);
    }

    private _clearFlag: number;
    public get clearFlag(): number {
        return this._clearFlag;
    }
    public set clearFlag(value: number) {
        this._clearFlag = value;
        this._nativeObj.setClearFlag(value);
    }


    /**@internal */
    private _cameraCullInfo: CameraCullInfo;
    setCameraCullInfo(value: Camera, sceneManager: ISceneRenderManager): void {
        this._cameraCullInfo.position = value._transform.position;
        this._cameraCullInfo.cullingMask = value.cullingMask;
        this._cameraCullInfo.staticMask = value.staticMask;
        this._cameraCullInfo.boundFrustum = value.boundFrustum;
        this._cameraCullInfo.useOcclusionCulling = value.useOcclusionCulling;
        this._nativeObj.setCameraCullInfo(this._cameraCullInfo, (sceneManager as any)._nativeObj);
    }

    setViewPort(value: Viewport): void {
        this._nativeObj.setViewPort(value);
    }

    setScissor(value: Vector4): void {
        this._nativeObj.setScissor(value);
    }

    private _getRenderCMDArray(cmds: IRenderCMD[]) {
        let nativeobCMDs: any[] = [];
        cmds.forEach(element => {
            nativeobCMDs.push((element as any)._nativeObj);
        });
        return nativeobCMDs;
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

    setBeforeSkyboxCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            // this.beforeTransparentCmds = value;
            this._nativeObj.clearBeforeSkyboxCmds();
            value.forEach(element => {
                element._apply(false);
                this._nativeObj.addBeforeSkyboxCmds(this._getRenderCMDArray(element._renderCMDs));
            });
        } else {
            this._nativeObj.clearBeforeSkyboxCmds();
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

    _nativeObj: any;

    constructor() {
        this._cameraCullInfo = new CameraCullInfo();
        this._nativeObj = new (window as any).conchRTForwardAddClusterRP();
    }

    destroy() {
        this._nativeObj = null;
    }


}