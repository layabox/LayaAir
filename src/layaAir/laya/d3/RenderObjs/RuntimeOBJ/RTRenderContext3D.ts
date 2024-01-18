import { InternalRenderTarget } from "../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { ShaderData } from "../../../RenderEngine/RenderInterface/ShaderData";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { ISceneNodeData, ICameraNodeData } from "../../RenderDriverLayer/RenderModuleData/IModuleData";
import { Viewport } from "../../math/Viewport";

export class RTRendercontext3D implements IRenderContext3D {
    private _globalShaderData: ShaderData;
    public get globalShaderData(): ShaderData {
        return this._globalShaderData;
    }
    public set globalShaderData(value: ShaderData) {
        this._globalShaderData = value;
    }
    private _sceneData: ShaderData;
    public get sceneData(): ShaderData {
        return this._sceneData;
    }
    public set sceneData(value: ShaderData) {
        this._sceneData = value;
    }
    private _sceneModuleData: ISceneNodeData;
    public get sceneModuleData(): ISceneNodeData {
        return this._sceneModuleData;
    }
    public set sceneModuleData(value: ISceneNodeData) {
        this._sceneModuleData = value;
    }
    private _cameraModuleData: ICameraNodeData;
    public get cameraModuleData(): ICameraNodeData {
        return this._cameraModuleData;
    }
    public set cameraModuleData(value: ICameraNodeData) {
        this._cameraModuleData = value;
    }
    private _cameraData: ShaderData;
    public get cameraData(): ShaderData {
        return this._cameraData;
    }
    public set cameraData(value: ShaderData) {
        this._cameraData = value;
    }
    private _sceneUpdataMask: number;
    public get sceneUpdataMask(): number {
        return this._sceneUpdataMask;
    }
    public set sceneUpdataMask(value: number) {
        this._sceneUpdataMask = value;
    }
    private _cameraUpdateMask: number;
    public get cameraUpdateMask(): number {
        return this._cameraUpdateMask;
    }
    public set cameraUpdateMask(value: number) {
        this._cameraUpdateMask = value;
    }
    private _pipelineMode: string;
    public get pipelineMode(): string {
        return this._pipelineMode;
    }
    public set pipelineMode(value: string) {
        this._pipelineMode = value;
    }
    private _invertY: boolean;
    public get invertY(): boolean {
        return this._invertY;
    }
    public set invertY(value: boolean) {
        this._invertY = value;
    }
    setRenderTarget(value: InternalRenderTarget): void {
        throw new Error("Method not implemented.");
    }
    setViewPort(value: Viewport): void {
        throw new Error("Method not implemented.");
    }
    setScissor(value: Vector4): void {
        throw new Error("Method not implemented.");
    }
    setClearData(clearFlag: number, clolor: Color, depth: number, stencil: number): number {
        throw new Error("Method not implemented.");
    }
    drawRenderElementList(list: SingletonList<IRenderElement>): number {
        throw new Error("Method not implemented.");
    }
    drawRenderElementOne(node: IRenderElement): number {
        throw new Error("Method not implemented.");
    }

    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTRenderContext3D();
    }

}