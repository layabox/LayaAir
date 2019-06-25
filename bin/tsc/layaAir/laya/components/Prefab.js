import { ILaya } from "../../ILaya";
/**
 * 模板，预制件
 */
export class Prefab {
    /**
     * 通过预制创建实例
     */
    create() {
        if (this.json)
            return ILaya.SceneUtils.createByData(null, this.json);
        return null;
    }
}
