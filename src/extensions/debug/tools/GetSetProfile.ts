import { ClassTool } from "./ClassTool";
import { IDTools } from "./IDTools";
import { ObjectTools } from "./ObjectTools";
import { FunHook } from "./hook/FunHook"
import { MathUtil } from "laya/maths/MathUtil"
	
	/**
	 * ...
	 * @author ww
	 */
	export class GetSetProfile {
		
		private static _inited:boolean = false;
		private static handlerO:any;
		private static noDisplayKeys:any = {"conchModel": true};
		
		private static removeNoDisplayKeys(arr:any[]):void {
			var i:number;
			for (i = arr.length - 1; i >= 0; i--) {
				if (GetSetProfile.noDisplayKeys[arr[i]]) {
					arr.splice(i, 1);
				}
			}
		}
		private static ALL:string = "ALL";
		private static countDic:any = {};
		private static getClassCount(className:string):number
		{
			return GetSetProfile.countDic[className];
		}
		private static addClassCount(className:string):void {
			if (!GetSetProfile.countDic[className]) {
				GetSetProfile.countDic[className] = 1;
			}
			else {
				GetSetProfile.countDic[className] = GetSetProfile.countDic[className] + 1;
			}
		}
		
		 static init():void {
			if (GetSetProfile._inited)
				return;
			GetSetProfile._inited = true;
			var createFun:Function = function(sp:any):void {
				GetSetProfile.classCreated(sp);
			}
			FunHook.hook(Node, "call", null, createFun);
			GetSetProfile.handlerO = {};
			GetSetProfile.handlerO["get"] = function(target:any, key:any, receiver:any):any {
				console.log("get", target, key, receiver);
				return Reflect.get(target, key, receiver);
			};
			GetSetProfile.handlerO["set"] = function(target:any, key:any, value:any, receiver:any):any {
				console.log("set", target, key, value, receiver);
				return Reflect.set(target, key, value, receiver);
			}
		}
		private static fromMe:boolean = false;
		
		private static classCreated(obj:any, oClas:new()=>any=null):void {
			if (GetSetProfile.fromMe)
				return;
			var className:string;
			className = ClassTool.getClassName(obj);
			GetSetProfile.addClassCount(className);
			GetSetProfile.addClassCount(GetSetProfile.ALL);
			IDTools.idObj(obj);
			var classDes:any[];
			classDes = GetSetProfile.hookClassDic[className];
			if (!classDes) {
				GetSetProfile.profileClass(obj["constructor"]);
				classDes = GetSetProfile.hookClassDic[className];
				if (!classDes)
					return;
			}
			
			GetSetProfile.hookObj2(obj, classDes);
		}
		
		private static hookObj(obj:any, keys:any[]):void {
			
			var handler:any = GetSetProfile.handlerO;
			new Proxy(obj,handler);
		}
		
		private static hookObj2(obj:any, keys:any[]):void {
			
			var i:number, len:number;
			len = keys.length;
			for (i = 0; i < len; i++) {
				GetSetProfile.hookVar(obj, keys[i]);
			}
		}
		private static hookClassDic:any = {};
		
		private static profileClass(clz:new()=>any):void {
			var className:string;
			className = ClassTool.getClassName(clz);
			//Browser.window[className] = function() {
				//trace("aa")
			//};
			GetSetProfile.fromMe = true;
			var tO:any = new clz();
			GetSetProfile.fromMe = false;
			var keys:any[];
			keys = ClassTool.getObjectDisplayAbleKeys(tO);
			keys = ObjectTools.getNoSameArr(keys);
			var i:number, len:number;
			len = keys.length;
			var tV:any;
			var key:string;
			for (i = len - 1; i >= 0; i--) {
				
				key = keys[i];
				tV = tO[key];
				if (tV instanceof Function) {
					keys.splice(i, 1);
				}
			}
			
			len = keys.length;
			GetSetProfile.removeNoDisplayKeys(keys);
			GetSetProfile.hookClassDic[className] = keys;
		}
		
		private static hookPrototype(tO:any, key:string):void {
			console.log("hook:", key);
			try {
				GetSetProfile.hookVar(tO, key);
			}
			catch (e) {
				console.log("fail", key);
			}
		
		}
		
		private static infoDic:any = {};
		
		private static reportCall(obj:any, name:string, type:string):void {
			IDTools.idObj(obj);
			var objID:number;
			objID = IDTools.getObjID(obj);
			var className:string;
			
			className = ClassTool.getClassName(obj);
			
			GetSetProfile.recordInfo(className, name, type, objID);
			GetSetProfile.recordInfo(GetSetProfile.ALL, name, type, objID);
		}
		
		private static recordInfo(className:string, name:string, type:string, objID:number):void {
			var propCallsDic:any;
			if (!GetSetProfile.infoDic[className]) {
				GetSetProfile.infoDic[className] = {};
			}
			propCallsDic = GetSetProfile.infoDic[className];
			var propCalls:any;
			if (!propCallsDic[name]) {
				propCallsDic[name] = {};
			}
			propCalls = propCallsDic[name];
			var propCallO:any;
			if (!propCalls[type]) {
				propCalls[type] = {};
			}
			propCallO = propCalls[type];
			if (!propCallO[objID]) {
				propCallO[objID] = 1;
				if (!propCallO["objCount"]) {
					propCallO["objCount"] = 1;
				}
				else {
					propCallO["objCount"] = propCallO["objCount"] + 1;
				}
			}
			else {
				propCallO[objID] = propCallO[objID] + 1;
			}
			if (!propCallO["count"]) {
				propCallO["count"] = 1;
			}
			else {
				propCallO["count"] = propCallO["count"] + 1;
			}
		}
		
		private static showInfo():void {
			var rstO:any;
			rstO = { };
			var rstO1:any;
			rstO1 = { };
			var arr:any[];
			arr = [];
			var arr1:any[];
			arr1 = [];
			var className:string;
			var keyName:string;
			var type:string;
			for (className in GetSetProfile.infoDic)
			{
				var tClassO:any;
				var tClassO1:any;
				tClassO = GetSetProfile.infoDic[className];
				rstO[className]=tClassO1 = { };
				for (keyName in tClassO)
				{
					var tKeyO:any;
					var tKeyO1:any;
					tKeyO = tClassO[keyName];
					tClassO1[keyName]=tKeyO1 = { };
					for(type in tKeyO)
					{
						var tDataO:any;
						var tDataO1:any;
						tDataO = tKeyO[type];
						
						tDataO["rate"] = tDataO["objCount"] / GetSetProfile.getClassCount(className);
						tKeyO1[type] = tDataO["rate"];
						var tSKey:string;
						tSKey = className + "_" + keyName + "_" + type;
						rstO1[tSKey] = tDataO["rate"];
						if (className == GetSetProfile.ALL)
						{
							if (type == "get")
							{
								arr.push([tSKey,tDataO["rate"],tDataO["count"]]);
							}else
							{
								arr1.push([tSKey,tDataO["rate"],tDataO["count"]]);
							}
							
						}
					}
				}
			}
			console.log(GetSetProfile.infoDic);
			console.log(GetSetProfile.countDic);
			console.log(rstO);
			console.log(rstO1);
			console.log("nodeCount:",GetSetProfile.getClassCount(GetSetProfile.ALL));

			console.log("sort by rate");
			GetSetProfile.showStaticInfo(arr, arr1, "1");
			console.log("sort by count");
			GetSetProfile.showStaticInfo(arr, arr1, "2");
		}
		
		private static showStaticInfo(arr:any[], arr1:any[], sortKey:string):void
		{
			console.log("get:");
			GetSetProfile.showStaticArray(arr,sortKey);
			console.log("set:");
			GetSetProfile.showStaticArray(arr1,sortKey);
		}
		private static showStaticArray(arr:any[],sortKey:string="1"):void
		{
			arr.sort(MathUtil.sortByKey(sortKey, true, true));
			var i:number, len:number;
			len = arr.length;
			var tArr:any[];
			for (i = 0; i < len; i++)
			{
				tArr = arr[i];
				console.log(tArr[0],Math.floor(tArr[1]*100),tArr[2]);
			}
		}
		private static hookVar(obj:any, name:string, setHook:any[] = null, getHook:any[] = null):void {
			if (!setHook)
				setHook = [];
			if (!getHook)
				getHook = [];
			var preO:any = obj;
			var preValue:any;
			var newKey:string = "___@" + newKey;
			var des:any;
			des = ClassTool.getOwnPropertyDescriptor(obj, name);
			var ndes:any = {};
			var mSet:Function = function(value:any):void {
				//trace("var hook set "+name+":",value);
				preValue = value;
			};
			
			var mGet:Function = function():any {
				//trace("var hook get"+name+":",preValue);
				return preValue;
			}
			
			var mSet1:Function = function(value:any):void {
				//trace("var hook set " + name + ":", value);
				var _t:any = this;
				GetSetProfile.reportCall(_t, name, "set");
			};
			
			var mGet1:Function = function():any {
				var _t:any = this;
				GetSetProfile.reportCall(_t, name, "get");
				return preValue;
			}
			
			getHook.push(mGet1);
			setHook.push(mSet1);
			
			while (!des && obj["__proto__"]) {
				
				obj = obj["__proto__"];
				des = ClassTool.getOwnPropertyDescriptor(obj, name);
				
			}
			if (des) {
				ndes.set = des.set ? des.set : mSet;
				ndes.get = des.get ? des.get : mGet;
				if (!des.get) {
					preValue = preO[name];
				}
				ndes.enumerable = des.enumerable;
				setHook.push(ndes.set);
				getHook.push(ndes.get);
				FunHook.hookFuns(ndes, "set", setHook);
				FunHook.hookFuns(ndes, "get", getHook, getHook.length - 1);
				//delete obj[name];
				ClassTool.defineProperty(preO, name, ndes);
			}
			if (!des) {
				//trace("get des fail add directly");
				ndes.set = mSet;
				ndes.get = mGet;
				preValue = preO[name];
				//ndes.enumerable=des.enumerable;
				setHook.push(ndes.set);
				getHook.push(ndes.get);
				FunHook.hookFuns(ndes, "set", setHook);
				FunHook.hookFuns(ndes, "get", getHook, getHook.length - 1);
				//delete obj[name];
				ClassTool.defineProperty(preO, name, ndes);
			}
		
		}
	}


