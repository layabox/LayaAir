import { LayaEnv } from "../../LayaEnv";
import { Node } from "../display/Node";
import { LegacyUIParser } from "../loaders/LegacyUIParser";
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
     * @protected 
     * 依赖内容
     */
    protected _deps: Array<Resource>;

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
        this._deps = [];
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
            return LegacyUIParser.createByData(null, this.json);
        else
            return null;
    }

    /**
     * @en The list of dependencies for the prefab.
     * @zh 预制体的依赖列表。
     */
    get deps(): ReadonlyArray<Resource> {
        return this._deps;
    }

    /**
     * @en Adds a dependency to the prefab.
     * @param res The resource to be added as a dependency.
     * @zh 向预制体增加一个依赖内容。
     * @param res 要添加为依赖的资源。
     */
    addDep(res: Resource) {
        if (res instanceof Resource) {
            res._addReference();
            this._deps.push(res);

            if (!LayaEnv.isPlaying && (res instanceof Prefab))
                res.on("obsolute", this, this.onDepObsolute);
        }
    }

    /**
     * @en Adds multiple dependencies to the prefab.
     * @param resArr An array of resources to be added as dependencies.
     * @zh 向预制体增加多个依赖内容。
     * @param resArr 要添加为依赖的资源数组。
     */
    addDeps(resArr: Array<Resource>) {
        for (let res of resArr) {
            if (res instanceof Resource) {
                res._addReference();
                this._deps.push(res);

                if (!LayaEnv.isPlaying && (res instanceof Prefab))
                    res.on("obsolute", this, this.onDepObsolute);
            }
        }
    }

    /**
     * @internal
     * @protected
     * 销毁资源
     */
    protected _disposeResource(): void {
        for (let res of this._deps) {
            res._removeReference();

            if (!LayaEnv.isPlaying && (res instanceof Prefab))
                res.off("obsolute", this, this.onDepObsolute);
        }
    }

    /**
     * @en Whether the prefab is obsolete.
     * @zh 预制体是否已过时。
     */
    public get obsolute(): boolean {
        return this._obsolute;
    }

    public set obsolute(value: boolean) {
        if (this._obsolute != value) {
            this._obsolute = value;
            if (value && !LayaEnv.isPlaying)
                this.event("obsolute");
        }
    }

    private onDepObsolute() {
        this.obsolute = true;
    }
}

//旧版本兼容
export type HierarchyResource = Prefab;
export var HierarchyResource = Prefab;