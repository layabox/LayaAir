///////////////////////////////////////////////////////////
//  JsonTool.as
//  Macromedia ActionScript Implementation of the Class JsonTool
//  Created on:      2015-11-27 上午9:58:59
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-11-27 上午9:58:59
	 */
	export class JsonTool
	{
		constructor(){
		}
		 static singleLineKey:any=
			{
				"props":true
			};
		 static getJsonString(obj:any,singleLine:boolean=true,split:string="\n",depth:number=0,Width:number=4):string
		{
			
			
			var preStr:string="";
			preStr=JsonTool.getEmptyStr(depth*Width);
			
			
			var rst:string;
			
			var keyValues:any;
			keyValues={};
			var tKey:string;
			var tValue:any;
			var type:string;
			var keys:any[];
			keys=[];
			for(tKey in obj)
			{
				keys.push(tKey);
				tValue=obj[tKey];
				if(JsonTool.singleLineKey[tKey])
				{
					keyValues[tKey]=JsonTool.getValueStr(tValue,true,split,depth+1,Width);
				}else
				{
					keyValues[tKey]=JsonTool.getValueStr(tValue,singleLine,split,depth+1,Width);
				}
				
			}
			
			var i:number,len:number;
			len=keys.length;
			
			keys.sort();
			keys = keys.reverse();
			var keyPreStr:string;
			keyPreStr=JsonTool.getEmptyStr((depth+1)*Width);
			if(singleLine)
			{
				split="";
				preStr = "";
				keyPreStr = "";
			}
			var keyValueStrArr:any[];
			keyValueStrArr = [];
			
			for(i=0;i<len;i++)
			{
				tKey=keys[i];
				keyValueStrArr.push(keyPreStr+JsonTool.wrapValue(tKey)+":"+keyValues[tKey]);
			}
			rst="{"+split+keyValueStrArr.join(","+split)+split+preStr+"}";
			//rst=rst.split("\\").join("\\\\");
			return rst;
		}
		private static wrapValue(value:string,wraper:string="\""):string
		{
			return wraper+value+wraper;
		}
		
		private static  getArrStr(arr:any[],singleLine:boolean=true,split:string="\n",depth:number=0,Width:number=4):string
		{
			var rst:string;
			
			var i:number,len:number;
			len=arr.length;
			var valueStrArr:any[];
			valueStrArr=[];
			for(i=0;i<len;i++)
			{
				valueStrArr.push(JsonTool.getValueStr(arr[i],singleLine,split,depth+1,Width));
			}
			var preStr:string="";
			preStr=JsonTool.getEmptyStr((depth+1)*Width);
			if(singleLine)
			{
				split="";
				preStr="";
			}
			rst="["+split+preStr+valueStrArr.join(","+split+preStr)+"]";
			return rst;
		}
		 static escapable:RegExp = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
			
			meta:any = {    // table of character substitutions
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"' : '\\"',
				'\\': '\\\\'
			};
		
		
		 static quote(string:string):string {
			
			// If the string contains no control characters, no quote characters, and no
			// backslash characters, then we can safely slap some quotes around it.
			// Otherwise we must also replace the offending characters with safe escape
			// sequences.
			
			JsonTool.escapable.lastIndex = 0;
			return JsonTool.escapable.test(string) ? '"' + string.replace(JsonTool.escapable, function (a:string):string {
				var c:string = this.meta[a];
				return typeof c === 'string' ? c :
				'\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' : '"' + string + '"';
		}
		private static getValueStr(tValue:any,singleLine:boolean=true,split:string="\n",depth:number=0,Width:number=0):string
		{
			var rst:any;
			if(typeof(tValue) == 'string' )
			{
//				rst="\""+tValue+"\"";
				rst=JsonTool.quote(tValue);
			}else if(tValue ==null)
			{
				rst="null";
			}else if(typeof(tValue) == 'number'||typeof(tValue) == 'number'||tValue instanceof Boolean)
			{
				rst=tValue;
			}else if(tValue instanceof Array)
			{
				rst=JsonTool.getArrStr(tValue,singleLine,split,depth,Width);
			}else if(typeof(tValue) == 'object')
			{
				rst=JsonTool.getJsonString(tValue,singleLine,split,depth,Width);
			}else
			{
				rst=tValue;
			}
			return rst;
		}
		
		 static emptyDic:any={};
		 static getEmptyStr(width:number):string
		{
			if(!JsonTool.emptyDic.hasOwnProperty(width))
			{
				var i:number;
				var len:number;
				len=width;
				var rst:string;
				rst="";
				for(i=0;i<len;i++)
				{
					rst+=" ";
				}
				JsonTool.emptyDic[width]=rst;
			}
			return JsonTool.emptyDic[width];
		}
	}

