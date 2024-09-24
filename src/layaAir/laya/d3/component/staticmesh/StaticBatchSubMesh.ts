import { Vector3 } from "../../../maths/Vector3";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { GeometryElement } from "../../core/GeometryElement";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { Bounds } from "../../math/Bounds";

/**
 * @en represents information for a sub-batch in static batch rendering.
 * @zh 静态批处理渲染中子批次的信息。
 */
export class StaticBatchSubInfo {

    /**
     * @en The starting index of the sub-batch in the index buffer.
     * @zh 子批次在索引缓冲区中的起始索引。
     */
    indexStart: number;
    /**
     * @en The number of indices in the sub-batch.
     * @zh 子批次中的索引数量。
     */
    indexCount: number;
    /**
     * @en The bounding volume of the sub-batch mesh.
     * @zh 子批次网格的边界体积。
     */
    meshBounds: Bounds;
    /**
     * @en Indicates whether this sub-batch needs to be rendered.
     * @zh 指示是否需要渲染此子批次。
     */
    needRender: boolean;

    /**
     * @en Constructor method, initializes data.
     * @zh 构造方法，初始化数据
     */
    constructor() {
        this.indexStart = 0;
        this.indexCount = 0;
        this.meshBounds = new Bounds(new Vector3(), new Vector3());
        this.needRender = false;
    }

}

/**
 * @en static batch sub-mesh rendering.
 * @zh 用于静态批处理子网格渲染。
 */
export class StaticBatchSubMesh extends GeometryElement {

    /**@internal */
    private static _type: number = GeometryElement._typeCounter++;

    /**
     * @en Array of StaticBatchSubInfo objects representing sub-mesh information.
     * @zh StaticBatchSubInfo 对象数组，表示子网格信息。
     */
    subInfos: StaticBatchSubInfo[];

    /**
     * @en The byte count of indices in the sub-mesh.
     * @zh 子网格中索引的字节数。
     */
    indexByteCount: number;

    constructor() {
        super(MeshTopology.Triangles, DrawType.DrawElement);
        this.subInfos = [];
    }

    /**
     * @en Adds a sub-mesh to the StaticBatchSubMesh.
     * @param indexCount The number of indices in the sub-mesh.
     * @param indexStart The starting index of the sub-mesh.
     * @param bounds The bounding volume of the sub-mesh.
     * @zh 向 StaticBatchSubMesh 添加一个子网格。
     * @param indexCount 子网格中的索引数量。
     * @param indexStart 子网格的起始索引。
     * @param bounds 子网格的边界体积。
     */
    addSubMesh(indexCount: number, indexStart: number, bounds: Bounds) {

        let info = new StaticBatchSubInfo();
        info.indexCount = indexCount;
        info.indexStart = indexStart;
        bounds.cloneTo(info.meshBounds);

        this.subInfos.push(info);
    }

    /**
     * @en Gets the type of the StaticBatchSubMesh.
     * @zh 获取 StaticBatchSubMesh 的类型。
     */
    _getType(): number {
        return StaticBatchSubMesh._type;
    }
    /**
     * @en Updates render parameters based on the current render context.
     * @param state The current render context.
     * @zh 根据当前渲染上下文更新渲染参数。
     * @param state 当前渲染上下文。
     */
    _updateRenderParams(state: RenderContext3D): void {

        this.clearRenderParams();
        // todo
        let cameraPos = state.camera.transform.position;
        this.subInfos.sort((a, b) => {
            let centerA = a.meshBounds.getCenter();
            let distanceA = Vector3.distanceSquared(centerA, cameraPos);
            let centerB = b.meshBounds.getCenter();
            let distanceB = Vector3.distanceSquared(centerB, cameraPos);
            return distanceA - distanceB;
        });
        for (const info of this.subInfos) {
            if (info.needRender) {
                this.setDrawElemenParams(info.indexCount, info.indexStart * this.indexByteCount);
            }
        }

    }
    /**
     * @en Prepares the sub-mesh for rendering.
     * @param state The current render context.(Not used)
     * @returns True if any sub-info needs rendering, false otherwise.
     * @zh 准备子网格进行渲染。
     * @param state 当前渲染上下文。（未使用）
     * @returns 如果有任何子信息需要渲染则返回 true，否则返回 false。
     */
    _prepareRender(state: RenderContext3D): boolean {
        return !!this.subInfos.find(info => info.needRender);
    }
    
    /**
     * @en Destroys the StaticBatchSubMesh and its resources.
     * @zh 销毁 StaticBatchSubMesh 及其资源。
     */
    destroy() {
        for (const info of this.subInfos) {
        }
        this.subInfos = null;
    }
}