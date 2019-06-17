import { CacheManger } from "./CacheManger";
/**
 * @private
 * TODO:
 */
export class VectorGraphManager {
    constructor() {
        this.useDic = {};
        this.shapeDic = {};
        this.shapeLineDic = {};
        this._id = 0;
        this._checkKey = false;
        this._freeIdArray = [];
        CacheManger.regCacheByFunction(this.startDispose.bind(this), this.getCacheList.bind(this));
    }
    static getInstance() {
        return VectorGraphManager.instance = VectorGraphManager.instance || new VectorGraphManager();
    }
    /**
     * 得到个空闲的ID
     * @return
     */
    getId() {
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
    addShape(id, shape) {
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
    addLine(id, Line) {
        this.shapeLineDic[id] = Line;
        if (!this.shapeLineDic[id]) {
            this.shapeLineDic[id] = true;
        }
    }
    /**
     * 检测一个对象是否在使用中
     * @param	id
     */
    getShape(id) {
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
    deleteShape(id) {
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
    getCacheList() {
        var str;
        var list = [];
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
    startDispose(key) {
        var str;
        for (str in this.useDic) {
            this.useDic[str] = false;
        }
        this._checkKey = true;
    }
    /**
     * 确认销毁
     */
    endDispose() {
        if (this._checkKey) {
            var str;
            for (str in this.useDic) {
                if (!this.useDic[str]) {
                    this.deleteShape(str);
                }
            }
            this._checkKey = false;
        }
    }
}
