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
 * @en NavMesh2DSurface is a 2D component that modifies the navigation mesh surface.
 * @zh NavMesh2DSurface 是一个修改2D导航网格表面的组件。
 */
export class NavMesh2DSurface extends BaseNavMeshSurface {

    /** @internal */
    protected _navMeshVolumes: NavMesh2DModifierVolume[] = [];

    /** @internal */
    protected _navMeshObstacles: NavMesh2DObstacles[] = [];

    /** @internal */
    protected _navMeshLink: NavMesh2DLink[] = [];

    /** @internal */
    protected _transfrom: Matrix4x4 = new Matrix4x4();

    /**
     * @en The modifier volume that modifies the surface of the navigation mesh.
     * @zh 修改导航网格表面的修改体积。
     */
    public set volumes(value: NavMesh2DModifierVolume[]) {
        if (this._navMeshVolumes.length > 0) {
            this._navMeshVolumes.forEach((volume) => {
                volume._destroy();
            });
        }
        this._navMeshVolumes = value;
        if (this._navMesh) {
            this._navMeshVolumes.forEach((volume) => {
                volume._bindSurface(this);
            });
        }
    }

    public get volumes(): NavMesh2DModifierVolume[] {
        return this._navMeshVolumes;
    }

    /**
     * @en The obstacles that modify the surface of the navigation mesh.
     * @zh 修改导航网格表面的障碍物。
     */
    public set obstacles(value: NavMesh2DObstacles[]) {
        if (this._navMeshObstacles.length > 0) {
            this._navMeshObstacles.forEach((obstacle) => {
                obstacle._destroy();
            });
        }
        this._navMeshObstacles = value;
        if (this._navMesh) {
            value.forEach((obstacle) => {
                obstacle._bindSurface(this);
            });
        }
    }

    public get obstacles(): NavMesh2DObstacles[] {
        return this._navMeshObstacles;
    }

    /**
     * @en The links that modify the surface of the navigation mesh.
     * @zh 修改导航网格表面的链接。
     */
    public set navMeshLink(value: NavMesh2DLink[]) {
        if (this._navMeshLink.length > 0) {
            this._navMeshLink.forEach((link) => {
                link.destroy();
            });
        }
        this._navMeshLink = value;
        if (this._navMesh) {
            value.forEach((link) => {
                link._bindSurface(this);
            });
        }
    }


    public get navMeshLink(): NavMesh2DLink[] {
        return this._navMeshLink;
    }


    /**
     * <code>实例化一个寻路功能<code>
     */
    constructor() {
        super();
    }


    onAwake(): void {
        super.onAwake();
        (<Sprite>this.owner).cacheGlobal = true;
        this._navMeshVolumes.forEach((volume) => {
            volume._bindSurface(this);
        });
        this._navMeshObstacles.forEach((obstacle) => {
            obstacle._bindSurface(this);
        });

        this._navMeshLink.forEach((link) => {
            link._bindSurface(this);
        });
    }

    /**@internal */
    _getManager(): Navigation2DManage {
        return Navigation2DManage._getNavManager(this);
    }


    /**
     * @override
     */
    protected _crateNavMesh(config: RecastConfig, min: Vector3, max: Vector3): NavMesh2D {
        return new NavMesh2D(config, min, max, this);
    }

}