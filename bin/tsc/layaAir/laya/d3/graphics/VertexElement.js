/**
* <code>VertexElement</code> 类用于创建顶点结构分配。
*/
export class VertexElement {
    //usageIndex:int;//TODO:待确定是否添加
    get offset() {
        return this._offset;
    }
    get elementFormat() {
        return this._elementFormat;
    }
    get elementUsage() {
        return this._elementUsage;
    }
    constructor(offset, elementFormat, elementUsage) {
        this._offset = offset;
        this._elementFormat = elementFormat;
        this._elementUsage = elementUsage;
        //this.usageIndex = usageIndex;
    }
}
