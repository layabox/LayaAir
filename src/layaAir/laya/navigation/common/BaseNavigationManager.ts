import { IElementComponentManager } from "../../d3/core/scene/IScenceComponentManager";
import { Vector3 } from "../../maths/Vector3";
import { SingletonList } from "../../utils/SingletonList";
import { AreaMask } from "./AreaMask";
import { NavigationUtils } from "./NavigationUtils";
import { RecastConfig } from "./RecastConfig";
import { NavAreaFlag, NavigationConfig } from "./NavigationConfig";
import { BaseNavMeshSurface } from "./component/BaseNavMeshSurface";
import { Node } from "../../display/Node";
import { NavMeshLinkData } from "./data/NavMeshLinkData";


/**
 * BaseNavigationManager 导航管理基类
 */
export class BaseNavigationManager implements IElementComponentManager {


    /**
     * 初始化系统，由系统内部调用
     * @internal
     */
    protected static _initialize(callback: () => void | Promise<void>): Promise<void> {
        if(NavigationUtils.getRecast()!=null){
            callback && callback();
            return Promise.resolve();
        }else{
            return (window as any).Recast().then((Recast: any) => {
                NavigationUtils.initialize(Recast);
                callback && callback();
                return Promise.resolve();
            });
        }
    }


    /**
    * find all 
    * @param surfaces 
    * @param sprite 
    */
    static findNavMeshSurface(surfaces: Array<BaseNavMeshSurface>, sprite: Node, agentFlags: string[]) {
        let array = sprite.getComponents(BaseNavMeshSurface) as BaseNavMeshSurface[];
        if (array && array.length > 0) {
            array.forEach(element => {
                (agentFlags.indexOf(element.agentType) >= 0) && surfaces.push(element);
            });
        }
        let parat = sprite.parent;
        if (parat && (parat instanceof Node)) {
            BaseNavigationManager.findNavMeshSurface(surfaces, parat, agentFlags);
        }
    }

    /**@internal */
    name: string;

    /**@internal */
    _navConfigMap: Map<string, RecastConfig> = new Map();

    /**@internal */
    _areaFlagMap: Map<string, NavAreaFlag> = new Map();

    /**@internal */
    _naveMeshMaps: Map<string, SingletonList<BaseNavMeshSurface>> = new Map();

    /**@internal */
    _naveMeshLinkMaps: Map<string, Array<NavMeshLinkData>> = new Map();

    /**@internal */
    _deflatAllMask: AreaMask;

    /**
     * <code>实例化一个Navigation管理器<code>
     */
    constructor(name: string) {
        this.name = name;
        this._deflatAllMask = new AreaMask();
        this._init();
    }

    /**
     * 初始化默认配置
     * @internal  
     * @param {*}
     * @return {*}
     */
    protected _init() {
        let config = new RecastConfig();
        config.agentName = NavigationConfig.defaltAgentName;
        this.regNavConfig(config);

        //unwalk
        let area = new NavAreaFlag()
        area.name = NavigationConfig.defaltUnWalk;
        area.cost = 1;
        area.index = 0;
        this.regArea(area);

        //walk
        area = new NavAreaFlag()
        area.name = NavigationConfig.defaltWalk;
        area.cost = 1;
        area.index = 1;
        this.regArea(area);

        //jump
        area = new NavAreaFlag()
        area.name = NavigationConfig.defaltJump;
        area.cost = 1;
        area.index = 2;
        this.regArea(area);
        this._deflatAllMask._setAreaMap(this._areaFlagMap);
        this._deflatAllMask.flag = 3;
    }

    /**
    * 获得key值
    * @internal
    * @param {*}
    * @return {*}
    */
    private _getLinkIdByNavMeshSurfaces(a: BaseNavMeshSurface, b: BaseNavMeshSurface): string {
        if (a.id < b.id) {
            return a.id + "_" + b.id;
        } else {
            return b.id + "_" + a.id;
        }
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
                let agent = agents[i];
                let config = this.getNavConfig(agent.agentName);
                if (!config) {
                    config = new RecastConfig();
                    config.agentName = agent.agentName;
                    this.regNavConfig(config);
                }
                config.cellSize = agent.cellSize;
                config.cellHeight = agent.cellHeight;
                config.agentMaxSlope = agent.agentMaxSlope;
                config.agentHeight = agent.agentHeight;
                config.agentRadius = agent.agentRadius;
                config.agentMaxClimb = agent.agentMaxClimb;
                config.tileSize = agent.tileSize;
            }
        }

        const areas = data.areas;
        if (areas) {
            for (var i = 0, n = areas.length; i < n; i++) {
                let area = this.getArea(areas[i].name);
                if (!area) {
                    area = new NavAreaFlag();
                    area.name = areas[i].name;
                    this.regArea(area)
                }
                area.index = areas[i].index;
                area.cost = areas[i].cost;

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
    setFilterCost(filer: any) {
        this._areaFlagMap.forEach((value) => {
            filer.setAreaCost(value.flag, value.cost);
        });
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
     * 注册不同navMesh的NavMeshLink
     * @param start NavMeshSurface
     * @param end NavMeshSurface
     * @param link NavMeshLink
     */
    regNavMeshLink(start: BaseNavMeshSurface, end: BaseNavMeshSurface, link: NavMeshLinkData) {
        if (start == end) return;
        if (start.agentType != end.agentType) return;
        let key: string = this._getLinkIdByNavMeshSurfaces(start, end);
        if (!this._naveMeshLinkMaps.has(key)) {
            this._naveMeshLinkMaps.set(key, Array<NavMeshLinkData>());
        }
        this._naveMeshLinkMaps.get(key).push(link);
    }

    /**
     * 移除NavMeshLink
     * @param start NavMeshSurface
     * @param end NavMeshSurface
     * @param link NavMesh  Link
     * @returns
     */
    removeMeshLink(start: BaseNavMeshSurface, end: BaseNavMeshSurface, link: NavMeshLinkData) {
        if (start == end) return;
        if (start.agentType != end.agentType) return;
        let key: string = this._getLinkIdByNavMeshSurfaces(start, end);
        if (!this._naveMeshLinkMaps.has(key)) {
            return;
        }
        let links = this._naveMeshLinkMaps.get(key);
        let index = links.indexOf(link);
        if (index >= 0) {
            links.splice(index, 1);
        }
    }


    /**
     * 根据两个不同的BaseNavMeshSurface查找直接是否存在BaseNavMeshLink
     * @internal 
     * @param from NavMeshSurface
     * @param to NavMeshSurface
     * @returns NavMeshLink[]
     */
    getNavMeshLink(from: BaseNavMeshSurface, to: BaseNavMeshSurface): NavMeshLinkData[] {
        let key: string = this._getLinkIdByNavMeshSurfaces(from, to);
        if (!this._naveMeshLinkMaps.has(key)) {
            return null;
        }
        return this._naveMeshLinkMaps.get(key);
    }

    /**
     * regist NavMeshSurface
     * @internal
     * @param nav
     */
    public regNavMeshSurface(nav: BaseNavMeshSurface) {
        if (!nav) {
            console.error("cannot regist empyt NavMeshSurface.");
            return;
        }
        const agentType = nav.agentType;
        let surfaces: SingletonList<BaseNavMeshSurface> = this._naveMeshMaps.get(agentType);
        if (surfaces == null) {
            surfaces = new SingletonList<BaseNavMeshSurface>();
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
    public getNavMeshSurface(pos: Vector3, agentType: string): BaseNavMeshSurface {
        if (!this._naveMeshMaps.has(agentType)) return null;
        let surfaces = this._naveMeshMaps.get(agentType);
        for (var i = 0, n = surfaces.length; i < n; i++) {
            let nav = surfaces.elements[i];
            if (NavigationUtils.boundContentPoint(nav.min, nav.max, pos)) {
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
    public getNavMeshSurfaces(pos: Vector3): BaseNavMeshSurface[] {
        var surfaces: BaseNavMeshSurface[] = [];
        this._naveMeshMaps.forEach((datas) => {
            for (var i = 0, n = datas.length; i < n; i++) {
                let nav = datas.elements[i];
                if (NavigationUtils.boundContentPoint(nav.min, nav.max, pos)) {
                    surfaces.push(datas.elements[i]);
                }
            }
        })
        return surfaces;
    }


    public getNavMeshSurfacesByBound(min:Vector3,max:Vector3,type:string): BaseNavMeshSurface[] {
        var surfaces: BaseNavMeshSurface[] = [];
        this._naveMeshMaps.forEach((datas) => {
            for (var i = 0, n = datas.length; i < n; i++) {
                let nav = datas.elements[i];
                if(nav.agentType != type) continue;
                if (NavigationUtils.boundInterection(nav.min, nav.max, min,max)>=0) {
                    surfaces.push(datas.elements[i]);
                }
            }
        })
        return surfaces;
    }

}

