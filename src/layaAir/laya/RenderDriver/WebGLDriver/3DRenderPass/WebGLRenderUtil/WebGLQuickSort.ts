import { FastSinglelist } from "../../../../utils/SingletonList";
import { WebGLRenderElement3D } from "../WebGLRenderElement3D";


export class WebGLQuickSort {
	private elementArray: FastSinglelist<WebGLRenderElement3D>;
	private isTransparent: boolean;

	/**
	 * 快速排序
	 * @param elements 
	 * @param isTransparent 
	 * @param left 
	 * @param right 
	 */
	sort(elements: FastSinglelist<WebGLRenderElement3D>, isTransparent: boolean, left: number, right: number): void {
		this.elementArray = elements;
		this.isTransparent = isTransparent;
		this._quickSort(left, right);
	}

	/**
	 * @internal
	 */
	_quickSort(left: number, right: number): void {
		if (this.elementArray.length > 1) {
			var index: number = this._partitionRenderObject(left, right);
			var leftIndex: number = index - 1;
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
		var elements: WebGLRenderElement3D[] = this.elementArray.elements;
		var pivot: WebGLRenderElement3D = elements[Math.floor((right + left) / 2)];
		while (left <= right) {
			while (this._compare(elements[left], pivot) < 0)
				left++;
			while (this._compare(elements[right], pivot) > 0)
				right--;
			if (left < right) {
				var temp: WebGLRenderElement3D = elements[left];
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
	private _compare(left: WebGLRenderElement3D, right: WebGLRenderElement3D): number {
		var renderQueue: number = left.materialRenderQueue - right.materialRenderQueue;
		if (renderQueue === 0) {
			var sort: number = this.isTransparent ? right.owner.distanceForSort - left.owner.distanceForSort : left.owner.distanceForSort - right.owner.distanceForSort;
			return sort + right.owner.sortingFudge - left.owner.sortingFudge;
		} else {
			return renderQueue;
		}
	}

}