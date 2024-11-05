import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { RTCameraNodeData, RTSceneNodeData } from "../../RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleData";
import { GLESInternalRT } from "../RenderDevice/GLESInternalRT";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";
import { GLESRenderElement3D } from "./GLESRenderElement3D";


export class GLESRenderContext3D implements IRenderContext3D {
    private _globalShaderData: GLESShaderData;
    public get globalShaderData(): GLESShaderData {
        return this._globalShaderData;
    }
    public set globalShaderData(value: GLESShaderData) {
        this._globalShaderData = value;
        this._nativeObj.setGlobalShaderData(value ? value._nativeObj : null);
    }
    private _sceneData: GLESShaderData;
    public get sceneData(): GLESShaderData {
        return this._sceneData;
    }
    public set sceneData(value: GLESShaderData) {
        this._sceneData = value;
        this._nativeObj.setSceneData(value ? value._nativeObj : null);
    }
    private _sceneModuleData: RTSceneNodeData;
    public get sceneModuleData(): RTSceneNodeData {
        return this._sceneModuleData;
    }
    public set sceneModuleData(value: RTSceneNodeData) {
        this._sceneModuleData = value;
        this._nativeObj.setSceneNodeData(value ? value._nativeObj : null);
    }
    private _cameraModuleData: RTCameraNodeData;
    public get cameraModuleData(): RTCameraNodeData {
        return this._cameraModuleData;
    }
    public set cameraModuleData(value: RTCameraNodeData) {
        this._cameraModuleData = value;
        this._nativeObj.setCameraNodeData(value ? value._nativeObj : null);
    }
    private _cameraData: GLESShaderData;
    public get cameraData(): GLESShaderData {
        return this._cameraData;
    }
    public set cameraData(value: GLESShaderData) {
        this._cameraData = value;
        this._nativeObj.setCameraData(value ? value._nativeObj : null);
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
        this._nativeObj = new (window as any).conchGLESRenderContext3D();
        this._nativeObj.setGlobalConfigShaderData((Shader3D._configDefineValues as any)._nativeObj);
        this.cameraUpdateMask = 0;
    }
    setRenderTarget(value: GLESInternalRT, clearFlag: RenderClearFlag): void {
        this._nativeObj.setRenderTarget(value ? value._nativeObj : null, clearFlag);
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
    private _tempList: any = [];
    drawRenderElementList(list: FastSinglelist<GLESRenderElement3D>): number {
        this._tempList.length = 0;
        let listelement = list.elements;
        listelement.forEach((element) => {
            this._tempList.push(element._nativeObj);
        });
        return this._nativeObj.drawRenderElementList(this._tempList, list.length);
    }
    drawRenderElementOne(node: IRenderElement3D): number {
        return this._nativeObj.drawRenderElementOne((node as any)._nativeObj);
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