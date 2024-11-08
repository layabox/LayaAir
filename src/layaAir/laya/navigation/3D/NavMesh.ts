import { Mesh } from "../../d3/resource/models/Mesh";
import { Vector3 } from "../../maths/Vector3";
import { BaseNavMesh } from "../common/BaseNavMesh";
import { NavTileCache } from "../common/NavTileData";
import { RecastConfig } from "../common/RecastConfig";
import { NavMeshSurface } from "./component/NavMeshSurface";
import { Navgiation3DUtils } from "./Navgiation3DUtils";

/**<code>NavMesh</code> 3D导航网格*/
export class NavMesh extends BaseNavMesh {
    /**@internal */
    protected _debugMesh: Mesh;

    /**
    * 创建一个 NavMesh 实例
    */
    constructor(config: RecastConfig, min: Vector3, max: Vector3, surface: NavMeshSurface) {
        super(config, min, max, surface,true);
        this._titileConfig._setMaxEdgeLen(12 / config.cellSize);
        this._titileConfig.maxSimplificationError = 0.9;
    }

    /**
     * @param cache 
     * @param binds 
     * @param partitionType 
     */
    _addTile(cache: NavTileCache, binds: any[], partitionType: number, maxSimplificationError: number) {
        super._addTile(cache, binds, partitionType, maxSimplificationError);
        if (this._debugMesh) {
            Navgiation3DUtils._createDebugMesh(this, this._debugMesh);
        }
    }

    /**
     * get Mesh
     * 
     */
    buildDebugMesh() {
        this._debugMesh = Navgiation3DUtils._createDebugMesh(this, null);
        return this._debugMesh;
    }


}