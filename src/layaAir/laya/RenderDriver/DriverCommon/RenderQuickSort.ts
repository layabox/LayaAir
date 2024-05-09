import { SingletonList } from "../../utils/SingletonList";
import { IRenderElement3D } from "../DriverDesign/3DRenderPass/I3DRenderPass";

/**
 * 渲染节点快速排序
 */
export class RenderQuickSort {
    private elementArray: SingletonList<IRenderElement3D>;
    private isTransparent: boolean;

    /**
     * 快速排序
     * @param elements 
     * @param isTransparent 
     * @param left 
     * @param right 
     */
    sort(elements: SingletonList<IRenderElement3D>, isTransparent: boolean, left: number, right: number): void {
        this.elementArray = elements;
        this.isTransparent = isTransparent;
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
        const pivot: IRenderElement3D = elements[Math.floor((right + left) / 2)];
        while (left <= right) {
            while (this._compare(elements[left], pivot) < 0) left++;
            while (this._compare(elements[right], pivot) > 0) right--;
            if (left < right) {
                const temp = elements[left];
                elements[left] = elements[right];
                elements[right] = temp;
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
    private _compare(left: IRenderElement3D, right: IRenderElement3D): number {
        const renderQueue = left.materialRenderQueue - right.materialRenderQueue;
        if (renderQueue === 0) {
            const sort = this.isTransparent ? right.owner.distanceForSort - left.owner.distanceForSort : left.owner.distanceForSort - right.owner.distanceForSort;
            return sort + right.owner.sortingFudge - left.owner.sortingFudge;
        } else return renderQueue;
    }
}