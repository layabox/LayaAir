///////////////////////////////////////////////////////////
//  SingleTool.as
//  Macromedia ActionScript Implementation of the Class SingleTool
//  Created on:      2016-6-24 下午6:07:30
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2016-6-24 下午6:07:30
	 */
	export class SingleTool
	{
		constructor(){
		}
		private static _instance:SingleTool;

		static get I():SingleTool{
			if(!SingleTool._instance){
				SingleTool._instance = new SingleTool();
			}
			return SingleTool._instance;
		}
		static set I(value){
			SingleTool._instance = value;
		}
		
		private _objDic:any={};
		getArr(sign:string):any[]
		{
			var dic:any;
			dic=this.getTypeDic("Array");
			if(!dic[sign]) dic[sign]=[];
			return dic[sign];
		}
		getObject(sign:string):any
		{
			var dic:any;
			dic=this.getTypeDic("Object");
			if(!dic[sign]) dic[sign]={};
			return dic[sign];
		}
		getByClass(sign:string,clzSign:string,clz:new()=>any):any
		{
			var dic:any;
			dic=this.getTypeDic(clzSign);
			if(!dic[sign]) dic[sign]=new clz();
			return dic[sign];
		}
		getTypeDic(type:string):any
		{
			if(!this._objDic[type]) this._objDic[type]={};
			return this._objDic[type];
		}
	}

