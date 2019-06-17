import { SingletonList } from "./component/SingletonList";
/**
    /**
     * <code>CastShadowList</code> 类用于实现产生阴影者队列。
     */
export class CastShadowList extends SingletonList {
    /**
     * 创建一个新的 <code>CastShadowList</code> 实例。
     */
    constructor() {
        super();
    }
    /**
     * @private
     */
    add(element) {
        var index = element._indexInCastShadowList;
        if (index !== -1)
            throw "CastShadowList:element has  in  CastShadowList.";
        this._add(element);
        element._indexInCastShadowList = this.length++;
    }
    /**
     * @private
     */
    remove(element) {
        var index = element._indexInCastShadowList;
        this.length--;
        if (index !== this.length) {
            var end = this.elements[this.length];
            this.elements[index] = end;
            end._indexInCastShadowList = index;
        }
        element._indexInCastShadowList = -1;
    }
}
