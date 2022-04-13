import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { GeometryElement } from "../core/GeometryElement";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { SubMesh } from "../resource/models/SubMesh";

export class MeshInstanceGeometry extends GeometryElement {
    private _subMesh:SubMesh;
    constructor(subMesh: SubMesh) {
        super(MeshTopology.Triangles, DrawType.DrawElemientInstance);
        this._subMesh = subMesh;
        this.indexFormat = subMesh._mesh.indexFormat;
    }

    /**
     * @internal
     * UpdateGeometry Data
     */
    _updateRenderParams(state: RenderContext3D): void {
        this.clearRenderParams();
		this.setDrawElemenParams(this._subMesh.indexCount, this._subMesh._indexStart * 2);
    }

}