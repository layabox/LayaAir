import { Node } from "../display/Node";
import { ILoadURL } from "../net/Loader";
import { Prefab } from "./HierarchyResource";

export interface IHierarchyParserAPI {
    collectResourceLinks: (data: any, basePath: string) => (string | ILoadURL)[],
    parse: (data: any, options?: Record<string, any>, errors?: Array<any>) => Array<Node> | Node;
}

export class PrefabImpl extends Prefab {
    data: any;
    api: IHierarchyParserAPI;

    constructor(api: IHierarchyParserAPI, data: any, version: number) {
        super(version);

        this.api = api;
        this.data = data;
    }

    create(options?: Record<string, any>, errors?: any[]): Node {
        let ret = this.api.parse(this.data, options, errors);
        if (Array.isArray(ret)) {
            if (ret.length == 1) {
                ret[0].url = this.url;
            }
            return ret[0];
        }
        else {
            ret.url = this.url;
            return ret;
        }
    }
}
