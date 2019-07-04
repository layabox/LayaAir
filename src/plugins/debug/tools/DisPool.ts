import { ClassTool } from "./ClassTool";
///////////////////////////////////////////////////////////
//  DisPool.as
//  Macromedia ActionScript Implementation of the Class DisPool
//  Created on:      2015-11-13 下午8:05:13
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 简单的显示对象对象池
	 * 从父容器上移除时即被视为可被重用
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-11-13 下午8:05:13
	 */
	export class DisPool
	{
		constructor(){
		}
		private static _objDic:any={};
		 static getDis(clz:new()=>any):any
		{
			var clzName:string;
			clzName=ClassTool.getClassNameByClz(clz);
			if(!DisPool._objDic[clzName])
			{
				DisPool._objDic[clzName]=[];
			}
			var disList:any[];
			disList=DisPool._objDic[clzName];
			var i:number,len:number;
			len=disList.length;
			for(i=0;i<len;i++)
			{
				if(!disList[i].parent)
				{
					return disList[i];
				}
			}
			disList.push(new clz());
			return disList[disList.length-1];
		}
		
	}

