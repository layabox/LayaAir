import { Transform3D } from "../../../d3/core/Transform3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXSubShader } from "../RenderModuleData/LayaXSubShader";

/**
 * LayaX render element for 3D.
 *
 * 每个实例持有 C++ _nativeObj（conchLayaXRenderElement），
 * 每个 setter 同步到 C++ → Rust FFI → Rust LYRenderElement3D。
 *
 * 不再用 POD packToBuffer，而是持久对象 handle 模式。
 */
export class LayaXRenderElement3D implements IRenderElement3D {

    /** C++ 原生对象（conchLayaXRenderElement） */
    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXRenderElement();
    }

    // --- geometry ---

    private _geometry: IRenderGeometryElement;

    get geometry(): IRenderGeometryElement { return this._geometry; }
    set geometry(data: IRenderGeometryElement) {
        this._geometry = data;
        if (this._nativeObj) {
            this._nativeObj.setGeometry(data ? (data as any)._nativeObj : null);
        }
    }

    // --- materialShaderData (Set3: material uniforms) ---

    private _materialShaderData: ShaderData;

    get materialShaderData(): ShaderData { return this._materialShaderData; }
    set materialShaderData(data: ShaderData) {
        this._materialShaderData = data;
        if (this._nativeObj) {
            this._nativeObj.setMaterialShaderData(data ? (data as any)._nativeObj : null);
        }
    }

    // --- renderShaderData (Set2: node uniforms, WorldMatrix etc.) ---

    private _renderShaderData: ShaderData;

    get renderShaderData(): ShaderData { return this._renderShaderData; }
    set renderShaderData(data: ShaderData) {
        this._renderShaderData = data;
        if (this._nativeObj) {
            this._nativeObj.setRenderShaderData(data ? (data as any)._nativeObj : null);
        }
    }

    // --- transform ---

    private _transform: Transform3D;

    get transform(): Transform3D { return this._transform; }
    set transform(data: Transform3D) {
        this._transform = data;
        if (this._nativeObj) {
            this._nativeObj.setTransform(data ? (data as any)._nativeObj : null);
        }
    }

    // --- isRender ---

    private _isRender: boolean = true;

    get isRender(): boolean { return this._isRender; }
    set isRender(data: boolean) {
        this._isRender = data;
        if (this._nativeObj) {
            this._nativeObj.setIsRender(data);
        }
    }

    // --- materialRenderQueue ---

    private _materialRenderQueue: number = 0;

    get materialRenderQueue(): number { return this._materialRenderQueue; }
    set materialRenderQueue(value: number) {
        this._materialRenderQueue = value;
        if (this._nativeObj) {
            this._nativeObj.setRenderQueue(value);
        }
    }

    // --- materialId ---

    private _materialId: number = 0;

    get materialId(): number { return this._materialId; }
    set materialId(value: number) { this._materialId = value; }

    // --- owner (RenderNode) ---

    private _owner: IBaseRenderNode;

    get owner(): IBaseRenderNode { return this._owner; }
    set owner(value: IBaseRenderNode) {
        this._owner = value;
        if (this._nativeObj) {
            this._nativeObj.setOwner(value ? (value as any)._nativeObj : null);
        }
    }

    // --- subShader ---

    private _subShader: SubShader;

    get subShader(): SubShader { return this._subShader; }
    set subShader(value: SubShader) {
        this._subShader = value;
        if (this._nativeObj && value) {
            // 传 SubShader handle 给 Rust，用于查找 ShaderPass 并触发编译回调
            
            this._nativeObj.setSubShader((value.moduleData as LayaXSubShader)._nativeObj);
        }
    }

    // --- canDynamicBatch ---

    private _canDynamicBatch: boolean = false;

    get canDynamicBatch(): boolean { return this._canDynamicBatch; }
    set canDynamicBatch(value: boolean) { this._canDynamicBatch = value; }

    // --- destroy ---

    destroy(): void {
        if (this._nativeObj) {
            this._nativeObj.destroy();
            this._nativeObj = null;
        }
        this._geometry = null;
        this._materialShaderData = null;
        this._renderShaderData = null;
        this._transform = null;
        this._owner = null;
        this._subShader = null;
    }
}
