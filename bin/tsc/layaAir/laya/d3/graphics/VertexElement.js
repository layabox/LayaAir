/**
     * <code>VertexElement</code> 类用于创建顶点结构分配。
     */
export class VertexElement {
    //public var usageIndex:int;//TODO:待确定是否添加
    constructor(offset, elementFormat, elementUsage) {
        this.offset = offset;
        this.elementFormat = elementFormat;
        this.elementUsage = elementUsage;
        //this.usageIndex = usageIndex;
    }
}
