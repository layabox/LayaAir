import { Vector3 } from "../../maths/Vector3";
import { Mesh2D } from "../../resource/Mesh2D";
import { BaseNavMesh } from "../common/BaseNavMesh";
import { NavTileCache } from "../common/NavTileData";
import { RecastConfig } from "../common/RecastConfig";
import { NavMesh2DSurface } from "./component/NavMesh2DSurface";
import { Navgiation2DUtils } from "./Navgiation2DUtils";

export class NavMesh2D extends BaseNavMesh {
    /**@internal */
    protected _debugMesh: Mesh2D;

    constructor(config: RecastConfig, min:Vector3,max:Vector3, surface:NavMesh2DSurface) {
        super(config,min,max,surface,false);
        this._titileConfig._setMaxEdgeLen(1000);
    }

    /**
     * @internal
     * @param cache 
     * @param binds 
     * @param partitionType 
     */
    _addTile(cache:NavTileCache, binds: any[], partitionType: number,maxSimplificationError:number){
        const config = this._grid.config;
        config.cellHeight = 0.1;
        config.agentHeight = 0.3;
        config.agentMaxSlope = 45;
        config.agentMaxClimb = 0.3;
        super._addTile(cache,binds,partitionType,maxSimplificationError);
        if (this._debugMesh) {
            Navgiation2DUtils._createDebugMesh(this, this._debugMesh,true);
        }
    }

    /**
    * get Mesh
    * 
    */
    buildDebugMesh() {
        if(this._debugMesh == null){
            this._debugMesh = Navgiation2DUtils._createDebugMesh(this, this._debugMesh,true);
        }
        return this._debugMesh;
    }
    
}