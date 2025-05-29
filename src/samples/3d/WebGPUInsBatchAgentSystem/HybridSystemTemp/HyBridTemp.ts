import { Bounds } from "laya/d3/math/Bounds";
import { Matrix } from "laya/maths/Matrix";
import { IBufferState } from "laya/RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { ShaderData } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";

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

export class PerResData {//对应一个Ins对应的渲染资源
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

export class IQXBVHCell {//一个渲染节点
    worldMatrix: Matrix;
    resID: number;
    bounds: Bounds;
    hasLower: boolean;
    customData: Record<string, any> = {};
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
