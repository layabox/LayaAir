import { RenderElement } from "././RenderElement";
import { RenderContext3D } from "././RenderContext3D";
import { Shader3D } from "../../shader/Shader3D"
	
	/**
	 * @private
	 * <code>RenderQuene</code> 类用于实现渲染队列。
	 */
	export class RenderQueue {
		/** @private [只读]*/
		 isTransparent:boolean;
		/** @private */
		 elements:any[];
		/** @private */
		 lastTransparentRenderElement:RenderElement;
		/** @private */
		 lastTransparentBatched:boolean;
		
		/**
		 * 创建一个 <code>RenderQuene</code> 实例。
		 */
		constructor(isTransparent:boolean = false){
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			this.isTransparent = isTransparent;
			this.elements = [];
		}
		
		/**
		 * @private
		 */
		private _compare(left:RenderElement, right:RenderElement):number {
			var renderQueue:number = left.material.renderQueue - right.material.renderQueue;
			if (renderQueue === 0) {
				var sort:number = this.isTransparent ? right.render._distanceForSort - left.render._distanceForSort : left.render._distanceForSort - right.render._distanceForSort;
				return sort + right.render.sortingFudge - left.render.sortingFudge;
			} else {
				return renderQueue;
			}
		}
		
		/**
		 * @private
		 */
		private _partitionRenderObject(left:number, right:number):number {
			var pivot:RenderElement = this.elements[Math.floor((right + left) / 2)];
			while (left <= right) {
				while (this._compare(this.elements[left], pivot) < 0)
					left++;
				while (this._compare(this.elements[right], pivot) > 0)
					right--;
				if (left < right) {
					var temp:RenderElement = this.elements[left];
					this.elements[left] = this.elements[right];
					this.elements[right] = temp;
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
		 * @private
		 */
		 _quickSort(left:number, right:number):void {
			if (this.elements.length > 1) {
				var index:number = this._partitionRenderObject(left, right);
				var leftIndex:number = index - 1;
				if (left < leftIndex)
					this._quickSort(left, leftIndex);
				
				if (index < right)
					this._quickSort(index, right);
			}
		}
		

		
		/**
		 * @private
		 */
		 _render(context:RenderContext3D, isTarget:boolean, customShader:Shader3D = null, replacementTag:string = null):void {
			for (var i:number = 0, n:number = this.elements.length; i < n; i++) 
				this.elements[i]._render(context, isTarget, customShader, replacementTag);
		}
		
		/**
		 * @private
		 */
		 clear():void {
			this.elements.length = 0;
			this.lastTransparentRenderElement = null;
			this.lastTransparentBatched = false;
		}
	}

