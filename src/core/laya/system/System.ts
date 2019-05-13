import { Laya } from "./../../Laya";
	
	/**
	 * @private
	 */
	export class System {
		/**
		 * 替换指定名称的定义。用来动态更改类的定义。
		 * @param	name 属性名。
		 * @param	classObj 属性值。
		 */
		//TODO:coverage
		 static changeDefinition(name:string, classObj:any):void {
			Laya[name] = classObj;
			var str:string = name + "=classObj";
			Laya._runScript(str);
		}
		
		/**
		 * @private
		 * 初始化。
		 */
		 static __init__():void {
		}
	}

