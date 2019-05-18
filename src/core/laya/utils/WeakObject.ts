import { Browser } from "././Browser";
import { Utils } from "././Utils";

var supportWeakMap = !!WeakMap;
/**
	 * 封装弱引用WeakMap
	 * 如果支持WeakMap，则使用WeakMap，如果不支持，则用Object代替
	 * 注意：如果采用Object，为了防止内存泄漏，则采用定时清理缓存策略
	 */
	export class WeakObject {
		/**是否支持WeakMap*/
		 static supportWeakMap=supportWeakMap;
		/**如果不支持WeakMap，则多少时间清理一次缓存，默认10分钟清理一次*/
		 static delInterval:number = 10 * 60 * 1000;
		/**全局WeakObject单例*/
		 static I:WeakObject = new WeakObject();
		/**@private */
		private static _keys:any = {};
		/**@private */
		private static _maps:any[] = [];
		/**@private */
		 _obj:any;
		
		/**@private */
		 static __init__():void {
			//WeakObject.supportWeakMap = Browser.window.WeakMap != null;
			//如果不支持，10分钟回收一次
			if (!WeakObject.supportWeakMap) (window as any).Laya.systemTimer.loop(WeakObject.delInterval, null, WeakObject.clearCache);
		}
		
		/**清理缓存，回收内存*/
		//TODO:coverage
		 static clearCache():void {
			for (var i:number = 0, n:number = WeakObject._maps.length; i < n; i++) {
				var obj:WeakObject = WeakObject._maps[i];
				obj._obj = {};
			}
		}
		
		constructor(){
			this._obj = WeakObject.supportWeakMap ? new Browser.window.WeakMap() : {};
			if (!WeakObject.supportWeakMap) WeakObject._maps.push(this);
		}
		
		/**
		 * 设置缓存
		 * @param	key kye对象，可被回收
		 * @param	value object对象，可被回收
		 */
		 set(key:any, value:any):void {
			if (key == null) return;
			if (WeakObject.supportWeakMap) {
				var objKey:any = key;
				if (key instanceof String || key instanceof Number) {
					objKey = WeakObject._keys[key as any];
					if (!objKey) objKey = WeakObject._keys[key as any] = {k: key};
				}
				this._obj.set(objKey, value);
			} else {
				if (key instanceof String || key instanceof Number) {
					this._obj[key as any] = value;
				} else {
					key.$_GID || (key.$_GID = Utils.getGID());
					this._obj[key.$_GID] = value;
				}
			}
		}
		
		/**
		 * 获取缓存
		 * @param	key kye对象，可被回收
		 */
		 get(key:any):any {
			if (key == null) return null;
			if (WeakObject.supportWeakMap) {
				var objKey:any = (key instanceof String || key instanceof Number) ? WeakObject._keys[key as any] : key;
				if (!objKey) return null;
				return this._obj.get(objKey);
			} else {
				if (key instanceof String || key instanceof Number) return this._obj[key as any];
				return this._obj[key.$_GID];
			}
		}
		
		/**
		 * 删除缓存
		 */
		//TODO:coverage
		 del(key:any):void {
			if (key == null) return;
			if (WeakObject.supportWeakMap) {
				var objKey:any = (key instanceof String || key instanceof Number) ? WeakObject._keys[key as any] : key;
				if (!objKey) return;
				this._obj.delete(objKey);
			} else {
				if (key instanceof String || key instanceof Number) delete this._obj[key as any];
				else delete this._obj[this._obj.$_GID];
			}
		}
		
		/**
		 * 是否有缓存
		 */
		//TODO:coverage
		 has(key:any):boolean {
			if (key == null) return false;
			if (WeakObject.supportWeakMap) {
				var objKey:any = (key instanceof String || key instanceof Number) ? WeakObject._keys[key as any] : key;
				return this._obj.has(objKey);
			} else {
				if (key instanceof String || key instanceof Number) return this._obj[key as any] != null;
				return this._obj[this._obj.$_GID] != null;
			}
		}
	}

//WeakObject.__init__();