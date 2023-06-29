/**
 * 用来描述动画层遮罩
 */
export class AvatarMask {
    /**@internal */
    private _avatarPathMap: Record<string, boolean>;

    /**
     * 创建一个<code>AvatarMask</code>实例
     */
    constructor(data?: any) {
        this._avatarPathMap = data?._avatarPathMap || {};
    }

    /**
     * 查找节点路径遮罩
     * @param path 
     * @returns 
     */
    getTransformActive(path: string): boolean {
        return this._avatarPathMap[path];
    }

    /**
     * 设置
     * @param path 
     * @param value 
     */
    setTransformActive(path: string, value: boolean) {
        this._avatarPathMap[path] = value;
    }

    /**
     * 获得遮罩信息
     * @returns 
     */
    getAllTranfromPath() {
        return this._avatarPathMap;
    }

    /**
   * 克隆。
   * @return	 克隆副本。
   */
    clone(): any {
        var dest: AvatarMask = new AvatarMask();
        this.cloneTo(dest);
        return dest;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void {
        var dest: AvatarMask = (<AvatarMask>destObject);
        for (var key in this._avatarPathMap) {
            dest.setTransformActive(key, this._avatarPathMap[key]);
        }

    }

}