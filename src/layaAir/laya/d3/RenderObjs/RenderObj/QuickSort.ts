// import { ISortPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISortPass";
// import { SingletonList } from "../../../utils/SingletonList";
// import { RenderElement } from "../../core/render/RenderElement";



// export class QuickSort implements ISortPass {
// 	private elementArray: SingletonList<RenderElement>;
// 	private isTransparent: boolean;

// 	/**
// 	 * 快速排序
// 	 * @param elements 
// 	 * @param isTransparent 
// 	 * @param left 
// 	 * @param right 
// 	 */
// 	sort(elements: SingletonList<RenderElement>, isTransparent: boolean, left: number, right: number): void {
// 		this.elementArray = elements;
// 		this.isTransparent = isTransparent;
// 		this._quickSort(left, right);
// 	}

// 	/**
// 	 * @internal
// 	 */
// 	_quickSort(left: number, right: number): void {
// 		if (this.elementArray.length > 1) {
// 			var index: number = this._partitionRenderObject(left, right);
// 			var leftIndex: number = index - 1;
// 			if (left < leftIndex)
// 				this._quickSort(left, leftIndex);

// 			if (index < right)
// 				this._quickSort(index, right);
// 		}
// 	}


// 	/**
// 	 * @internal
// 	 */
// 	private _partitionRenderObject(left: number, right: number): number {
// 		var elements: RenderElement[] = this.elementArray.elements;
// 		var pivot: RenderElement = elements[Math.floor((right + left) / 2)];
// 		while (left <= right) {
// 			while (this._compare(elements[left], pivot) < 0)
// 				left++;
// 			while (this._compare(elements[right], pivot) > 0)
// 				right--;
// 			if (left < right) {
// 				var temp: RenderElement = elements[left];
// 				elements[left] = elements[right];
// 				elements[right] = temp;
// 				left++;
// 				right--;
// 			} else if (left === right) {
// 				left++;
// 				break;
// 			}
// 		}
// 		return left;
// 	}

// 	/**
// 	 * @internal
// 	 */
// 	private _compare(left: RenderElement, right: RenderElement): number {
// 		var renderQueue: number = left._material.renderQueue - right._material.renderQueue;
// 		if (renderQueue === 0) {
// 			var sort: number = this.isTransparent ? right._baseRender._distanceForSort - left._baseRender._distanceForSort : left._baseRender._distanceForSort - right._baseRender._distanceForSort;
// 			return sort + right._baseRender.sortingFudge - left._baseRender.sortingFudge;
// 		} else {
// 			return renderQueue;
// 		}
// 	}

// }