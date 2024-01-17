
import { Laya } from "../../../../Laya";
import { Vector3 } from "../../../maths/Vector3";
import { SingletonList } from "../../../utils/SingletonList";
import { Bounds } from "../../math/Bounds";
import { IElementComponentManager } from "../scene/IScenceComponentManager";
import { Scene3D } from "../scene/Scene3D";
import { AreaMask } from "./AreaMask";
import { NavMeshSurface } from "./Component/NavMeshSurface";
import { NavNavMeshLink } from "./Component/NavNavMeshLink";
import { NavObstacles } from "./Component/NavObstacles";
import { NavigationUtils } from "./NavigationUtils";
import { RecastConfig } from "./RecastConfig";

export class NavAreaFlag {
    index: number;
    cost: number;
    name: string;

    get flag(): number {
        return 1 << this.index;
    }
}

export class NavigationManager implements IElementComponentManager {

    /**@internal  */
    static managerName: string = "navMesh";
    /**@internal  */
    static readonly defaltAgentName: string = "humanoid";
    /**@internal  */
    static readonly defaltUnWalk: string = "unwalk";
    /**@internal  */
    static readonly defaltWalk: string = "walk";
    /**@internal  */
    static readonly defaltJump: string = "jump";

    /**@interanl */
    name: string;

    /**@internal */
    _navConfigMap: Map<string, RecastConfig> = new Map();

    /**@internal */
    _areaFlagMap: Map<string, NavAreaFlag> = new Map();

    /**@internal */
    _naveMeshMaps: Map<string, SingletonList<NavMeshSurface>> = new Map();

    /**@internal */
    _naveMeshLinkMaps: Map<string, Array<NavNavMeshLink>> = new Map();

    /**@internal */
    _deflatAllMask: AreaMask;


    /**
     * 初始化系统，由系统内部调用
     * @internal
     */
    static initialize(): Promise<void> {
        return (window as any).Recast().then((Recast: any) => {
            console.log("Recast loaded.");
            NavigationUtils.initialize(Recast);
            NavObstacles._init_();
            return Promise.resolve();
        });
    }

    /**
     * <code>实例化一个Navigation管理器<code>
     */
    constructor() {
        this.name = NavigationManager.managerName;
        this._deflatAllMask = new AreaMask();
        this._init();
    }

    /**
     * 初始化默认配置
     * @internal  
     * @param {*}
     * @return {*}
     */
    private _init() {
        let config = new RecastConfig();
        config.agentName = NavigationManager.defaltAgentName;
        this.regNavConfig(config);

        //unwalk
        let area = new NavAreaFlag()
        area.name = NavigationManager.defaltUnWalk;
        area.cost = 1;
        area.index = 0;
        this.regArea(area);

        //walk
        area = new NavAreaFlag()
        area.name = NavigationManager.defaltWalk;
        area.cost = 1;
        area.index = 1;
        this.regArea(area);

        //jump
        area = new NavAreaFlag()
        area.name = NavigationManager.defaltJump;
        area.cost = 1;
        area.index = 2;
        this.regArea(area);
        this._deflatAllMask._setAreaMap(this._areaFlagMap);
        this._deflatAllMask.flag = 3;
    }

    /**
     * @internal
     * @param data 
     */
    Init(data: any): void {
        if (!data) return;

        const agents = data.agents;
        if (agents) {
            for (var i = 0, n = agents.length; i < n; i++) {
                let config = new RecastConfig();
                config.agentName = agents[i].agentName;
                config.cellSize = agents[i].cellSize;
                config.cellHeight = agents[i].cellHeight;
                config.agentMaxSlope = agents[i].agentMaxSlope;
                config.agentHeight = agents[i].agentHeight;
                config.agentRadius = agents[i].agentRadius;
                config.agentMaxClimb = agents[i].agentMaxClimb;
                this.regNavConfig(config);
            }
        }

        const areas = data.areas;
        if (areas) {
            for (var i = 0, n = areas.length; i < n; i++) {
                let area = new NavAreaFlag();
                area.name = areas[i].name;
                area.index = areas[i].index;
                area.cost = areas[i].cost;
                this.regArea(area)
            }

            let flag = 0;
            this._areaFlagMap.forEach((value, key) => {
                flag = flag | value.flag;
            })
            this._deflatAllMask.flag = flag;
        }

    }

    /**
     * @internal
     */
    update(dt: number): void {
        let delta = Math.min(dt, 0.3);
        this._naveMeshMaps.forEach((lists) => {
            for (var i = 0, n = lists.length; i < n; i++) {
                lists.elements[i]._updata(delta);
            }
        })
    }

    /**
     * 注册导航网格的 agent 类型
     */
    regNavConfig(config: RecastConfig) {
        this._navConfigMap.set(config.agentName, config);
    }

    /**
     * 或者导航网格的agent 配置
     * @param type 
     * @returns 
     */
    getNavConfig(type: string): RecastConfig {
        return this._navConfigMap.get(type);
    }

    /**
     * 注册地形类型
     * @param type
     * @param cost 
     */
    regArea(area: NavAreaFlag) {
        this._areaFlagMap.set(area.name, area);
    }

    /**
     * 获取地形配置
     * @param type 
     * @returns 
     */
    getArea(type: string): NavAreaFlag {
        return this._areaFlagMap.get(type);
    }

    /**
    * get areaFlag Map
    * @param type 
    * @returns 
    */
    getAreaFlagMap(): Map<string, NavAreaFlag> {
        return this._areaFlagMap;
    }

    /**
     * 注册不同navMesh的NavNavMeshLink
     * @param start NavMeshSurface
     * @param end NavMeshSurface
     * @param link NavNavMeshLink
     */
    regNavMeshLink(start: NavMeshSurface, end: NavMeshSurface, link: NavNavMeshLink) {
        if (start == end) return;
        if (start.agentType != end.agentType) return;
        let key: string = this._getLinkIdByNavMeshSurfaces(start, end);
        if (!this._naveMeshLinkMaps.has(key)) {
            this._naveMeshLinkMaps.set(key, Array<NavNavMeshLink>());
        }
        this._naveMeshLinkMaps.get(key).push(link);
    }


    /**
     * 根据两个不同的navMesh查找直接是否存在NavMeshLink
      * @param from NavMeshSurface
     * @param to NavMeshSurface
     * @returns NavNavMeshLink[]
     */
    getNavMeshLink(from: NavMeshSurface, to: NavMeshSurface): NavNavMeshLink[] {
        let key: string = this._getLinkIdByNavMeshSurfaces(from, to);
        if (!this._naveMeshLinkMaps.has(key)) {
            return null;
        }
        return this._naveMeshLinkMaps.get(key);
    }

    /**
     * regist NavMeshSurface
     * @param nav
     */
    public regNavMeshSurface(nav: NavMeshSurface) {
        if (!nav) {
            console.error("cannot regist empyt NavMeshSurface.");
            return;
        }
        const agentType = nav.agentType;
        let surfaces: SingletonList<NavMeshSurface> = this._naveMeshMaps.get(agentType);
        if (surfaces == null) {
            surfaces = new SingletonList<NavMeshSurface>();
            this._naveMeshMaps.set(agentType, surfaces);
        }
        surfaces.add(nav);
    }

    /**
     * 通过空间位置获得对应的NavMeshSurface
     * @param pos  世界坐标位置
     * @param agentType  类型 
     * @returns NavMeshSurface
     */
    public getNavMeshSurface(pos: Vector3, agentType: string): NavMeshSurface {
        if (!this._naveMeshMaps.has(agentType)) return null;
        let surfaces = this._naveMeshMaps.get(agentType);
        for (var i = 0, n = surfaces.length; i < n; i++) {
            if (Bounds.containPoint(surfaces.elements[i].bounds, pos)) {
                return surfaces.elements[i];
            }
        }
        return null;
    }

    /**
     * 通过空间坐标获得所有的NavMeshSurface
     * @param pos  世界坐标位置
     *  @returns NavMeshSurface[]
     */
    public getNavMeshSurfaces(pos: Vector3): NavMeshSurface[] {
        var surfaces: NavMeshSurface[] = [];
        this._naveMeshMaps.forEach((datas) => {
            for (var i = 0, n = datas.length; i < n; i++) {
                if (Bounds.containPoint(datas.elements[i].bounds, pos)) {
                    surfaces.push(datas.elements[i]);
                }
            }
        })
        return surfaces;
    }


    /**
     * 获得key值
     * @internal
     * @param {*}
     * @return {*}
     */
    private _getLinkIdByNavMeshSurfaces(a: NavMeshSurface, b: NavMeshSurface): string {
        if (a.id < b.id) {
            return a.id + "_" + b.id;
        } else {
            return b.id + "_" + a.id;
        }
    }
}

//reg nav Component Manager
Scene3D.regManager(NavigationManager.managerName, NavigationManager);
//reg loader init
Laya.addBeforeInitCallback(NavigationManager.initialize);