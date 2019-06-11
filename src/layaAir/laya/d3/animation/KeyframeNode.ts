import { Keyframe } from "../core/Keyframe"
	
	/**
	 * @private
	 */
	export class KeyframeNode {
		/**@private */
		private _ownerPath:string[] = [];
		/**@private */
		private _propertys:string[] = [];
		
		/**@private */
		 _keyFrames:Keyframe[] = [];
		/**@private */
		 _indexInList:number;
		
		/**@private */
		 type:number;
		/**@private */
		 fullPath:string;
		/**@private */
		 propertyOwner:string;
		
		/**@private */
		 data:any;
		
		/**
		 * 获取精灵路径个数。
		 * @return 精灵路径个数。
		 */
		 get ownerPathCount():number {
			return this._ownerPath.length;
		}
		
		/**
		 * 获取属性路径个数。
		 * @return 数量路径个数。
		 */
		 get propertyCount():number {
			return this._propertys.length;
		}
		
		/**
		 * 获取帧个数。
		 * 帧个数。
		 */
		 get keyFramesCount():number {
			return this._keyFrames.length;
		}
		
		/**
		 * @private
		 */
		 _setOwnerPathCount(value:number):void {
			this._ownerPath.length = value;
		}
		
		/**
		 * @private
		 */
		 _setOwnerPathByIndex(index:number, value:string):void {
			this._ownerPath[index] = value;
		}
		
		/**
		 * @private
		 */
		 _joinOwnerPath(sep:string):string {
			return this._ownerPath.join(sep);
		}
		
		/**
		 * @private
		 */
		 _setPropertyCount(value:number):void {
			this._propertys.length = value;
		}
		
		/**
		 * @private
		 */
		 _setPropertyByIndex(index:number, value:string):void {
			this._propertys[index] = value;
		}
		
		/**
		 * @private
		 */
		 _joinProperty(sep:string):string {
			return this._propertys.join(sep);
		}
		
		/**
		 * @private
		 */
		 _setKeyframeCount(value:number):void {
			this._keyFrames.length = value;
		}
		
		/**
		 * @private
		 */
		 _setKeyframeByIndex(index:number, value:Keyframe):void {
			this._keyFrames[index] = value;
		}
		
		/**
		 * 通过索引获取精灵路径。
		 * @param index 索引。
		 */
		 getOwnerPathByIndex(index:number):string {
			return this._ownerPath[index];
		}
		
		/**
		 * 通过索引获取属性路径。
		 * @param index 索引。
		 */
		 getPropertyByIndex(index:number):string {
			return this._propertys[index];
		}
		
		/**
		 * 通过索引获取帧。
		 * @param index 索引。
		 */
		 getKeyframeByIndex(index:number):Keyframe {
			return this._keyFrames[index];
		}
	}

