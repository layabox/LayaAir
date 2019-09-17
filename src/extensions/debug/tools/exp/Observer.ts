///////////////////////////////////////////////////////////
//  Observer.as
//  Macromedia ActionScript Implementation of the Class Observer
//  Created on:      2015-10-26 上午9:35:45
//  Original author: ww
///////////////////////////////////////////////////////////

import { DifferTool } from "../DifferTool"
	
	/**
	 * 本类调用原生observe接口，仅支持部分浏览器，chrome有效
	 * 变化输出为异步方式,所以无法跟踪到是什么函数导致变化
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-26 上午9:35:45
	 */
	export class Observer
	{
		constructor(){
		}
		
		static observe(obj:any,callBack:Function):void
		{
			// Object.observe(obj, callBack);
		}
		static unobserve(obj:any,callBack:Function):void
		{
			// Object.unobserve(obj, callBack);
		}
		
		static observeDiffer(obj:any,sign:string,msg:string="obDiffer"):void
		{
			var differFun:Function=function():void
			{
				DifferTool.differ(sign,obj,msg);
			}
			Observer.observe(obj,differFun);
		}
	}

