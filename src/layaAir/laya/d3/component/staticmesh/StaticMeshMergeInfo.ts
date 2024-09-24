import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { MeshRenderer } from "../../core/MeshRenderer";
import { Sprite3D } from "../../core/Sprite3D";

/**
 * @en StaticMeshMergeInfo class represents information for merging static meshes.
 * @zh StaticMeshMergeInfo 类表示用于合并静态网格的信息。
 */
export class StaticMeshMergeInfo {

    /**
     * @en Creates a new StaticMeshMergeInfo instance from a MeshRenderer.
     * @param render The MeshRenderer to create the merge info from.
     * @returns A new StaticMeshMergeInfo instance.
     * @zh 从 MeshRenderer 创建新的 StaticMeshMergeInfo 实例。
     * @param render 用于创建合并信息的 MeshRenderer。
     * @returns 新的 StaticMeshMergeInfo 实例。
     */
    static create(render: MeshRenderer) {

        let mesh = render.getMesh();
        // let owner = <Sprite3D>render.owner;

        let info = new StaticMeshMergeInfo();
        info.lightmapIndex = render.lightmapIndex;
        info.receiveShadow = render.receiveShadow;
        info.vertexDec = mesh ? mesh.getVertexDeclaration() : null;
        // info.invertFrontFace = owner ? owner.transform._isFrontFaceInvert : false;
        return info;
    }

    /**
     * @en Indicates whether the object receives shadows.
     * @zh 表示对象是否接收阴影。
     */
    receiveShadow: boolean;

    /**
     * @en The index of the lightmap used by this object.
     * @zh 此对象使用的光照贴图索引。
     */
    lightmapIndex: number;

    /**
     * @en The vertex declaration describing the structure of vertex data.
     * @zh 描述顶点数据结构的顶点声明。
     */
    vertexDec: VertexDeclaration;

    private _renders: MeshRenderer[];
    /**
     * @en The array of MeshRenderer components attached to this object.
     * @zh 附加到此对象的 MeshRenderer 组件数组。
     */
    public get renders(): MeshRenderer[] {
        return this._renders;
    }
    /**
     * @en The total number of vertices in this batch.
     * @zh 此批次中的顶点总数。
     */
    vertexCount: number;
    /**
     * @en The total number of indices in this batch.
     * @zh 此批次中的索引总数。
     */
    indexCount: number;

    private constructor() {
        this._renders = [];
        this.vertexCount = 0;
        this.indexCount = 0;
    }

    /**
     * @en Checks if a MeshRenderer matches the criteria for this batch.
     * @param render The MeshRenderer to check.
     * @returns True if the renderer matches, false otherwise.
     * @zh 检查 MeshRenderer 是否符合此批次的条件。
     * @param render 要检查的 MeshRenderer。
     * @returns 如果渲染器匹配则返回 true，否则返回 false。
     */
    match(render: MeshRenderer): boolean {

        let mesh = render.getMesh();
        let owner = <Sprite3D>render.owner;

        let match = true;

        match = match && this.lightmapIndex == render.lightmapIndex;
        match = match && this.receiveShadow == render.receiveShadow;
        match = match && this.vertexDec == mesh.getVertexDeclaration();
        // match = match && this.invertFrontFace == owner.transform._isFrontFaceInvert;
        return match;
    }

    /**
     * @en Adds a MeshRenderer to this batch.
     * @param render The MeshRenderer to add.
     * @zh 将 MeshRenderer 添加到此批次。
     * @param render 要添加的 MeshRenderer。
     */
    addElement(render: MeshRenderer) {
        this.renders.push(render);
        let mesh = render.getMesh();
        this.vertexCount += mesh.vertexCount;
        this.indexCount += mesh.indexCount;
    }

    /**
     * @en Destroys this batch and releases its resources.
     * @zh 销毁此批次并释放其资源。
     */
    destroy() {
        this._renders = null;
    }
}