import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RTTransform3D } from "../../RenderModuleData/RuntimeModuleData/3D/RTTransform3D";
import { RTBaseRenderNode } from "../../RenderModuleData/RuntimeModuleData/3D/RTBaseRenderNode";
import { RTDefineDatas } from "../../RenderModuleData/RuntimeModuleData/RTDefineDatas";
import { RTShaderPass } from "../../RenderModuleData/RuntimeModuleData/RTShaderPass";
import { RTSubShader } from "../../RenderModuleData/RuntimeModuleData/RTSubShader";
import { GLESRenderGeometryElement } from "../RenderDevice/GLESRenderGeometryElement";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";
import { NativeMemory } from "../../RenderModuleData/RuntimeModuleData/NativeMemory";

export enum RenderElementType {
    Base = 0,
    Skin = 1,
    Instance = 2,
}

/** @internal conchGLESRenderElement3D 共享块槽位（与 C++ GLESRenderElement3D::Props 一致）。 */
const enum GLESRenderElement3DSlot {
    isRender = 0,
    canDynamicBatch = 1,
    materialRenderQueue = 2,
    materialId = 3,
    Count = 4,
}
export class GLESRenderElement3D implements IRenderElement3D {

    private _geometry: GLESRenderGeometryElement;

    private _materialShaderData: GLESShaderData;

    private _renderShaderData: GLESShaderData;

    private _transform: RTTransform3D;

    set geometry(data: GLESRenderGeometryElement) {
        this._geometry = data;
        this._nativeObj.setGeometry(data ? (data as any)._nativeObj : null);
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

    set transform(data: RTTransform3D) {
        this._transform = data;
        this._nativeObj.setTransform((data as any)._nativeObj);
    }

    get transform(): RTTransform3D {
        return this._transform;
    }

    get isRender(): boolean {
        return this._i32[GLESRenderElement3DSlot.isRender] !== 0;
    }

    set isRender(data: boolean) {
        this._i32[GLESRenderElement3DSlot.isRender] = data ? 1 : 0;
    }
    public get materialRenderQueue(): number {
        return this._u32[GLESRenderElement3DSlot.materialRenderQueue];
    }
    public set materialRenderQueue(value: number) {
        this._u32[GLESRenderElement3DSlot.materialRenderQueue] = value;
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
        if (value) this._nativeObj.setSubShader((value.moduleData as any as RTSubShader)._nativeObj);
    }

    get canDynamicBatch(): boolean {
        return this._i32[GLESRenderElement3DSlot.canDynamicBatch] !== 0;
    }
    set canDynamicBatch(value: boolean) {
        this._i32[GLESRenderElement3DSlot.canDynamicBatch] = value ? 1 : 0;
    }

    // todo
    public get materialId(): number {
        return this._u32[GLESRenderElement3DSlot.materialId];
    }
    public set materialId(value: number) {
        this._u32[GLESRenderElement3DSlot.materialId] = value;
    }

    _nativeObj: any;
    private _mem: NativeMemory;
    private _i32: Int32Array;
    private _u32: Uint32Array;

    constructor() {
        this.init();
        // init() (overridden by GLESSkinRenderElement3D) created _nativeObj; bind the 4-slot block.
        this._mem = new NativeMemory(GLESRenderElement3DSlot.Count * 4, false);
        this._i32 = this._mem.int32Array;
        this._u32 = this._mem.Uint32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
        (window as any).conchGLESRenderElement3D.setCompileDefine((RTShaderPass.getGlobalCompileDefine() as any)._nativeObj);
    }

    destroy(): void {
        this._geometry = null;
        this._materialShaderData = null;
        this._renderShaderData = null;
        this._transform = null;
        this._nativeObj?.destroy();

    }

    protected init(): void {
        this._nativeObj = new (window as any).conchGLESRenderElement3D();
    }
}