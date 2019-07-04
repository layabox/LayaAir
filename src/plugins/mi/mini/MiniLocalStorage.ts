import { KGMiniAdapter } from "./KGMiniAdapter";
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
			KGMiniAdapter.window.qg.storage.setSync({key: key,value: value})
		}
		
		/**
		 * 获取指定键名的值。
		 * @param key 键名。
		 * @return 字符串型值。
		 */
		 static getItem(key:string):any {
			var tempData:any = KGMiniAdapter.window.qg.storage.getSync({key:key})
			return  tempData;
		}
		
		/**
		 * 存储指定键名及其对应的 <code>Object</code> 类型值。
		 * @param key 键名。
		 * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
		 */
		 static setJSON(key:string, value:any):void {
			try
			{
				MiniLocalStorage.setItem(key, JSON.stringify(value));
			} 
			catch(error) 
			{
				MiniLocalStorage.setItem(key, value);
			}
		}
		
		/**
		 * 获取指定键名对应的 <code>Object</code> 类型值。
		 * @param key 键名。
		 * @return <code>Object</code> 类型值
		 */
		 static getJSON(key:string):any {
			var tempData:any = MiniLocalStorage.getItem(key);
			try
			{
				return JSON.parse(tempData);
			} 
			catch(error) 
			{
				return tempData;
			}
		}
		
		/**
		 * 删除指定键名的信息。
		 * @param key 键名。
		 */
		 static removeItem(key:string):void {
			KGMiniAdapter.window.qg.storage.delete({
				key: key,
				success: function(data) :void
				{
					console.log('handling success')
				},
				fail: function(data, code) :void
				{
					console.log("====removeItem data fail code:" + code);
				}
			})
		}
		
		/**
		 * 清除本地存储信息。
		 */
		 static clear():void {
			KGMiniAdapter.window.qg.storage.clear({
				success: function(data) :void
				{
					console.log('handling success')
				},
				fail: function(data, code) :void
				{
					console.log("====clear data fail code:" + code);
				}
			})
		}
		
		/**同步获取当前storage的相关信息**/
		 static getStorageInfoSync():any
		{
			return null;
		}
	}

