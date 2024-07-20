import { CacheManger } from "./CacheManger"

/**
 * @private
 * @en VectorGraphManager class for managing vector graphics.
 * @zh 用于管理矢量图形的 VectorGraphManager 类。
 */
export class VectorGraphManager {
    /**
     * @en Singleton instance of VectorGraphManager.
     * @zh VectorGraphManager 的单例实例。
     */
    static instance: VectorGraphManager;

    /**
     * @en Dictionary to track the usage of shapes.
     * @zh 用于跟踪形状使用情况的字典。
     */
    useDic: any = {};

    /**
     * @en Dictionary to store shapes.
     * @zh 用于存储形状的字典。
     */
    shapeDic: any = {};

    /**
     * @en Dictionary to store shape lines.
     * @zh 用于存储形状线条的字典。
     */
    shapeLineDic: any = {};

    private _id: number = 0;
    private _checkKey: boolean = false;
    private _freeIdArray: any[] = [];

    constructor() {
        CacheManger.regCacheByFunction(this.startDispose.bind(this), this.getCacheList.bind(this));
    }

    /**
     * @en Get the singleton instance of VectorGraphManager.
     * @returns The singleton instance of VectorGraphManager.
     * @zh 获取 VectorGraphManager 的单例实例。
     * @returns VectorGraphManager 的单例实例。
     */
    static getInstance(): VectorGraphManager {
        return VectorGraphManager.instance = VectorGraphManager.instance || new VectorGraphManager();
    }

    /**
     * @en Get an available ID.
     * @returns An available ID.
     * @zh 获取一个可用的 ID。
     * @returns 一个可用的 ID。
     */
    getId(): number {
        //if (_freeIdArray.length > 0) {
        //return _freeIdArray.pop();
        //}
        return this._id++;
    }

    /**
     * @en Add a shape to the list.
     * @param id The ID of the shape.
     * @param shape The shape object.
     * @zh 将一个形状添加到列表中。
     * @param id 形状的 ID。
     * @param shape 形状对象。
     */
    addShape(id: number, shape: any): void {
        this.shapeDic[id] = shape;
        if (!this.useDic[id]) {
            this.useDic[id] = true;
        }
    }

    /**
     * @en Add a line shape to the list.
     * @param id The ID of the line shape.
     * @param Line The line shape object.
     * @zh 将一个线形状添加到列表中。
     * @param id 线形状的 ID。
     * @param Line 线形状对象。
     */
    addLine(id: number, Line: any): void {
        this.shapeLineDic[id] = Line;
        if (!this.shapeLineDic[id]) {
            this.shapeLineDic[id] = true;
        }
    }

    /**
     * @en Check if an object is in use.
     * @param id The ID of the object to check.
     * @zh 检查一个对象是否正在使用中。
     * @param id 要检查的对象的 ID。
     */
    getShape(id: number): void {
        if (this._checkKey) {
            if (this.useDic[id] != null) {
                this.useDic[id] = true;
            }
        }
    }

    /**
     * @en Delete a shape object.
     * @param id The ID of the shape to delete.
     * @zh 删除一个形状对象。
     * @param id 要删除的形状的 ID。
     */
    deleteShape(id: number): void {
        if (this.shapeDic[id]) {
            this.shapeDic[id] = null;
            delete this.shapeDic[id];
        }
        if (this.shapeLineDic[id]) {
            this.shapeLineDic[id] = null;
            delete this.shapeLineDic[id];
        }
        if (this.useDic[id] != null) {
            delete this.useDic[id];
        }
        //_freeIdArray.push(id);
    }

    /**
     * @en Get the cache list.
     * @returns An array of cached objects.
     * @zh 获取缓存列表。
     * @returns 缓存对象的数组。
     */
    getCacheList(): any[] {
        var str: any;
        var list: any[] = [];
        for (str in this.shapeDic) {
            list.push(this.shapeDic[str]);
        }
        for (str in this.shapeLineDic) {
            list.push(this.shapeLineDic[str]);
        }
        return list;
    }

    /**
     * @en Start the disposal process, preparing for destruction.
     * @zh 开始清理过程，准备销毁。
     */
    startDispose(key: boolean): void {
        var str: any;
        for (str in this.useDic) {
            this.useDic[str] = false;
        }
        this._checkKey = true;
    }

    /**
     * @en Confirm destruction.
     * @zh 确认销毁。
     */
    endDispose(): void {
        if (this._checkKey) {
            var str: any;
            for (str in this.useDic) {
                if (!this.useDic[str]) {
                    this.deleteShape(str);
                }
            }
            this._checkKey = false;
        }

    }

}


