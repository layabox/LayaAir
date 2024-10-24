import { Node } from "../display/Node";
import { HierarchyLoader } from "../loaders/HierarchyLoader";
import { Resource } from "./Resource";

/**
 * @en Prefab class.
 * @zh 预制体类。
 */
export class Prefab extends Resource {
    /**
     * @readonly
     * @en The version number of the prefab resource.
     * @zh 预制体资源的版本号。
     */
    public readonly version: number;

    /**
     * @internal
     * @en Compatible with the LayaAir 2.x engine.
     * @zh 兼容LayaAir2.x引擎
     */
    json: any;

    /**
     * @ignore
     * @en Create an instance of the prefab.
     * @param version The version number of the prefab resource.
     * @zh 创建一个预制体实例。
     * @param version 预制体资源的版本号。
     */
    constructor(version?: number) {
        super();

        this.version = version;
        this._traceDeps = true;
    }

    /**
     * @en Create an instance of the prefab.
     * @param options Instantiation options.
     * @param errors Error content.
     * @zh 创建一个预制体的实例。
     * @param options 实例化选项
     * @param errors 错误内容
     */
    create(options?: Record<string, any>, errors?: Array<any>): Node {
        if (this.json) //兼容2.0
            return HierarchyLoader.legacySceneOrPrefab.createByData(null, this.json);
        else
            return null;
    }
}

//旧版本兼容
export type HierarchyResource = Prefab;
export var HierarchyResource = Prefab;