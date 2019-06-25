/**
 * @private
 * <code>RenderQuene</code> 类用于实现渲染队列。
 */
export class RenderQueue {
    /**
     * 创建一个 <code>RenderQuene</code> 实例。
     */
    constructor(isTransparent = false) {
        this.isTransparent = isTransparent;
        this.elements = [];
    }
    /**
     * @private
     */
    _compare(left, right) {
        var renderQueue = left.material.renderQueue - right.material.renderQueue;
        if (renderQueue === 0) {
            var sort = this.isTransparent ? right.render._distanceForSort - left.render._distanceForSort : left.render._distanceForSort - right.render._distanceForSort;
            return sort + right.render.sortingFudge - left.render.sortingFudge;
        }
        else {
            return renderQueue;
        }
    }
    /**
     * @private
     */
    _partitionRenderObject(left, right) {
        var pivot = this.elements[Math.floor((right + left) / 2)];
        while (left <= right) {
            while (this._compare(this.elements[left], pivot) < 0)
                left++;
            while (this._compare(this.elements[right], pivot) > 0)
                right--;
            if (left < right) {
                var temp = this.elements[left];
                this.elements[left] = this.elements[right];
                this.elements[right] = temp;
                left++;
                right--;
            }
            else if (left === right) {
                left++;
                break;
            }
        }
        return left;
    }
    /**
     * @private
     */
    _quickSort(left, right) {
        if (this.elements.length > 1) {
            var index = this._partitionRenderObject(left, right);
            var leftIndex = index - 1;
            if (left < leftIndex)
                this._quickSort(left, leftIndex);
            if (index < right)
                this._quickSort(index, right);
        }
    }
    /**
     * @private
     */
    _render(context, isTarget, customShader = null, replacementTag = null) {
        for (var i = 0, n = this.elements.length; i < n; i++)
            this.elements[i]._render(context, isTarget, customShader, replacementTag);
    }
    /**
     * @private
     */
    clear() {
        this.elements.length = 0;
        this.lastTransparentRenderElement = null;
        this.lastTransparentBatched = false;
    }
}
