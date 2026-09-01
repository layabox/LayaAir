import { FastSinglelist } from "../../utils/SingletonList";
import { IRenderElement3D } from "../DriverDesign/3DRenderPass/I3DRenderPass";

/**
 * 渲染节点快速排序
 */
export class RenderQuickSort {
    private elementArray: FastSinglelist<IRenderElement3D>;
    private isTransparent: boolean;
    private _originalIndices: number[];

    /**
     * 快速排序
     * @param elements
     * @param isTransparent
     * @param left
     * @param right
     */
    sort(elements: FastSinglelist<IRenderElement3D>, isTransparent: boolean, left: number, right: number): void {
        this.elementArray = elements;
        this.isTransparent = isTransparent;
        // 记录原始索引，用于排序值相同时保持稳定性
        const len = right - left + 1;
        if (!this._originalIndices || this._originalIndices.length < right + 1) {
            this._originalIndices = new Array(right + 1);
        }
        for (let i = left; i <= right; i++) {
            this._originalIndices[i] = i;
        }
        this._quickSort(left, right);
    }

    /**
     * @internal
     */
    private _quickSort(left: number, right: number): void {
        if (this.elementArray.length > 1) {
            const index = this._partitionRenderObject(left, right);
            const leftIndex = index - 1;
            if (left < leftIndex)
                this._quickSort(left, leftIndex);
            if (index < right)
                this._quickSort(index, right);
        }
    }

    /**
     * @internal
     */
    private _partitionRenderObject(left: number, right: number): number {
        const elements: IRenderElement3D[] = this.elementArray.elements;
        const pivotIdx = Math.floor((right + left) / 2);
        const pivot: IRenderElement3D = elements[pivotIdx];
        const pivotOriginal = this._originalIndices[pivotIdx];
        while (left <= right) {
            while (this._compareStable(elements[left], this._originalIndices[left], pivot, pivotOriginal) < 0) left++;
            while (this._compareStable(elements[right], this._originalIndices[right], pivot, pivotOriginal) > 0) right--;
            if (left < right) {
                const temp = elements[left];
                elements[left] = elements[right];
                elements[right] = temp;
                const tempIdx = this._originalIndices[left];
                this._originalIndices[left] = this._originalIndices[right];
                this._originalIndices[right] = tempIdx;
                left++;
                right--;
            } else if (left === right) {
                left++;
                break;
            }
        }
        return left;
    }

    /**
     * @internal
     */
    private _compareStable(left: IRenderElement3D, leftOrigIdx: number, right: IRenderElement3D, rightOrigIdx: number): number {
        const renderQueue = left.materialRenderQueue - right.materialRenderQueue;
        if (renderQueue === 0) {
            const sort = this.isTransparent ? right.owner.distanceForSort - left.owner.distanceForSort : left.owner.distanceForSort - right.owner.distanceForSort;
            const result = sort + right.owner.sortingFudge - left.owner.sortingFudge;
            if (result === 0) {
                return leftOrigIdx - rightOrigIdx;
            }
            return result;
        } else return renderQueue;
    }

    /**
     * @internal
     */
    private _compare(left: IRenderElement3D, right: IRenderElement3D): number {
        const renderQueue = left.materialRenderQueue - right.materialRenderQueue;
        if (renderQueue === 0) {
            const sort = this.isTransparent ? right.owner.distanceForSort - left.owner.distanceForSort : left.owner.distanceForSort - right.owner.distanceForSort;
            return sort + right.owner.sortingFudge - left.owner.sortingFudge;
        } else return renderQueue;
    }
}