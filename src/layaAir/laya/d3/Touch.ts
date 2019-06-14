import { Vector2 } from "./math/Vector2"
import { ISingletonElement } from "../resource/ISingletonElement"

	
	/**
	 * <code>Touch</code> 类用于实现触摸描述。
	 */
	export class Touch implements ISingletonElement {
		/** @private  [实现IListPool接口]*/
		private _indexInList:number = -1;
		
		/** @private */
		 _identifier:number = -1;
		/** @private */
		 _position:Vector2 = new Vector2();
		
		/**
		 * 获取唯一识别ID。
		 * @return 唯一识别ID。
		 */
		 get identifier():number {
			return this._identifier;
		}
		
		/**
		 * 获取触摸点的像素坐标。
		 * @return 触摸点的像素坐标 [只读]。
		 */
		 get position():Vector2 {
			return this._position;
		}
		
		/**
		 * @private
		 * 创建一个 <code>Touch</code> 实例。
		 */
		constructor(){
		}
		
		/**
		 * @private [实现ISingletonElement接口]
		 */
		 _getIndexInList():number {
			return this._indexInList;
		}
		
		/**
		 * @private [实现ISingletonElement接口]
		 */
		 _setIndexInList(index:number):void {
			this._indexInList = index;
		}
	
	}


