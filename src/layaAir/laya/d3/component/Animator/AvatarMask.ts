/**
 * @en Describes the animation layer mask.
 * @zh 用来描述动画层遮罩。
 */
export class AvatarMask {
    /**@internal */
    private _avatarPathMap: Record<string, boolean>;

    /**
     * @en Constructor, initialize mask information.
     * @param data Mask information.
     * @zh 构造函数,初使化遮罩信息。
     * @param data 遮罩信息
     */
    constructor(data?: any) {
        this._avatarPathMap = data?._avatarPathMap || {};
    }

    /**
     * @en Checks if the transform at the given path is active in the mask.
     * @param path The node path.
     * @returns Whether the transform is active.
     * @zh 查找节点路径遮罩。
     * @param path 节点路径
     * @returns 节点路径是否启用
     */
    getTransformActive(path: string): boolean {
        return this._avatarPathMap[path];
    }

    /**
     * @en Sets the mask for a specific transform path.
     * @param path The node path.
     * @param value Whether to enable the mask.
     * @zh 设置遮罩。
     * @param path 节点路径 
     * @param value 是否启用遮罩
     */
    setTransformActive(path: string, value: boolean): void {
        this._avatarPathMap[path] = value;
    }

    /**
     * @en Gets all mask information.
     * @returns The mask information.
     * @zh 获得遮罩信息。
     * @returns 遮罩信息
     */
    getAllTranfromPath() {
        return this._avatarPathMap;
    }

    /**
     * @en Clones the AvatarMask.
     * @returns A clone of the AvatarMask.
     * @zh 克隆。
     * @returns 克隆的AvatarMask。
     */
    clone(): any {
        var dest: AvatarMask = new AvatarMask();
        this.cloneTo(dest);
        return dest;
    }
    /**
     * @en Clones the AvatarMask to another object.
     * @param destObject The target object to clone to.
     * @zh 克隆到目标对象。
     * @param destObject 目标对象
     */
    cloneTo(destObject: AvatarMask): void {
        for (var key in this._avatarPathMap) {
            destObject.setTransformActive(key, this._avatarPathMap[key]);
        }

    }

}