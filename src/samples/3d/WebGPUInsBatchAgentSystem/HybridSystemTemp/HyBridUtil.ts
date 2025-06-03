import { Bounds } from "laya/d3/math/Bounds";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { IBufferState } from "laya/RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IRenderGeometryElement } from "laya/RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";

export enum QXRenderMask {
    Normal = 1,
    CastShadow = 2,
    ReceiveShadow = 4
}

export class QXRenderGeometrtElement {//对应subMesh架构
    indexCount: number;
    indexFormat: number;
    indexOffset: number;
    bufferState: IBufferState;
}

export class BatchElement {//对应一个渲染批次
    subMeshIdx: number;
    matIdx: number;
}

export class IQXMaterialData {//对应一个Material
    id: number;
    shaderData: ShaderData;
    subShader: SubShader;
    renderQueue: number;
    cull: number;
}

export interface batchIDInfo {
    res: PerResData,
    islower: QXLodLevel,
    elementIndex: number,
    isReceiveShadow: boolean
    lightmapIndex: number,
    flipped: boolean
}
export class PerResData {//对应一个Ins对应的渲染资源
    static _countPtr: number = 0;
    static _resDataMap: Map<number, PerResData> = new Map();
    static _batchIDMap: Map<number, batchIDInfo> = new Map();
    static getResDataById(id: number) {
        return this._resDataMap.get(id);
    }
    constructor() {
        this.id = PerResData._countPtr++;
        PerResData._resDataMap.set(this.id, this);
    }
    id: number;
    isDirty: boolean = false;
    materials: IQXMaterialData[] = [];
    batchElements: BatchElement[] = [];
    mesh: QXRenderGeometrtElement[] = [];
    meshid: number;
    haslowerMat: boolean;
    lowermat: IQXMaterialData;
    lowerMeshId: number;
    lowerMeshGeometry: QXRenderGeometrtElement;
}

var meshMap: Map<number, IRenderGeometryElement> = new Map();

export class IQXBVHCell {//一个渲染节点
    static _countPtr: number = 0;
    static _InsDataMap: Map<number, IQXBVHCell> = new Map();
    static getInsDataById(id: number) {
        return this._InsDataMap.get(id);
    }
    constructor() {
        this.id = IQXBVHCell._countPtr++;
        IQXBVHCell._InsDataMap.set(this.id, this);
    }
    id: number;
    worldMatrix: Matrix4x4;
    resId: number;
    bounds: Bounds;
    hasLower: boolean;
    renderMask: number;
    flipped: boolean;
    lightmapIndex: number;
    customData: Record<string, any> = {};
    customDataArray: Float32Array;
}

export enum QXLodLevel {//渲染节点的lod等级
    High = 0,
    Lower = 1
}

export enum CullingMode {//裁剪模式
    Forward,
    ShadowDir,
    ShadowSpot
}



//模拟各种资源生成和流程测试
export class hybridSystemUtil {

}
