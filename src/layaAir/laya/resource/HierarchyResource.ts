import { LayaEnv } from "../../LayaEnv";
import { Node } from "../display/Node";
import { LegacyUIParser } from "../loaders/LegacyUIParser";
import { Resource } from "./Resource";

export class Prefab extends Resource {
    /**
     * 资源版本
     * @readonly
     */
    public readonly version: number;

    /**
     * 依赖内容
     * @protected
     */
    protected _deps: Array<Resource>;

    /**
     * @internal
     * 兼容2.0
     */
    json: any; //兼容2.0

    constructor(version?: number) {
        super();

        this.version = version;
        this._deps = [];
    }

    /**
     * 创建实例
     * @param options 类型
     * @param errors 错误内容
     */
    create(options?: Record<string, any>, errors?: Array<any>): Node {
        if (this.json) //兼容2.0
            return LegacyUIParser.createByData(null, this.json);
        else
            return null;
    }

    /**
     * 获取依赖内容
     */
    get deps(): ReadonlyArray<Resource> {
        return this._deps;
    }

    /**
     * 增加一个依赖内容
     * @param res 依赖内容
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
     * 增加多个依赖内容
     * @param resArr 依赖内容
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
     * 销毁资源
     * @protected
     */
    protected _disposeResource(): void {
        for (let res of this._deps) {
            res._removeReference();

            if (!LayaEnv.isPlaying && (res instanceof Prefab))
                res.off("obsolute", this, this.onDepObsolute);
        }
    }

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