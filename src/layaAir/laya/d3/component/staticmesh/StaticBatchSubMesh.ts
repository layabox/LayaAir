import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { GeometryElement } from "../../core/GeometryElement";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { Bounds } from "../../math/Bounds";
import { Vector3 } from "../../math/Vector3";



export class StaticBatchSubInfo {

    indexStart: number;
    indexCount: number;

    meshBounds: Bounds;

    needRender: boolean;

    constructor() {
        this.indexStart = 0;
        this.indexCount = 0;
        this.meshBounds = new Bounds(new Vector3(), new Vector3());
        this.needRender = false;
    }

}

export class StaticBatchSubMesh extends GeometryElement {

    /**@internal */
    private static _type: number = GeometryElement._typeCounter++;

    subInfos: StaticBatchSubInfo[];

    indexByteCount: number;

    constructor() {
        super(MeshTopology.Triangles, DrawType.DrawElement);
        this.subInfos = [];
    }

    addSubMesh(indexCount: number, indexStart: number, bounds: Bounds) {

        let info = new StaticBatchSubInfo();
        info.indexCount = indexCount;
        info.indexStart = indexStart;
        bounds.cloneTo(info.meshBounds);

        this.subInfos.push(info);
    }

    _getType(): number {
        return StaticBatchSubMesh._type;
    }

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

    _prepareRender(state: RenderContext3D): boolean {
        return !!this.subInfos.find(info => info.needRender);
    }

    _render(state: RenderContext3D): void {
        super._render(state);
    }

    destroy() {
        for (const info of this.subInfos) {
        }
        this.subInfos = null;
    }
}