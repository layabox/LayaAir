
import { Vector3 } from "../../../maths/Vector3";
import { BaseNavMeshSurface } from "../../common/component/BaseNavMeshSurface";
import { RecastConfig } from "../../common/RecastConfig";
import { NavigationManager } from "../NavigationManager";
import { NavMesh } from "../NavMesh";

/**
 * @en NavMeshSurface is a 3D component used to generate navigation mesh.
 * @zh NavMeshSurface 是一个用于3D生成导航网格的组件。
 */
export class NavMeshSurface extends BaseNavMeshSurface {

    get navMesh(): NavMesh {
        return this._navMesh as NavMesh;
    }

    /**
     * <code>实例化一个寻路功能<code>
     */
    constructor() {
        super();
    }

    /**
     * @overload
     * @internal
     */
    _getManager(): NavigationManager {
        return NavigationManager._getNavManager(this);
    }
    /**
     * @override
     */
    protected _crateNavMesh(config: RecastConfig, min: Vector3, max: Vector3): NavMesh {
        return new NavMesh(config,min,max,this);
    }
}