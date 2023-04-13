import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { GeometryElement } from "../../core/GeometryElement";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { Mesh } from "../../resource/models/Mesh";
import { HLODBatchSubMesh } from "./HLODUtil";


export class HLODBatchMesh extends GeometryElement {
    /**@internal batchMesh */
    private _mesh: Mesh;
    /**@internal */
    private _batchSubMeshInfos: HLODBatchSubMesh[];

    /**@internal */
    private _drawSubMeshs: HLODBatchSubMesh[];
    /**
     * instance HLODBatchMesh
     */
    constructor() {
        super(MeshTopology.Triangles, DrawType.DrawElement);
    }

    /**
     * 合批后的mesh
     * @param mesh 
     * @param bounds 
     */
    set batchMesh(mesh: Mesh) {
        if (this._mesh != mesh) {
            this._mesh && (this._mesh._removeReference());
            this.indexFormat = mesh.indexFormat;
            this._mesh = mesh;
            this._mesh._addReference();
        }
    }

    get batchMesh() {
        return this._mesh;
    }

    /**
     * 合批子mesh信息
     */
    set batchSubMeshInfo(value: HLODBatchSubMesh[]) {
        this._batchSubMeshInfos = value;
    }

    get batchSubMeshInfo() {
        return this._batchSubMeshInfos;
    }

    /**
     * @internal
     * @param value 
     */
    set drawSubMeshs(value: HLODBatchSubMesh[]) {
        this._drawSubMeshs = value;
    }

    get drawSubMeshs(): HLODBatchSubMesh[] {
        return this._drawSubMeshs;
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
     * 销毁
     */
    destroy(): void {
        this._mesh && this._mesh._removeReference();
        delete this._batchSubMeshInfos;
        delete this._drawSubMeshs;
    }


}