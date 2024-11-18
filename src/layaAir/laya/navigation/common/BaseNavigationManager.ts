
import { Vector3 } from "../../maths/Vector3";
import { SingletonList } from "../../utils/SingletonList";
import { AreaMask } from "./AreaMask";
import { NavigationUtils } from "./NavigationUtils";
import { RecastConfig } from "./RecastConfig";
import { NavAreaFlag, NavigationConfig } from "./NavigationConfig";
import { BaseNavMeshSurface } from "./component/BaseNavMeshSurface";
import { Node } from "../../display/Node";
import { NavMeshLinkData } from "./data/NavMeshLinkData";
import { IElementComponentManager } from "../../components/IScenceComponentManager";



/**
 * @en BaseNavigationManager is a base navigation manager responsible for managing navigation meshes.
 * @zh BaseNavigationManager 是一个基础导航管理器，负责管理导航网格。
 */
export class BaseNavigationManager implements IElementComponentManager {


    /**
     * 初始化系统，由系统内部调用
     * @internal
     */
    protected static _initialize(callback: () => void | Promise<void>): Promise<void> {
        if (NavigationUtils._getRecast() != null) {
            callback && callback();
            return Promise.resolve();
        } else {
            return (window as any).Recast().then((Recast: any) => {
                NavigationUtils._initialize(Recast);
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
      * @en Instantiates a Navigation manager.
      * @zh 实例化一个 Navigation 管理器。
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
    init(data: any): void {
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
     * @en Registers a navigation mesh agent type configuration.
     * @param config The RecastConfig object containing the agent configuration.
     * @zh 注册导航网格的 agent 类型配置。
     * @param config RecastConfig 对象，包含 agent 的配置。
     */
    regNavConfig(config: RecastConfig) {
        this._navConfigMap.set(config.agentName, config);
    }

    /**
     * @en Gets the navigation mesh agent configuration for a specific type.
     * @param type The agent type name.
     * @returns The RecastConfig for the specified agent type, or undefined if not found.
     * @zh 获取指定类型的导航网格 agent 配置。
     * @param type agent 类型名称。
     * @returns 指定 agent 类型的 RecastConfig，如果未找到则返回 undefined。
     */
    getNavConfig(type: string): RecastConfig {
        return this._navConfigMap.get(type);
    }

    /**
     * @en Registers a navigation area type.
     * @param area The NavAreaFlag object representing the area type.
     * @zh 注册导航区域类型。
     * @param area 表示区域类型的 NavAreaFlag 对象。
     */
    regArea(area: NavAreaFlag) {
        this._areaFlagMap.set(area.name, area);
    }

    /**
     * @en Gets the configuration for a specific navigation area type.
     * @param type The area type name.
     * @returns The NavAreaFlag for the specified area type, or undefined if not found.
     * @zh 获取指定导航区域类型的配置。
     * @param type 区域类型名称。
     * @returns 指定区域类型的 NavAreaFlag，如果未找到则返回 undefined。
     */
    getArea(type: string): NavAreaFlag {
        return this._areaFlagMap.get(type);
    }

    /**
     * @en Gets the map of all registered navigation area flags.
     * @returns A Map of area names to NavAreaFlag objects.
     * @zh 获取所有已注册的导航区域标志的映射。
     * @returns 区域名称到 NavAreaFlag 对象的 Map。
     */
    getAreaFlagMap(): Map<string, NavAreaFlag> {
        return this._areaFlagMap;
    }

    /**
     * @en Registers a NavMeshLink between two different NavMeshSurfaces.
     * @param start The starting NavMeshSurface.
     * @param end The ending NavMeshSurface.
     * @param link The NavMeshLink to register.
     * @zh 注册连接两个不同 NavMeshSurface 的 NavMeshLink。
     * @param start 起始 NavMeshSurface。
     * @param end 结束 NavMeshSurface。
     * @param link 要注册的 NavMeshLink。
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
     * @en remove a NavMeshLink between two different NavMeshSurfaces.
     * @param start The starting NavMeshSurface.
     * @param end The ending NavMeshSurface.
     * @param link The NavMeshLink to register.
     * @zh 移除两个不同 NavMeshSurface 的 NavMeshLink。
     * @param start 起始 NavMeshSurface。
     * @param end 结束 NavMeshSurface。
     * @param link 要注册的 NavMeshLink。
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
     * @en Get the corresponding NavMeshSurface based on a world position.
     * @param pos World coordinate position.
     * @param agentType Agent type.
     * @returns NavMeshSurface or null if not found.
     * @zh 通过空间位置获得对应的 NavMeshSurface。
     * @param pos 世界坐标位置。
     * @param agentType agent 类型。
     * @returns NavMeshSurface，如果未找到则返回 null。
     */
    public getNavMeshSurface(pos: Vector3, agentType: string): BaseNavMeshSurface {
        if (!this._naveMeshMaps.has(agentType)) return null;
        let surfaces = this._naveMeshMaps.get(agentType);
        for (var i = 0, n = surfaces.length; i < n; i++) {
            let nav = surfaces.elements[i];
            if (NavigationUtils._boundContentPoint(nav.min, nav.max, pos)) {
                return surfaces.elements[i];
            }
        }
        return null;
    }

    /**
     * @en Get all NavMeshSurfaces that contain a given world position.
     * @param pos World coordinate position.
     * @returns Array of NavMeshSurface objects.
     * @zh 通过空间坐标获得所有包含该位置的 NavMeshSurface。
     * @param pos 世界坐标位置。
     * @returns NavMeshSurface 对象数组。
     */
    public getNavMeshSurfaces(pos: Vector3): BaseNavMeshSurface[] {
        var surfaces: BaseNavMeshSurface[] = [];
        this._naveMeshMaps.forEach((datas) => {
            for (var i = 0, n = datas.length; i < n; i++) {
                let nav = datas.elements[i];
                if (NavigationUtils._boundContentPoint(nav.min, nav.max, pos)) {
                    surfaces.push(datas.elements[i]);
                }
            }
        })
        return surfaces;
    }

    /**
     * @en Get all NavMeshSurfaces that contain a given world bound box.
     * @param min World min position.
     * @param max World max position.
     * @param type Navigation type.
     * @returns Array of NavMeshSurface objects.
     * @zh 获得包围盒内包含的所有 NavMeshSurface。
     * @param min 包围盒的最小值。
     * @param max 包围盒的最大值。
     * @param type 寻路类型。
     * @returns NavMeshSurface 对象数组。
     */
    public getNavMeshSurfacesByBound(min: Vector3, max: Vector3, type: string): BaseNavMeshSurface[] {
        var surfaces: BaseNavMeshSurface[] = [];
        this._naveMeshMaps.forEach((datas) => {
            for (var i = 0, n = datas.length; i < n; i++) {
                let nav = datas.elements[i];
                if (nav.agentType != type) continue;
                if (NavigationUtils._boundInterection(nav.min, nav.max, min, max) >= 0) {
                    surfaces.push(datas.elements[i]);
                }
            }
        })
        return surfaces;
    }

}

