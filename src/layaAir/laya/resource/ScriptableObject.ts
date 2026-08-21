import { Resource } from "./Resource";

/**
 * @en Base class for serializable data assets.
 * @zh 可序列化数据资源的基类。
 */
export class ScriptableObject extends Resource {
    /**
     * @en Creates a ScriptableObject instance.
     * @zh 创建一个 ScriptableObject 实例。
     */
    constructor() {
        super();
        this._traceDeps = true;
    }
}
