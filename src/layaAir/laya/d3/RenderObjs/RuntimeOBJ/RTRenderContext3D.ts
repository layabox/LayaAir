import { NativeShaderData } from "../../../RenderEngine/RenderEngine/NativeGLEngine/NativeShaderData";
import { InternalRenderTarget } from "../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { Viewport } from "../../math/Viewport";
import { RTCameraNodeData, RTSceneNodeData } from "./RenderModuleData/RTModuleData";

export class RTRendercontext3D implements IRenderContext3D {
    private _globalShaderData: NativeShaderData;
    public get globalShaderData(): NativeShaderData {
        return this._globalShaderData;
    }
    public set globalShaderData(value: NativeShaderData) {
        this._globalShaderData = value;
        this._nativeObj.setGlobalShaderData(value._nativeObj);
    }
    private _sceneData: NativeShaderData;
    public get sceneData(): NativeShaderData {
        return this._sceneData;
    }
    public set sceneData(value: NativeShaderData) {
        this._sceneData = value;
        this._nativeObj.setSceneData(value._nativeObj);
    }
    private _sceneModuleData: RTSceneNodeData;
    public get sceneModuleData(): RTSceneNodeData {
        return this._sceneModuleData;
    }
    public set sceneModuleData(value: RTSceneNodeData) {
        this._sceneModuleData = value;
        this._nativeObj.setSceneNodeData(value._nativeObj);
    }
    private _cameraModuleData: RTCameraNodeData;
    public get cameraModuleData(): RTCameraNodeData {
        return this._cameraModuleData;
    }
    public set cameraModuleData(value: RTCameraNodeData) {
        this._cameraModuleData = value;
        this._nativeObj.setCameraNodeData(value._nativeObj);
    }
    private _cameraData: NativeShaderData;
    public get cameraData(): NativeShaderData {
        return this._cameraData;
    }
    public set cameraData(value: NativeShaderData) {
        this._cameraData = value;
        this._nativeObj.setCameraData(value._nativeObj);
    }
    public get sceneUpdataMask(): number {
        return this._nativeObj._sceneUpdataMask;
    }
    public set sceneUpdataMask(value: number) {
        this._nativeObj._sceneUpdataMask = value;
    }
    public get cameraUpdateMask(): number {
        return this._nativeObj._cameraUpdateMask;
    }
    public set cameraUpdateMask(value: number) {
        this._nativeObj._cameraUpdateMask = value;
    }

    public get pipelineMode(): string {
        return this._nativeObj._pipelineMode;
    }
    public set pipelineMode(value: string) {
        this._nativeObj._pipelineMode = value;
    }
    public get invertY(): boolean {
        return this._nativeObj._invertY;
    }
    public set invertY(value: boolean) {
        this._nativeObj._invertY = value;
    }
    setRenderTarget(value: InternalRenderTarget): void {
        this._nativeObj.setRenderTarget(value);
    }
    setViewPort(value: Viewport): void {
        this._nativeObj.setViewport(value);
    }
    setScissor(value: Vector4): void {
        this._nativeObj.setScissor(value);
    }
    setClearData(clearFlag: number, color: Color, depth: number, stencil: number): number {
        return this._nativeObj.setClearData(clearFlag, color, depth, stencil);
    }
    drawRenderElementList(list: SingletonList<IRenderElement>): number {
        return this._nativeObj.drawRenderElementList(list.elements, list.length);
    }
    drawRenderElementOne(node: IRenderElement): number {
        throw new Error("Method not implemented.");
    }

    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTRenderContext3D();
    }

}