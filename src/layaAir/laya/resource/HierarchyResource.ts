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

    addDep(res: Resource) {
        if (res instanceof Resource) {
            res._addReference();
            this._deps.push(res);
        }
    }

    addDeps(resArr: Array<Resource>) {
        for (let res of resArr) {
            if (res instanceof Resource) {
                res._addReference();
                this._deps.push(res);
            }
        }
    }

    protected _disposeResource(): void {
        for (let res of this._deps)
            res._removeReference();
    }

    public get obsolute(): boolean {
        if (this._obsolute)
            return true;

        for (let dep of this._deps) {
            if ((dep instanceof Prefab) && dep._obsolute)
                return true;
        }

        return false;
    }

    public set obsolute(value: boolean) {
        this._obsolute = value;
    }
}

//旧版本兼容
export type HierarchyResource = Prefab;
export var HierarchyResource = Prefab;