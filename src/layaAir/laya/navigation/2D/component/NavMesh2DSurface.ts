import { Sprite } from "../../../display/Sprite";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { BaseNavMeshSurface } from "../../common/component/BaseNavMeshSurface";
import { RecastConfig } from "../../common/RecastConfig";
import { Navigation2DManage } from "../Navigation2DManage";
import { NavMesh2D } from "../NavMesh2D";
import { NavMesh2DLink } from "../NavMesh2DLink";
import { NavMesh2DModifierVolume } from "../NavMesh2DModifierVolume";
import { NavMesh2DObstacles } from "../NavMesh2DObstacles";

/**
 * <code>NavMesh2DSurface</code> 类用于创建2D导航网格。
 */
export class NavMesh2DSurface extends BaseNavMeshSurface {

    /**
     * @internal
     */
    protected _navMeshVolumes: NavMesh2DModifierVolume[] = [];

    /**
     * @internal
     */
    protected _navMeshObstacles: NavMesh2DObstacles[] = [];

    /**
     * @internal
     */
    protected _navMeshLink: NavMesh2DLink[] = [];

    protected _transfrom: Matrix4x4 = new Matrix4x4();

    /**
     * @internal
     */
    set volumes(value: NavMesh2DModifierVolume[]) {
        if(this._navMeshVolumes.length > 0){
            this._navMeshVolumes.forEach((volume) => {
                volume.destroy();
            });
        }
        this._navMeshVolumes = value;
        if(this._navMesh){
            this._navMeshVolumes.forEach((volume) => {
                volume.bindSurface(this);
            });
        }
    }

    get volumes(): NavMesh2DModifierVolume[] {
        return this._navMeshVolumes;
    }

    /**
     * @internal
     */
    set obstacles(value: NavMesh2DObstacles[]) {
        if(this._navMeshObstacles.length > 0){
            this._navMeshObstacles.forEach((obstacle) => {
                obstacle.destroy();
            });
        }
        this._navMeshObstacles = value;
        if(this._navMesh){
            value.forEach((obstacle) => {
                obstacle.bindSurface(this);
            });
        }
    }

    get obstacles(): NavMesh2DObstacles[] {
        return this._navMeshObstacles;
    }


    public set navMeshLink(value: NavMesh2DLink[]) {
        if(this._navMeshLink.length > 0){
            this._navMeshLink.forEach((link) => {
                link.destroy();
            });
        }
        this._navMeshLink = value;
        if(this._navMesh){
            value.forEach((link) => {
                link.bindSurface(this);
            });
        }
    }


    public get navMeshLink(): NavMesh2DLink[] {
        return this._navMeshLink;
    }



    get navMesh(): NavMesh2D {
        return this._navMesh as NavMesh2D;
    }

    /**
     * <code>实例化一个寻路功能<code>
     */
    constructor() {
        super();
    }

    /**@internal */
    _getManager(): Navigation2DManage {
       return Navigation2DManage.getNavManager(this);
    }

    onAwake(): void {
        super.onAwake();
        (<Sprite>this.owner).cacheGlobal = true;
        this._navMeshVolumes.forEach((volume) => {
            volume.bindSurface(this);
        });
        this._navMeshObstacles.forEach((obstacle) => {
            obstacle.bindSurface(this);
        });

        this._navMeshLink.forEach((link) => {
            link.bindSurface(this);
        });
    }
    /**
     * @override
     */
    protected _crateNavMesh(config: RecastConfig, min: Vector3, max: Vector3): NavMesh2D {
      return new NavMesh2D(config,min,max,this);
    }
    
}