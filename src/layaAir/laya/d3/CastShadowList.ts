import { SingletonList } from "./component/SingletonList"
import { BaseRender } from "./core/render/BaseRender"


/**
	/**
	 * <code>CastShadowList</code> 类用于实现产生阴影者队列。
	 */
	export class CastShadowList extends SingletonList {
		
		/**
		 * 创建一个新的 <code>CastShadowList</code> 实例。
		 */
		constructor(){super();

		}
		
		/**
		 * @internal
		 */
		 add(element:BaseRender):void {
			var index:number = element._indexInCastShadowList;
			if (index !== -1)
				throw "CastShadowList:element has  in  CastShadowList.";
			this._add(element);
			element._indexInCastShadowList = this.length++;
		}
		
		/**
		 * @internal
		 */
		 remove(element:BaseRender):void {
			var index:number = element._indexInCastShadowList;
			this.length--;
			if (index !== this.length) {
				var end:any = this.elements[this.length];
				this.elements[index] = end;
				end._indexInCastShadowList = index;
			}
			element._indexInCastShadowList = -1;
		}
	
	}


