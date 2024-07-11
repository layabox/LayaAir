import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { GeometryElement } from "../core/GeometryElement";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { SubMesh } from "../resource/models/SubMesh";

/**
 * @internal
 */
export class MeshInstanceGeometry extends GeometryElement {
    private _subMesh: SubMesh;
    constructor(subMesh: SubMesh) {
        super(subMesh ? subMesh._geometryElementOBj.mode : MeshTopology.Triangles, DrawType.DrawElementInstance);
        this._subMesh = subMesh;
        if (subMesh)
            this.indexFormat = subMesh._mesh.indexFormat;
    }

    set subMesh(value: SubMesh) {
        this._subMesh = value;
        if (value)
            this.indexFormat = value._mesh.indexFormat;
        this.mode = value._geometryElementOBj.mode;
    }

    get subMesh(): SubMesh {
        return this._subMesh
    }

    /**
     * @internal
     * UpdateGeometry Data
     */
    _updateRenderParams(state: RenderContext3D): void {
        this.clearRenderParams();
        let byteCount: number;
        switch (this.indexFormat) {
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
		this.setDrawElemenParams(this._subMesh.indexCount, this._subMesh._indexStart * byteCount);
    }

}