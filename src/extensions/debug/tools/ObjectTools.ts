import { StringTool } from "./StringTool";
///////////////////////////////////////////////////////////
//  ObjectTools.as
//  Macromedia ActionScript Implementation of the Class ObjectTools
//  Created on:      2015-10-21 下午2:03:36
//  Original author: ww
///////////////////////////////////////////////////////////

import { Sprite } from "laya/display/Sprite"
	
	/**
	 * 本类提供obj相关的一些操作
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-21 下午2:03:36
	 */
	export class ObjectTools
	{
		constructor(){
		}
		 static sign:string="_";
		 static getFlatKey(tKey:string,aKey:string):string
		{
			if(tKey=="") return aKey;
			return tKey+ObjectTools.sign+aKey;
		}
		 static flatObj(obj:any,rst:any=null,tKey:string=""):any
		{
			rst=rst?rst:{};
			var key:string;
			var tValue:any;
			for(key in obj)
			{
				if(obj[key] instanceof Object)
				{
					ObjectTools.flatObj(obj[key],rst,ObjectTools.getFlatKey(tKey,key));
				}else
				{
					tValue=obj[key];
					//if(tValue is String||tValue is Number)
					rst[ObjectTools.getFlatKey(tKey,key)]=obj[key];
				}
			}
			
			return rst;
		}
		 static recoverObj(obj:any):any
		{
			var rst:any={};
			var tKey:string;
			for(tKey in obj)
			{
				ObjectTools.setKeyValue(rst,tKey,obj[tKey]);
			}
			return rst;
			
		}
		 static differ(objA:any,objB:any):any
		{
			var tKey:string;
			var valueA:string;
			var valueB:string;
			objA=ObjectTools.flatObj(objA);
			objB=ObjectTools.flatObj(objB);
			
			var rst:any={};
			for(tKey in objA)
			{
				if(!objB.hasOwnProperty(tKey))
				{
					rst[tKey]="被删除";
				}
			}
			
			for(tKey in objB)
			{
				if(objB[tKey]!=objA[tKey])
				{
					rst[tKey]={"pre":objA[tKey],"now":objB[tKey]};
				}
			}
			
			return rst;
		}
		 static traceDifferObj(obj:any):void
		{
			var key:string;
			var tO:any;
			for(key in obj)
			{
				if(obj[key] instanceof String)
				{
					console.log(key+":",obj[key]);
				}else
				{
					tO=obj[key];
					console.log(key+":","now:",tO["now"],"pre:",tO["pre"]);
				}
			}
		}
		 static setKeyValue(obj:any,flatKey:string,value:any):void
		{
			if(flatKey.indexOf(ObjectTools.sign)>=0)
			{
				var keys:any[]=flatKey.split(ObjectTools.sign);
				var tKey:string;
				while(keys.length>1)
				{
					tKey=keys.shift();
					if(!obj[tKey])
					{
						obj[tKey]={};
						console.log("addKeyObj:",tKey);
					}
					obj=obj[tKey];
					if(!obj)
					{
						console.log("wrong flatKey:",flatKey);
						return;
					}
				}
				obj[keys.shift()]=value;
			}else
			{
				obj[flatKey]=value;
			}
		}
		 static clearObj(obj:any):void
		{
			var key:string;
			for (key in obj)
			{
				delete obj[key];
			}
		}
		 static copyObjFast(obj:any):any
		{
			var jsStr:string;
			jsStr=ObjectTools.getJsonString(obj);
			return ObjectTools.getObj(jsStr);
			
		}
		 static copyObj(obj:any):any
		{
			if(obj instanceof Array) return ObjectTools.copyArr((<any[]>obj ));
			var rst:any={};
			var key:string;
			for(key in obj)
			{
				if(obj[key]===null||obj[key]===undefined)
				{
					rst[key]=obj[key];
				}else
				if(obj[key] instanceof Array)
				{
					rst[key]=ObjectTools.copyArr(obj[key]);
				}
				else
					if(obj[key] instanceof Object)
					{
						rst[key]=ObjectTools.copyObj(obj[key]);
					}else
					{
						rst[key]=obj[key];
					}
			}
			return rst;
		}
		 static copyArr(arr:any[]):any[]
		{
			var rst:any[];
			rst=[];
			var i:number,len:number;
			len=arr.length;
			for(i=0;i<len;i++)
			{
				rst.push(ObjectTools.copyObj(arr[i]));
			}
			return rst;
		}
		 static concatArr(src:any[], a:any[]):any[] {
			if (!a) return src;
			if (!src) return a;
			var i:number, len:number = a.length;
			for (i = 0; i < len; i++) {
				src.push(a[i]);
			}
			return src;
		}
		 static insertArrToArr(src:any[], insertArr:any[], pos:number = 0):any[]
		{
			if (pos < 0) pos = 0;
			if (pos > src.length) pos = src.length;
			var preLen:number = src.length;
			var i:number, len:number;
			src.length += insertArr.length;
			var moveLen:number;
			moveLen = insertArr.length;
			for (i = src.length - 1; i >= pos; i--)
			{
				src[i] = src[i - moveLen];
			}
			len = insertArr.length;
			for (i = 0; i < len; i++)
			{
				src[pos + i] = insertArr[i];
			}
			
			return src;
		}
		 static clearArr(arr:any[]):any[] {
			if (!arr) return arr;
			arr.length = 0;
			return arr;
		}
		
		 static removeFromArr(arr:any[],item:any):void
		{
			var i:number,len:number;
			len=arr.length;
			for(i=0;i<len;i++)
			{
				if(arr[i]==item)
				{
					arr[i].splice(i,1);
					return;
				}
			}
		}
		 static setValueArr(src:any[], v:any[]):any[] {
			src || (src = []);
			src.length = 0;
			return ObjectTools.concatArr(src, v);
		}
		
		 static getFrom(rst:any[], src:any[], count:number):any[] {
			var i:number;
			for (i = 0; i < count; i++) {
				rst.push(src[i]);
			}
			return rst;
		}
		
		 static getFromR(rst:any[], src:any[], count:number):any[] {
			var i:number;
			for (i = 0; i < count; i++) {
				rst.push(src.pop());
			}
			return rst;
		}
		 static enableDisplayTree(dis:Sprite):void {
			
			while (dis) {
				dis.mouseEnabled = true;
				dis = (<Sprite>dis.parent );
			}
		}
		 static getJsonString(obj:any):string
		{
			var rst:string;
			rst=JSON.stringify(obj);
			return rst;
		}
		 static getObj(jsonStr:string):any
		{
			var rst:any;
			rst=JSON.parse(jsonStr);
			return rst;
		}
		
		 static getKeyArr(obj:any):any[]
		{
			var rst:any[];
			var key:string;
			rst=[];
			for(key in obj)
			{
				rst.push(key);
			}
			return rst;
		}
		 static getObjValues(dataList:any[],key:string):any[]
		{
			var rst:any[];
			var i:number,len:number;
			len=dataList.length;
			rst=[];
			for(i=0;i<len;i++)
			{
				rst.push(dataList[i][key]);
			}
			return rst;
		}
		 static hasKeys(obj:any,keys:any[]):boolean
		{
			var i:number,len:number;
			len=keys.length;
			for(i=0;i<len;i++)
			{
				if(!obj.hasOwnProperty(keys[i])) return false;
			}
			return true;
		}
		 static copyValueByArr(tar:any,src:any,keys:any[]):void
		{
			var i:number,len:number=keys.length;
			for(i=0;i<len;i++)
			{
				if(!(src[keys[i]]===null))
					tar[keys[i]]=src[keys[i]];
			}
		}
		 static getNoSameArr(arr:any[]):any[]
		{
			var i:number, len:number;
			var rst:any[];
			rst = [];
			var tItem:any;
			len = arr.length;
			for (i = 0; i < len; i++)
			{
				tItem = arr[i];
				if (rst.indexOf(tItem) < 0)
				{
					rst.push(tItem);
				}
			}
			return rst;
		}
		 static insertValue(tar:any, src:any):void
		{
			var key:string;
			for (key in src)
			{
				tar[key] = src[key];
			}
		}
		 static replaceValue(obj:any,replaceO:any):void
		{
			var key:string;
			for(key in obj)
			{
				if(replaceO.hasOwnProperty(obj[key]))
				{
					obj[key]=replaceO[obj[key]];
				}
				if(obj[key] instanceof Object)
				{
					ObjectTools.replaceValue(obj[key],replaceO);
				}
			}
		}
		 static setKeyValues(items:any[],key:string,value:any):void
		{
			var i:number,len:number;
			len=items.length;
			for(i=0;i<len;i++)
			{
				items[i][key]=value;
			}
		}
		 static findItemPos(items:any[],sign:string,value:any):number
		{
			var i:number,len:number;
			len=items.length;
			for(i=0;i<len;i++)
			{
				if(items[i][sign]==value)
				{
					return i;
				}
			}
			return -1;
		}
		 static setObjValue(obj:any,key:string,value:any):any
		{
			obj[key]=value;
			return obj;
		}
		 static setAutoTypeValue(obj:any,key:string,value:any):any
		{
			if(obj.hasOwnProperty(key))
			{
				if(ObjectTools.isNumber(obj[key]))
				{
					obj[key]=parseFloat(value);
				}else
				{
					obj[key]=value;
				}
			}else
			{
				obj[key]=value;
			}
			return obj;
		}
		 static getAutoValue(value:any):any
		{
			var tFloat:number=parseFloat(value);
			if(typeof(value)=="string")
			{
				if(tFloat+""===StringTool.trimSide(value)) return tFloat;
			}
//			if (parseFloat(value)==value) return parseFloat(value);
			return value;
		}
		 static isNumber(value:any):boolean
		{
			return  (parseFloat(value)==value);
		}
		 static isNaNS(value:any):boolean
		{
			return ( value.toString()=="NaN");
		}
		 static isNaN(value:any):boolean
		{
			if(typeof(value)=="number") return false;
			if(typeof(value)=="string")
			{
				if(parseFloat(value).toString()!="NaN")
				{
						return false;
				}
			}
			return true;
//			if(value===undefined) return true;
//			if(value ===null) return true;
//			if( value.toString()=="NaN") return true;
//			if(value===true) return false;
//			if(value ===false) return false;
//			if(value is String)
//			{
//				if(parseFloat(value)==value) return false;
//			}
//			return true;
			//			return !isNumber(value);
		}
		 static getStrTypedValue(value:string):any
		{
			if(value=="false")
			{
				return false;
			}else
				if(value=="true")
				{
					return true;
				}else
					if(value=="null")
					{
						return null;
					}else
						if(value=="undefined")
						{
							return null;
						}else
						{
							return ObjectTools.getAutoValue(value);
						}
		}
		 static createKeyValueDic(dataList:any[],keySign:string):any
		{
			var rst:any;
			rst={};
			var i:number,len:number;
			len=dataList.length;
			var tItem:any;
			var tKey:string;
			for(i=0;i<len;i++)
			{
				tItem=dataList[i];
				tKey=tItem[keySign];
				rst[tKey]=tItem;
			}
			return rst;
		}
	}

