import { InternalRenderTarget } from "../../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { IBaseRenderNode } from "../../../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { DepthTextureMode, IForwardAddClusterRP } from "../../../RenderDriverLayer/Render3DProcess/IForwardAddClusterRP";
import { ICameraNodeData } from "../../../RenderDriverLayer/RenderModuleData/IModuleData";
import { Camera } from "../../../core/Camera";
import { CommandBuffer } from "../../../core/render/command/CommandBuffer";
import { Viewport } from "../../../math/Viewport";


export class RTForwardAddClusterRP implements IForwardAddClusterRP {
    private _enableOpaque: boolean;
    public get enableOpaque(): boolean {
        return this._enableOpaque;
    }
    public set enableOpaque(value: boolean) {
        this._enableOpaque = value;
    }
    private _enableCMD: boolean;
    public get enableCMD(): boolean {
        return this._enableCMD;
    }
    public set enableCMD(value: boolean) {
        this._enableCMD = value;
    }
    private _enableTransparent: boolean;
    public get enableTransparent(): boolean {
        return this._enableTransparent;
    }
    public set enableTransparent(value: boolean) {
        this._enableTransparent = value;
    }
    private _enableOpaqueTexture: boolean;
    public get enableOpaqueTexture(): boolean {
        return this._enableOpaqueTexture;
    }
    public set enableOpaqueTexture(value: boolean) {
        this._enableOpaqueTexture = value;
    }
    private _destTarget: InternalRenderTarget;
    public get destTarget(): InternalRenderTarget {
        return this._destTarget;
    }
    public set destTarget(value: InternalRenderTarget) {
        this._destTarget = value;
    }
    private _pipelineMode: string;
    public get pipelineMode(): string {
        return this._pipelineMode;
    }
    public set pipelineMode(value: string) {
        this._pipelineMode = value;
    }
    private _depthTarget: InternalRenderTarget;
    public get depthTarget(): InternalRenderTarget {
        return this._depthTarget;
    }
    public set depthTarget(value: InternalRenderTarget) {
        this._depthTarget = value;
    }
    private _depthPipelineMode: string;
    public get depthPipelineMode(): string {
        return this._depthPipelineMode;
    }
    public set depthPipelineMode(value: string) {
        this._depthPipelineMode = value;
    }
    private _depthNormalTarget: InternalRenderTarget;
    public get depthNormalTarget(): InternalRenderTarget {
        return this._depthNormalTarget;
    }
    public set depthNormalTarget(value: InternalRenderTarget) {
        this._depthNormalTarget = value;
    }
    private _depthNormalPipelineMode: string;
    public get depthNormalPipelineMode(): string {
        return this._depthNormalPipelineMode;
    }
    public set depthNormalPipelineMode(value: string) {
        this._depthNormalPipelineMode = value;
    }
    private _skyRenderNode: IBaseRenderNode;
    public get skyRenderNode(): IBaseRenderNode {
        return this._skyRenderNode;
    }
    public set skyRenderNode(value: IBaseRenderNode) {
        this._skyRenderNode = value;
    }
    private _depthTextureMode: DepthTextureMode;
    public get depthTextureMode(): DepthTextureMode {
        return this._depthTextureMode;
    }
    public set depthTextureMode(value: DepthTextureMode) {
        this._depthTextureMode = value;
    }
    private _opaqueTexture: InternalRenderTarget;
    public get opaqueTexture(): InternalRenderTarget {
        return this._opaqueTexture;
    }
    public set opaqueTexture(value: InternalRenderTarget) {
        this._opaqueTexture = value;
    }
    private _camera: ICameraNodeData;
    public get camera(): ICameraNodeData {
        return this._camera;
    }
    public set camera(value: ICameraNodeData) {
        this._camera = value;
    }
    private _clearColor: Color;
    public get clearColor(): Color {
        return this._clearColor;
    }
    public set clearColor(value: Color) {
        this._clearColor = value;
    }
    private _clearFlag: number;
    public get clearFlag(): number {
        return this._clearFlag;
    }
    public set clearFlag(value: number) {
        this._clearFlag = value;
    }

    setCameraCullInfo(value: Camera): void {
        throw new Error("Method not implemented.");
    }

    setViewPort(value: Viewport): void {
        throw new Error("Method not implemented.");
    }

    setScissor(value: Vector4): void {
        throw new Error("Method not implemented.");
    }

    setBeforeForwardCmds(value: CommandBuffer[]): void {
        throw new Error("Method not implemented.");
    }

    setBeforeSkyboxCmds(value: CommandBuffer[]): void {
        throw new Error("Method not implemented.");
    }

    setBeforeTransparentCmds(value: CommandBuffer[]): void {
        throw new Error("Method not implemented.");
    }

    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTVolumetricGI();
    }

}