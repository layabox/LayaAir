import { DisControlTool } from "./DisControlTool";
///////////////////////////////////////////////////////////
//  WalkTools.as
//  Macromedia ActionScript Implementation of the Class WalkTools
//  Created on:      2015-9-24 下午6:15:01
//  Original author: ww
///////////////////////////////////////////////////////////

import { Node } from "laya/display/Node"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-9-24 下午6:15:01
	 */
	export class WalkTools
	{
		constructor(){
		}
		 static walkTarget(target:Node,fun:Function,_this:any=null):void
		{			
			fun.apply(_this,[target]);
			var i:number;
			var len:number;
			var tChild:Node;
			len=target.numChildren;
			for(i=0;i<len;i++)
			{
				tChild=target.getChildAt(i);
//				fun.apply(_this,[tChild]);
				WalkTools.walkTarget(tChild,fun,tChild);
			}
		}
		 static walkTargetEX(target:Node,fun:Function,_this:any=null,filterFun:Function=null):void
		{			
			if (filterFun != null && !filterFun(target)) return;
			fun.apply(_this,[target]);
			var i:number;
			var len:number;
			var tChild:Node;
			var childs:any[];
			childs = (target as any)._children;
			len=childs.length;
			for(i=0;i<len;i++)
			{
				tChild=childs[i];
//				fun.apply(_this,[tChild]);
				WalkTools.walkTarget(tChild,fun,tChild);
			}
		}
		 static walkChildren(target:Node,fun:Function,_this:any=null):void
		{
		     if(!target||target.numChildren<1) return;
			 WalkTools.walkArr(DisControlTool.getAllChild(target),fun,_this);
		}
		 static walkArr(arr:ReadonlyArray<any>,fun:Function,_this:any=null):void
		{
			if(!arr) return;
			var i:number;
			var len:number;
			len=arr.length;
			for(i=0;i<len;i++)
			{
				fun.apply(_this,[arr[i],i]);
			}
		}
	}

