import { NodeFlags } from "../../../Const";
import { Sprite } from "../../../display/Sprite";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { BaseNavMeshSurface } from "../../common/component/BaseNavMeshSurface";
import { RecastConfig } from "../../common/RecastConfig";
import { Navigation2DManage } from "../Navigation2DManage";
import { NavMesh2D } from "../NavMesh2D";
import { NavMesh2DLink } from "../NavMesh2DLink";
import { NavMesh2DModifierArea } from "../NavMesh2DModifierArea";
import { NavMesh2DObstacles } from "../NavMesh2DObstacles";

/**
 * @en NavMesh2DSurface is a 2D component that modifies the navigation mesh surface.
 * @zh NavMesh2DSurface 是一个修改2D导航网格表面的组件。
 */
export class NavMesh2DSurface extends BaseNavMeshSurface {

    protected _navMeshAreas: NavMesh2DModifierArea[] = [];
    protected _navMeshObstacles: NavMesh2DObstacles[] = [];
    protected _navMeshLink: NavMesh2DLink[] = [];
    protected _transfrom: Matrix4x4 = new Matrix4x4();

    declare owner: Sprite;

    /**
     * @en Modified areas of the navigation mesh surface.
     * @zh 导航网格表面的修改区域。
     */
    public get areas(): NavMesh2DModifierArea[] {
        return this._navMeshAreas;
    }
    public set areas(value: NavMesh2DModifierArea[]) {
        if (this._navMeshAreas.length > 0) {
            this._navMeshAreas.forEach((area) => {
                area._destroy();
            });
        }
        this._navMeshAreas = value;
        if (this._navMesh) {
            this._navMeshAreas.forEach((area) => {
                area._bindSurface(this);
            });
        }
    }


    /**
     * @en The obstacles that modify the surface of the navigation mesh.
     * @zh 导航网格表面的障碍物。
     */
    public get obstacles(): NavMesh2DObstacles[] {
        return this._navMeshObstacles;
    }
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

    /**
     * @en Links on the navigation mesh surface.
     * @zh 导航网格表面的链接。
     */
    public get navMeshLink(): NavMesh2DLink[] {
        return this._navMeshLink;
    }

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


    /**
     * <code>实例化一个寻路功能<code>
     * @ignore
     */
    constructor() {
        super();
    }

    /**
     * @ignore
     */
    onAwake(): void {
        super.onAwake();
        this.owner.globalTrans.cache = true;
        this._navMeshAreas.forEach((area) => {
            area._bindSurface(this);
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

    protected _crateNavMesh(config: RecastConfig, min: Vector3, max: Vector3): NavMesh2D {
        return new NavMesh2D(config, min, max, this);
    }

}