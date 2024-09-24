import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { GeometryElement } from "../../core/GeometryElement";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { Mesh } from "../../resource/models/Mesh";
import { HLODBatchSubMesh } from "./HLODUtil";

/**
 * @en a batched mesh for hierarchical level of detail (HLOD) in 3D rendering. This class optimizes rendering performance by combining multiple sub-meshes into a single rendering unit, reducing draw calls.
 * @zh 用于层次化细节级别（HLOD）的批处理网格。该类通过合并多个子网格为单一的渲染单元来优化渲染性能，减少绘制调用。
 */
export class HLODBatchMesh extends GeometryElement {
    /**@internal batchMesh */
    private _mesh: Mesh;
    /**@internal */
    private _batchSubMeshInfos: HLODBatchSubMesh[];

    /**@internal */
    private _drawSubMeshs: HLODBatchSubMesh[];
    /**
     * @en construct method of HLODBatchMesh.
     * @zh HLODBatchMesh的构造方法。
     */
    constructor() {
        super(MeshTopology.Triangles, DrawType.DrawElement);
    }

    /**
     * @en The batched mesh.
     * @zh 合批后的网格。
     */
    get batchMesh() {
        return this._mesh;
    }
    set batchMesh(mesh: Mesh) {
        if (this._mesh != mesh) {
            this._mesh && (this._mesh._removeReference());
            this.indexFormat = mesh.indexFormat;
            this._mesh = mesh;
            this._mesh._addReference();
        }
    }


    /**
     * @en The batch sub-mesh information.
     * @zh 合批子网格信息。
     */
    get batchSubMeshInfo() {
        return this._batchSubMeshInfos;
    }

    set batchSubMeshInfo(value: HLODBatchSubMesh[]) {
        this._batchSubMeshInfos = value;
    }


    /**
     * @internal
     * @en The draw sub-meshes.
     * @zh 绘制的子网格。
     */
    get drawSubMeshs(): HLODBatchSubMesh[] {
        return this._drawSubMeshs;
    }

    set drawSubMeshs(value: HLODBatchSubMesh[]) {
        this._drawSubMeshs = value;
    }


    /**
     * @internal
     * @override
     */
    _prepareRender(state: RenderContext3D): boolean {
        this._mesh._uploadVerticesData();
        return true;
    }

    /**
     * @internal
     * @override
     */
    _updateRenderParams(state: RenderContext3D): void {
        var mesh: Mesh = this._mesh;
        var byteCount: number;
        switch (mesh.indexFormat) {
            case IndexFormat.UInt32:
                byteCount = 4;
                break;
            case IndexFormat.UInt16:
                byteCount = 2;
                break;
            case IndexFormat.UInt8:
                byteCount = 1;
                break;
        }
        this.clearRenderParams();
        this.bufferState = mesh._bufferState;
        if (this._drawSubMeshs) {
            this._drawSubMeshs.forEach(element => {
                this.setDrawElemenParams(element.drawPramas.y, element.drawPramas.x * byteCount);
            });
        }
    }

    /**
     * @en Destroy the HLODBatchMesh.
     * @zh 销毁 HLODBatchMesh。
     */
    destroy(): void {
        this._mesh && this._mesh._removeReference();
        delete this._batchSubMeshInfos;
        delete this._drawSubMeshs;
    }


}