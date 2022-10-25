import { Node } from "../display/Node";
import { LegacyUIParser } from "../loaders/LegacyUIParser";
import { Resource } from "./Resource";

export class Prefab extends Resource {
    public readonly version: number;
    protected _deps: Array<Resource>;

    /**@private */
    json: any; //兼容2.0

    constructor(version?: number) {
        super();

        this.version = version;
        this._deps = [];
    }

    createScene(options?: Record<string, any>, errors?: Array<any>): Array<Node> {
        let ret = this.createNodes(options, errors);
        if (ret)
            return [ret];
        else
            return null;
    }

    createNodes(options?: Record<string, any>, errors?: Array<any>): Node {
        return null;
    }

    /**
     * 通过预制创建实例，createNodes的简写
     */
    create(): any {
        if (this.json)
            return LegacyUIParser.createByData(null, this.json);
        else
            return this.createNodes();
    }

    get deps(): ReadonlyArray<Resource> {
        return this._deps;
    }

    addDep(res: Resource) {
        if (res instanceof Resource) {
            res._addReference();
            this._deps.push(res);


            if (res instanceof Prefab)
                res.on("obsolute", this, this.onDepObsolute);
        }
    }

    addDeps(resArr: Array<Resource>) {
        for (let res of resArr) {
            if (res instanceof Resource) {
                res._addReference();
                this._deps.push(res);

                if (res instanceof Prefab)
                    res.on("obsolute", this, this.onDepObsolute);
            }
        }
    }

    protected _disposeResource(): void {
        for (let res of this._deps) {
            res._removeReference();

            if (res instanceof Prefab)
                res.off("obsolute", this, this.onDepObsolute);
        }
    }

    public get obsolute(): boolean {
        return this._obsolute;
    }

    public set obsolute(value: boolean) {
        if (this._obsolute != value) {
            this._obsolute = value;
            if (value)
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