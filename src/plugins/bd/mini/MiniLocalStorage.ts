import { BMiniAdapter } from "./BMiniAdapter";
/** @private **/
	export class MiniLocalStorage
	{
		/**
		 * 表示是否支持  <code>LocalStorage</code>。
		 */
		 static support:boolean = true;
		/**
		 *  数据列表。
		 */
		 static items:any;
		constructor(){
		}
		 static __init__():void {
			MiniLocalStorage.items = MiniLocalStorage;
		}
		
		/**
		 * 存储指定键名和键值，字符串类型。
		 * @param key 键名。
		 * @param value 键值。
		 */
		 static setItem(key:string, value:any):void {
			BMiniAdapter.window.swan.setStorageSync(key,value);
		}
		
		/**
		 * 获取指定键名的值。
		 * @param key 键名。
		 * @return 字符串型值。
		 */
		 static getItem(key:string):string {
			return BMiniAdapter.window.swan.getStorageSync(key);
		}
		
		/**
		 * 存储指定键名及其对应的 <code>Object</code> 类型值。
		 * @param key 键名。
		 * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
		 */
		 static setJSON(key:string, value:any):void {
			MiniLocalStorage.setItem(key, value);
		}
		
		/**
		 * 获取指定键名对应的 <code>Object</code> 类型值。
		 * @param key 键名。
		 * @return <code>Object</code> 类型值
		 */
		 static getJSON(key:string):any {
			return MiniLocalStorage.getItem(key);
		}
		
		/**
		 * 删除指定键名的信息。
		 * @param key 键名。
		 */
		 static removeItem(key:string):void {
			BMiniAdapter.window.swan.removeStorageSync(key);
		}
		
		/**
		 * 清除本地存储信息。
		 */
		 static clear():void {
			BMiniAdapter.window.swan.clearStorageSync();
		}
		
		/**同步获取当前storage的相关信息**/
		 static getStorageInfoSync():any
		{
			try {
				var res:any =BMiniAdapter.window.swan.getStorageInfoSync();
				console.log(res.keys)
				console.log(res.currentSize)
				console.log(res.limitSize)
				return res;
			} catch (e) {
			}
			return null;
		}
	}

