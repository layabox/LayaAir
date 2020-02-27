import { ObjectTools } from "./ObjectTools";
import { Node } from "laya/display/Node";
///////////////////////////////////////////////////////////
//  ClassTool.as
//  Macromedia ActionScript Implementation of the Class ClassTool
//  Created on:      2015-10-23 下午2:24:04
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-23 下午2:24:04
	 */
	export class ClassTool
	{
		constructor(){
		}
		
		static defineProperty(obj:any,name:string,des:any):void
		{
			Object.defineProperty(obj,name,des);;
		}
		
		static getOwnPropertyDescriptor(obj:any,name:string):any
		{
			var rst:any;
			rst=Object.getOwnPropertyDescriptor(obj,name);;
			return rst;
		}
		
		static getOwnPropertyDescriptors(obj:any):any
		{
			var rst:any;
			rst=Object.getOwnPropertyDescriptors(obj);;
			return rst;
		}

		static getOwnPropertyNames(obj:any):any[]
		{
			var rst:any[];
			rst=Object.getOwnPropertyNames(obj);;
			return rst;
		}

		static getObjectGetSetKeys(obj:any,rst:any[]=null):any[]
		{
			if (!rst) rst = [];
			var keys:any[];
			//keys = ClassTool.getOwnPropertyDescriptors(obj);
			keys = ClassTool.getOwnPropertyNames(obj);
			//trace("keys", getOwnPropertyNames(obj));
			//trace("keys", Object.getOwnPropertySymbols(obj));
			//trace("keys",Object.keys(obj));
			var key:string;
			for (key in keys)
			{
				key = keys[key];
				if (key.indexOf("_$get_")>=0)
				{
					key = key.replace("_$get_", "");
					rst.push(key);
				}
			}
			if (obj["__proto__"])
			{
				ClassTool.getObjectGetSetKeys(obj["__proto__"],rst);
			}
			return rst;
		}
		
		static displayTypes:any = { "boolean":true, "number":true, "string":true };
		static getObjectDisplayAbleKeys(obj:any,rst:any[]=null):any[]
		{
			if (!rst) rst = [];

			for (let key in obj) {
				let tValue = obj[key];
				let tType = typeof(tValue);
				if (key.charAt(0) == "_" ||!this.displayTypes[tType]) continue;
				rst.push(key);
			}
			let temp = obj;
			//获取所有的getset
			while(temp){
				let descript:any = Object.getOwnPropertyDescriptors(temp);
				for (let element in descript) {
					let tValue = descript[element];
					if(!tValue.get)continue
					rst.push(element);
				}
				temp = Object.getPrototypeOf(temp);
			}

			ClassTool.getObjectGetSetKeys(obj, rst);
			rst = ObjectTools.getNoSameArr(rst);
			return rst;
		}

		static getClassName(tar:any):string
		{
			if (tar instanceof Function) return tar.name;
			return tar["constructor"].name;
		}

		static getNodeClassAndName(tar:any):string
		{
			if (!tar) return "null";
			var rst:string;
			if (tar.name)
			{
				rst = ClassTool.getClassName(tar) + "("+tar.name+")";
			}else
			{
				rst = ClassTool.getClassName(tar);
			}
			return rst;
		}

		static getClassNameByClz(clz:new()=>any):string
		{
			return clz["name"];
		}

		static getClassByName(className:string):new()=>any
		{
			var rst:new()=>any;
			rst = window["eval"](className);
			return rst;
		}

		static createObjByName(className:string):any
		{
			var clz:new()=>any;
			clz=ClassTool.getClassByName(className);
			return new clz();
		}
	}

