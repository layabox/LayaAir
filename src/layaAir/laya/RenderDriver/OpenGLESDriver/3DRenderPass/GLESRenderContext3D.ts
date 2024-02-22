import { Viewport } from "../../../d3/math/Viewport";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { RTCameraNodeData, RTSceneNodeData } from "../../RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleData";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";


export class GLESRenderContext3D implements IRenderContext3D {
    private _globalShaderData: GLESShaderData;
    public get globalShaderData(): GLESShaderData {
        return this._globalShaderData;
    }
    public set globalShaderData(value: GLESShaderData) {
        this._globalShaderData = value;
        this._nativeObj.setGlobalShaderData(value._nativeObj);
    }
    private _sceneData: GLESShaderData;
    public get sceneData(): GLESShaderData {
        return this._sceneData;
    }
    public set sceneData(value: GLESShaderData) {
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
    private _cameraData: GLESShaderData;
    public get cameraData(): GLESShaderData {
        return this._cameraData;
    }
    public set cameraData(value: GLESShaderData) {
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


    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTRenderContext3D();
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
    drawRenderElementList(list: SingletonList<IRenderElement3D>): number {
        return this._nativeObj.drawRenderElementList(list.elements, list.length);
    }
    drawRenderElementOne(node: IRenderElement3D): number {
        throw new Error("Method not implemented.");
    }
    runOneCMD(cmd: IRenderCMD): void {
        throw new Error("Method not implemented.");
    }
    runCMDList(cmds: IRenderCMD[]): void {
        throw new Error("Method not implemented.");
    }

}