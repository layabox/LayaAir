/**
 * <code>IList</code> 可加入队列接口。
 */
export interface ISingletonElement {
    _getIndexInList(): number;
    _setIndexInList(index: number): void;
}
