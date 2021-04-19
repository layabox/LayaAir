import { CacheManger } from "./CacheManger"

/**
 * @private
 * TODO:
 */
export class VectorGraphManager {
    //TODO:
    static instance: VectorGraphManager;

    useDic: any = {};
    shapeDic: any = {};
    shapeLineDic: any = {};

    private _id: number = 0;
    private _checkKey: boolean = false;
    private _freeIdArray: any[] = [];

    constructor() {
        CacheManger.regCacheByFunction(this.startDispose.bind(this), this.getCacheList.bind(this));
    }

    static getInstance(): VectorGraphManager {
        return VectorGraphManager.instance = VectorGraphManager.instance || new VectorGraphManager();
    }

    /**
     * 得到个空闲的ID
     * @return
     */
    getId(): number {
        //if (_freeIdArray.length > 0) {
        //return _freeIdArray.pop();
        //}
        return this._id++;
    }

    /**
     * 添加一个图形到列表中
     * @param	id
     * @param	shape
     */
    addShape(id: number, shape: any): void {
        this.shapeDic[id] = shape;
        if (!this.useDic[id]) {
            this.useDic[id] = true;
        }
    }

    /**
     * 添加一个线图形到列表中
     * @param	id
     * @param	Line
     */
    addLine(id: number, Line: any): void {
        this.shapeLineDic[id] = Line;
        if (!this.shapeLineDic[id]) {
            this.shapeLineDic[id] = true;
        }
    }

    /**
     * 检测一个对象是否在使用中
     * @param	id
     */
    getShape(id: number): void {
        if (this._checkKey) {
            if (this.useDic[id] != null) {
                this.useDic[id] = true;
            }
        }
    }

    /**
     * 删除一个图形对象
     * @param	id
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
     * 得到缓存列表
     * @return
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
     * 开始清理状态，准备销毁
     */
    startDispose(key: boolean): void {
        var str: any;
        for (str in this.useDic) {
            this.useDic[str] = false;
        }
        this._checkKey = true;
    }

    /**
     * 确认销毁
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


