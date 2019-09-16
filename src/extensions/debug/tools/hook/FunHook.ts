///////////////////////////////////////////////////////////
//  FunHook.as
//  Macromedia ActionScript Implementation of the Class FunHook
//  Created on:      2015-10-23 下午1:13:13
//  Original author: ww
///////////////////////////////////////////////////////////

import { ClassTool } from "../ClassTool"
	import { TraceTool } from "../TraceTool"
	
	/**
	 * 本类用于在对象的函数上挂钩子
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-23 下午1:13:13
	 */
	export class FunHook
	{
		constructor(){
		}
		 static hook(obj:any,funName:string,preFun:Function=null,aftFun:Function=null):void
		{
			FunHook.hookFuns(obj,funName,[preFun,obj[funName],aftFun],1);
		}
		 static special:any = {
			"length":true,
			"name":true,
			"arguments":true,
			"caller":true,
			"prototype":true,
			//"keys":true,
			//"create":true,
			//"defineProperty":true,
			////"defineProperties":true,
			//"getPrototypeOf":true,
			//"setPrototypeOf":true,
			//"getOwnPropertyDescriptor":true,
			//"getOwnPropertyNames":true,
			"is":true,
			"isExtensible":true,
			"isFrozen":true,
			"isSealed":true,
			"preventExtensions":true,
			"seal":true,
			//"getOwnPropertySymbols":true,
			//"deliverChangeRecords":true,
			//"getNotifier":true,
			//"observe":true,
			"apply":true,
			"call":true,
			"bind":true,
			"freeze":true,
			//"assign":true,
			"unobserve":true
			};
		 static hookAllFun(obj:any):void
		{
			var key:string;
			var arr:any[];
			arr=ClassTool.getOwnPropertyNames(obj);
			for(key in arr)
			{
				key = arr[key];
				if (FunHook.special[key]) continue;
				console.log("try hook:",key);
				if(obj[key] instanceof Function)
				{
					console.log("hook:",key);
					FunHook.hookFuns(obj, key, [FunHook.getTraceMsg("call:" + key), obj[key]], 1);
				}
			}
			if(obj["__proto__"])
			{
				FunHook.hookAllFun(obj["__proto__"]);
			}else
			{
				console.log("end:",obj);
			}
		}
		private static getTraceMsg(msg:string):Function
		{
		   var rst:Function;
		   rst=function():void
		   {
			   console.log(msg);
		   }
		   return rst;
		}
		 static hookFuns(obj:any,funName:string,funList:any[],rstI:number=-1):void
		{
			var _preFun:Function=obj[funName];
			var newFun:Function;
			
			newFun=function(...args):any
			{
	
				var rst:any;
				var i:number;
				var len:number;
				len=funList.length;
				for(i=0;i<len;i++)
				{
					if(!funList[i]) continue;
					if(i==rstI)
					{
						rst=funList[i].apply(this,args);
					}else
					{
						funList[i].apply(this,args);
					}
				}

				return rst;
			};
			newFun["pre"]=_preFun;
			obj[funName]=newFun;
		}
		 static removeHook(obj:any,funName:string):void
		{
			if(obj[funName].pre!=null)
			{
				obj[funName]=obj[funName].pre;
			}
			
		}
		 static debugHere():void
		{
			debugger;;

		}
		
		 static traceLoc(level:number=0,msg:string=""):void
		{
			console.log(msg,"fun loc:",TraceTool.getCallLoc(3+level));
		}
		
		 static getLocFun(level:number=0,msg:string=""):Function
        {
			level += 1;

			var rst:Function;
			rst=function ():void
			{
				FunHook.traceLoc(level,msg);
			}
			return rst;
		}		
	}

