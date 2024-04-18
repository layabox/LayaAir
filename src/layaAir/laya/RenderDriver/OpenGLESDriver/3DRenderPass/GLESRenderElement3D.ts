import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { NativeTransform3D } from "../../RenderModuleData/RuntimeModuleData/3D/NativeTransform3D";
import { RTSubShader } from "../../RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleData";
import { RTBaseRenderNode } from "../../RenderModuleData/RuntimeModuleData/3D/RTBaseRenderNode";
import { RTDefineDatas } from "../../RenderModuleData/RuntimeModuleData/RTDefineDatas";
import { GLESRenderGeometryElement } from "../RenderDevice/GLESRenderGeometryElement";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";

export enum RenderElementType {
    Base = 0,
    Skin = 1,
    Instance = 2,
}
export class GLESRenderElement3D implements IRenderElement3D {
    /** @internal */
    static _compileDefine: RTDefineDatas = null;
    static getCompileDefine(): RTDefineDatas {
        if (!GLESRenderElement3D._compileDefine) {
            GLESRenderElement3D._compileDefine = new RTDefineDatas();
        }
        return GLESRenderElement3D._compileDefine;
    }
    private _geometry: GLESRenderGeometryElement;

    private _materialShaderData: GLESShaderData;

    private _renderShaderData: GLESShaderData;

    private _transform: NativeTransform3D;

    set geometry(data: GLESRenderGeometryElement) {
        this._geometry = data;
        this._nativeObj.setGeometry((data as any)._nativeObj);
    }

    get geometry(): GLESRenderGeometryElement {
        return this._geometry;
    }

    set materialShaderData(data: GLESShaderData) {
        this._materialShaderData = data;
        this._nativeObj.setMaterialShaderData(data ? (data as any)._nativeObj : null);
    }

    get materialShaderData(): GLESShaderData {
        return this._materialShaderData;
    }

    set renderShaderData(data: GLESShaderData) {
        this._renderShaderData = data;
        this._nativeObj.setRenderShaderData(data ? (data as any)._nativeObj : null);
    }

    get renderShaderData(): GLESShaderData {
        return this._renderShaderData;
    }

    set transform(data: NativeTransform3D) {
        this._transform = data;
        this._nativeObj.setTransform((data as any)._nativeObj);
    }

    get transform(): NativeTransform3D {
        return this._transform;
    }

    get isRender(): boolean {
        return this._nativeObj.isRender;
    }

    set isRender(data: boolean) {
        this._nativeObj.isRender = data;
    }
    public get materialRenderQueue(): number {
        return this._nativeObj.materialRenderQueue;
    }
    public set materialRenderQueue(value: number) {
        this._nativeObj.materialRenderQueue = value;
    }

    private _owner: RTBaseRenderNode;
    public get owner(): RTBaseRenderNode {
        return this._owner;
    }
    public set owner(value: RTBaseRenderNode) {
        this._owner = value;
        this._nativeObj.setOwner(value._nativeObj);
    }

    private _subShader: SubShader;
    public get subShader(): SubShader {
        return this._subShader;
    }
    public set subShader(value: SubShader) {
        this._subShader = value;
        this._nativeObj.setSubShader((value.moduleData as any as RTSubShader)._nativeObj);
    }

    get canDynamicBatch(): boolean {
        return this._nativeObj.canDynamicBatch;
    }
    set canDynamicBatch(value: boolean) {
        this._nativeObj.canDynamicBatch = value;
    }

    // todo
    public get materialId(): number {
        return this._nativeObj.materialId;
    }
    public set materialId(value: number) {
        this._nativeObj.materialId = value;
    }

    _nativeObj: any;

    constructor() {
        this.init();
        (window as any).conchGLESRenderElement3D.setCompileDefine((GLESRenderElement3D.getCompileDefine() as any)._nativeObj)
    }

    destroy(): void {
        this._nativeObj.destroy();
        this.geometry = null;
        this.materialShaderData = null;
        this.renderShaderData = null;
        this.transform = null;
    }

    protected init(): void {
        this._nativeObj = new (window as any).conchGLESRenderElement3D();
    }
}