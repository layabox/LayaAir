/**
 * @private
 * TODO:
 */
export declare class VectorGraphManager {
    static instance: VectorGraphManager;
    useDic: any;
    shapeDic: any;
    shapeLineDic: any;
    private _id;
    private _checkKey;
    private _freeIdArray;
    constructor();
    static getInstance(): VectorGraphManager;
    /**
     * 得到个空闲的ID
     * @return
     */
    getId(): number;
    /**
     * 添加一个图形到列表中
     * @param	id
     * @param	shape
     */
    addShape(id: number, shape: any): void;
    /**
     * 添加一个线图形到列表中
     * @param	id
     * @param	Line
     */
    addLine(id: number, Line: any): void;
    /**
     * 检测一个对象是否在使用中
     * @param	id
     */
    getShape(id: number): void;
    /**
     * 删除一个图形对象
     * @param	id
     */
    deleteShape(id: number): void;
    /**
     * 得到缓存列表
     * @return
     */
    getCacheList(): any[];
    /**
     * 开始清理状态，准备销毁
     */
    startDispose(key: boolean): void;
    /**
     * 确认销毁
     */
    endDispose(): void;
}
