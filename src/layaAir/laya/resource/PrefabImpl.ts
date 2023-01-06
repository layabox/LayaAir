import { Node } from "../display/Node";
import { ILoadURL } from "../net/Loader";
import { Prefab } from "./HierarchyResource";

/**
 * 层次结构分析器API
 */
export interface IHierarchyParserAPI {
    /**收集资源链接 */
    collectResourceLinks: (data: any, basePath: string) => (string | ILoadURL)[],
    /**解析 */
    parse: (data: any, options?: Record<string, any>, errors?: Array<any>) => Array<Node> | Node;
}

/**
 * 预制体导入
 */
export class PrefabImpl extends Prefab {
    /**数据 */
    data: any;
    /**层次结构API */
    api: IHierarchyParserAPI;

    /**
     * 实例化一个预制体
     * @param api 层次结构API
     * @param data 数据
     * @param version 版本
     */
    constructor(api: IHierarchyParserAPI, data: any, version: number) {
        super(version);

        this.api = api;
        this.data = data;
    }

    /**
     * 创建一个
     * @param options 
     * @param errors 
     * @returns 
     */
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
