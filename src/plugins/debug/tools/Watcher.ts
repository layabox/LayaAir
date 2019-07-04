import { DifferTool } from "./DifferTool";
///////////////////////////////////////////////////////////
//  Watcher.as
//  Macromedia ActionScript Implementation of the Class Watcher
//  Created on:      2015-10-23 下午4:18:27
//  Original author: ww
///////////////////////////////////////////////////////////

import { FunHook } from "./hook/FunHook"
	import { VarHook } from "./hook/VarHook"
	
	/**
	 * 本类用于监控对象值变化
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-23 下午4:18:27
	 */
	export class Watcher
	{
		constructor(){
		}
		 static watch(obj:any,name:string,funs:any[]):void
		{
			VarHook.hookVar(obj,name,funs);
		}
		 static traceChange(obj:any,name:string,sign:string="var changed:"):void
		{
			VarHook.hookVar(obj,name,[Watcher.getTraceValueFun(name),VarHook.getLocFun(sign)]);
		}
		 static debugChange(obj:any,name:string):void
		{
			VarHook.hookVar(obj,name,[VarHook.getLocFun("debug loc"),FunHook.debugHere]);
		}
		 static differChange(obj:any,name:string,sign:string,msg:string=""):void
		{
			VarHook.hookVar(obj,name,[Watcher.getDifferFun(obj,name,sign,msg)]);
		}
		 static getDifferFun(obj:any,name:string,sign:string,msg:string=""):Function
		{
			var rst:Function;
			
			rst=function():void
			{
				DifferTool.differ(sign,obj[name],msg);
			}
			return rst;
		}
		 static traceValue(value:any):void
		{
			console.log("value:",value);
		}
		 static getTraceValueFun(name:string):Function
		{
			var rst:Function;
			
			rst=function(value:any):void
			{
				console.log("set "+name+" :",value);
			}
			return rst;
		}
	}

