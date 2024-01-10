import { SingletonList } from "../../../../../utils/SingletonList";
import { RenderElementOBJ } from "../../../RenderObj/RenderElementOBJ";

export class QuickSort {
	private elementArray: SingletonList<RenderElementOBJ>;
	private isTransparent: boolean;

	/**
	 * 快速排序
	 * @param elements 
	 * @param isTransparent 
	 * @param left 
	 * @param right 
	 */
	sort(elements: SingletonList<RenderElementOBJ>, isTransparent: boolean, left: number, right: number): void {
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
		var elements: RenderElementOBJ[] = this.elementArray.elements;
		var pivot: RenderElementOBJ = elements[Math.floor((right + left) / 2)];
		while (left <= right) {
			while (this._compare(elements[left], pivot) < 0)
				left++;
			while (this._compare(elements[right], pivot) > 0)
				right--;
			if (left < right) {
				var temp: RenderElementOBJ = elements[left];
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
	private _compare(left: RenderElementOBJ, right: RenderElementOBJ): number {
		var renderQueue: number = left._materialRenderQueue - right._materialRenderQueue;
		if (renderQueue === 0) {
			var sort: number = this.isTransparent ? right._owner.distanceForSort - left._owner.distanceForSort : left._owner.distanceForSort - right._owner.distanceForSort;
			return sort + right._owner.sortingFudge - left._owner.sortingFudge;
		} else {
			return renderQueue;
		}
	}

}