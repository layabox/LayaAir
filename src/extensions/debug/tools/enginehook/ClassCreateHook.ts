import { ClassTool } from "../ClassTool"
import { FunHook } from "../hook/FunHook"
import { RunProfile } from "../RunProfile"
	/**
	 * ...
	 * @author ww
	 */
	export class ClassCreateHook 
	{
		private static _instance:ClassCreateHook;
		static get I():ClassCreateHook{
			if(!ClassCreateHook._instance){
				ClassCreateHook._instance = new ClassCreateHook();
			}
			return ClassCreateHook._instance;
		}
		static set I(value){
			ClassCreateHook._instance = value;
		}
		
		constructor(){
			
		}
		static isInited:boolean = false;
		hookClass(clz:new()=>any):void
		{
			if (ClassCreateHook.isInited) return;
			ClassCreateHook.isInited = true;
			var createFun:Function=function(sp:any):void
		    {
			    this.classCreated(sp,clz);
		    }
			FunHook.hook(clz, "call", createFun);
		}
		
		createInfo:any = { };
		classCreated(clz:new()=>any,oClass:new()=>any):void
		{
			var key:string;
			key = ClassTool.getNodeClassAndName(clz);
			var depth:number = 0;
			var tClz:new()=>any;
			tClz = clz;
			while (tClz && tClz != oClass)
			{
				tClz = tClz.prototype;
				depth++;
			} 
			
			if (!ClassCreateHook.I.createInfo[key])
			{
				ClassCreateHook.I.createInfo[key] = 0;
			}
			ClassCreateHook.I.createInfo[key] = ClassCreateHook.I.createInfo[key] + 1;
			//trace("create:",key,clz);
			//RunProfile.showClassCreate(key);
			RunProfile.run(key, depth+6);
		}
		
		getClassCreateInfo(clz:new()=>any):any
		{
			var key:string;
			key=ClassTool.getClassName(clz);
			return RunProfile.getRunInfo(key);
		}
	}


