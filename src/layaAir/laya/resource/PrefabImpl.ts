import { Node } from "../display/Node";
import { ILoadURL } from "../net/Loader";
import { Prefab } from "./HierarchyResource";

/**
 * @en Hierarchy parser API.
 * @zh 层次结构分析器 API。
 */
export interface IHierarchyParserAPI {
    /**
     * @en Collect resource links required by the data.
     * @param data The data object to process.
     * @param basePath The base path used to resolve resource links.
     * @returns An array of strings or ILoadURL objects representing the resource links.
     * @zh 收集数据所需的资源链接。
     * @param data 需要处理的数据对象。
     * @param basePath 用于解析资源链接的基础路径。
     * @returns 返回表示资源链接的字符串或 ILoadURL 对象数组。
     */
    collectResourceLinks: (data: any, basePath: string) => (string | ILoadURL)[],
    /**
     * @en Parse the data and create a hierarchy of nodes.
     * @param data The data object to parse.
     * @param options Optional settings for parsing.
     * @param errors Array to store any errors encountered during parsing.
     * @returns An array of nodes or a single node if only one is created.
     * @zh 解析数据并创建节点的层次结构。
     * @param data 需要解析的数据对象。
     * @param options 解析的可选设置。
     * @param errors 存储解析过程中遇到的错误的数组。
     * @zh 返回节点数组或如果只创建了一个节点，则返回单个节点。
     */
    parse: (data: any, options?: Record<string, any>, errors?: Array<any>) => Array<Node> | Node;
}

/**
 * @en This class is used to import prefabs.
 * @zh 该类用于导入预制体。
 */
export class PrefabImpl extends Prefab {
    /**
     * @en The prefab data.
     * @zh 预制体数据。
     */
    data: any;
    /**
     * @en The hierarchy parser API used to parse the prefab data.
     * @zh 用于解析预制体数据的层次结构 API。
     */
    api: IHierarchyParserAPI;

    /**
     * @en Constructor method.
     * @param api The hierarchy parser API.
     * @param data The data to initialize the prefab instance with.
     * @param version The version of the prefab.
     * @zh 构造方法。
     * @param api 层次结构API
     * @param data 用于初始化预制体实例的数据。
     * @param version 预制体的版本。
     */
    constructor(api: IHierarchyParserAPI, data: any, version: number) {
        super(version);

        this.api = api;
        this.data = data;
    }

    /**
     * @en Create an instance of the prefab.
     * @param options Optional parameters for instance creation.
     * @param errors Array to store any errors encountered during instance creation.
     * @returns The prefab instance.
     * @zh 创建预制体的实例。
     * @param options 创建实例时的可选参数。
     * @param errors 存储实例创建过程中遇到的错误的数组。
     * @returns 预制体实例。
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
