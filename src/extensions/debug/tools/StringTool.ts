/**
	 * 一些字符串操作函数
	 * @author ww
	 * 
	 */
	export class StringTool
	{
		constructor(){
		}
		
		/**
		 * 返回全大写 
		 * @param str
		 * @return 
		 */
		 static toUpCase(str:string):string
		{
			return str.toUpperCase();
		}
		
		/**
		 * 返回全小写 
		 * @param str
		 * @return 
		 */
		 static toLowCase(str:string):string
		{
			return str.toLowerCase();
		}
		/**
		 * 返回首字母大写 
		 * @param str
		 * @return 
		 */		
		 static toUpHead(str:string):string
		{
			var rst:string;
			if(str.length<=1) return str.toUpperCase();
			rst=str.charAt(0).toUpperCase()+str.substr(1);
			return rst;
		}
		
		/**
		 * 返回首字母小写 
		 * @param str
		 * @return 
		 */		
		 static toLowHead(str:string):string
		{
			var rst:string;
			if(str.length<=1) return str.toLowerCase();
			rst=str.charAt(0).toLowerCase()+str.substr(1);
			return rst;
		}
		
		
		/**
		 * 包名转路径名 
		 * @param packageName
		 * @return 
		 */
		 static packageToFolderPath(packageName:string):string
		{
			var rst:string;
			rst=packageName.replace(".","/");
			return rst;
		}
		 static insert(str:string,iStr:string,index:number):string
		{
			return str.substring(0,index)+iStr+str.substr(index);
		}
		 static insertAfter(str:string,iStr:string,tarStr:string,isLast:boolean=false):string
		{
			var i:number;
			if(isLast)
			{
				i=str.lastIndexOf(tarStr);
			}else
			{
				i=str.indexOf(tarStr);
			}
			if(i>=0)
			{
				return StringTool.insert(str,iStr,i+tarStr.length);
			}
			return str;
		}
		 static insertBefore(str:string,iStr:string,tarStr:string,isLast:boolean=false):string
		{
			var i:number;
			if(isLast)
			{
				i=str.lastIndexOf(tarStr);
			}else
			{
				i=str.indexOf(tarStr);
			}
			
			if(i>=0)
			{
				return StringTool.insert(str,iStr,i);
			}
			return str;
		}
		 static insertParamToFun(funStr:string,params:any[]):string
		{
			var oldParam:any[];
			oldParam=StringTool.getParamArr(funStr);
			var inserStr:string;
			inserStr=params.join(",");
			if(oldParam.length>0)
			{
				inserStr=","+inserStr;
			}
			return StringTool.insertBefore(funStr,inserStr,")",true);
			
		}
		/**
		 * 去除空格和换行符
		 * @param str
		 * @return 
		 */
		 static trim(str:string,vList:any[]=null):string
		{
			if(!vList)
			{
				vList=[" ","\r","\n","\t",String.fromCharCode(65279)];
			}
			var rst:string;
			var i:number;
			var len:number;
			rst=str;
			len=vList.length;
			for(i=0;i<len;i++)
			{
				rst=StringTool.getReplace(rst,vList[i],"");
			}
			return rst;
		}
		 static emptyStrDic:any=
			{
				" ":true,
				"\r":true,
				"\n":true,
				"\t":true
			};
		 static isEmpty(str:string):boolean
		{
			if(str.length<1) return true;
			return StringTool.emptyStrDic.hasOwnProperty(str);
		}
		 static trimLeft(str:string):string
		{
			var i:number;
			i=0;
		    var len:number;
			len=str.length;
			while(StringTool.isEmpty(str.charAt(i))&&i<len)
			{
				i++;
			}
			if(i<len)
			{
				return str.substr(i);
			}
			return "";
		}
		 static trimRight(str:string):string
		{
			var i:number;
			i=str.length-1;
//			trace(str+" "+str.length);
			while(StringTool.isEmpty(str.charAt(i))&&i>=0)
			{
//				i=str.length-1;
				i--;
			}
//			trace(str.charAt(i));
			var rst:string;
			rst=str.substring(0,i)
//			trace(rst+" "+rst.length);
			if(i>=0)
			{
				return str.substring(0,i+1);
			}
			return "";
		}
		 static trimSide(str:string):string
		{
			var rst:string;
			rst=StringTool.trimLeft(str);
			rst=StringTool.trimRight(rst);
			return rst;
		}
		
		 static specialChars:any={"*":true,"&":true,"%":true,"#":true,"?":true};
		 static isOkFileName(fileName:string):boolean
		{
			if(StringTool.trimSide(fileName)=="") return false;
			var i:number,len:number;
			len=fileName.length;
			for(i=0;i<len;i++)
			{
				if(StringTool.specialChars[fileName.charAt(i)]) return false;
			}
			return true;
		}
		 static trimButEmpty(str:string):string
		{
			return StringTool.trim(str,["\r","\n","\t"]);
		}
		
		 static removeEmptyStr(strArr:any[]):any[]
		{
			var i:number;
			i=strArr.length-1;
			var str:string;
			for(i=i;i>=0;i--)
			{
				str=strArr[i];
				str=StringTool.trimSide(str);
				
				if(StringTool.isEmpty(str))
				{
					strArr.splice(i,1);
				}else
				{
					strArr[i]=str;
				}
			}
			return strArr;
		}
		 static ifNoAddToTail(str:string,sign:string):string
		{
			if(str.indexOf(sign)>=0)
			{
				return str;
			}
			return str+sign;
		}


		 static trimEmptyLine(str:string):string
		{
			var i:number;
			var len:number;
			var tLines:any[];
		    var tLine:string;
			tLines=str.split("\n");
			for(i=tLines.length-1;i>=0;i--)
			{
				tLine=tLines[i];
				if(StringTool.isEmptyLine(tLine))
				{
					tLines.splice(i,1);
				}
			}
			return tLines.join("\n");
		}


		 static isEmptyLine(str:string):boolean
		{
			str=StringTool.trim(str);
			if(str=="") return true;
			return false;
		}
		 static removeCommentLine(lines:any[]):any[]
		{
			var rst:any[];
			rst=[];
			var i:number;
			var tLine:string;
			var adptLine:string;
			i=0;
			var len:number;
			var index:number;
			len=lines.length;
			while(i<len)
			{
				adptLine = tLine = lines[i];
				index = tLine.indexOf("/**");
				if(index>=0)
				{
					adptLine=tLine.substring(0,index-1);
					StringTool.addIfNotEmpty(rst,adptLine);
					//				    i++;
					while(i<len)
					{
						tLine = lines[i];
						index = tLine.indexOf("*/");
						if(index>=0)
						{
							adptLine=tLine.substring(index+2);
							StringTool.addIfNotEmpty(rst,adptLine);
							break;
						}
						i++;
					}
				}else if(tLine.indexOf("//")>=0)
				{
					if(StringTool.trim(tLine).indexOf("//")==0)
					{
					}else
					{
						StringTool.addIfNotEmpty(rst,adptLine);
					}
				}else
				{
					StringTool.addIfNotEmpty(rst,adptLine);
				}
				i++;
			}
			
			return rst;
		}

		 static addIfNotEmpty(arr:any[],str:string):void
		{
			if(!str) return;
			var tStr:string;
			tStr=StringTool.trim(str);
			if(tStr!="")
			{
				arr.push(str);
			}
		}
		 static trimExt(str:string,vars:any[]):string
		{
			var rst:string;
			rst=StringTool.trim(str);
			var i:number;
			var len:number;
			len=vars.length;
			for(i=0;i<len;i++)
			{
				rst=StringTool.getReplace(rst,vars[i],"");
			}
			return rst;
		}
		 static getBetween(str:string,left:string,right:string,ifMax:boolean=false):string
		{
			if(!str) return "";
			if(!left) return "";
			if(!right) return "";
			var lId:number;
			var rId:number;
			lId=str.indexOf(left);
			if(lId<0) return"";
			if(ifMax)
			{
				rId=str.lastIndexOf(right);
				if(rId<lId) return "";
			}else
			{
				rId=str.indexOf(right,lId+1);
			}
			
			if(rId<0) return "";
			return str.substring(lId+left.length,rId);
		}
		 static getSplitLine(line:string,split:string=" "):any[]
		{
			return line.split(split);
		}
		 static getLeft(str:string,sign:string):string
		{
			var i:number;
			i=str.indexOf(sign);
			return str.substr(0,i);
		}
		 static getRight(str:string,sign:string):string
		{
			var i:number;
			i=str.indexOf(sign);
			return str.substr(i+1);
		}
		 static delelteItem(arr:any[]):void
		{
			while (arr.length>0)
			{
				if(arr[0]=="")
				{
					arr.shift();
				}else
				{
					break;
				}
			}
		}
		 static getWords(line:string):any[]
		{
			var rst:any[]=StringTool.getSplitLine(line);
			StringTool.delelteItem(rst);
			return rst;
		}

		 static getLinesI(startLine:number,endLine:number,lines:any[]):any[]
		{
			var i:number;
			var rst:any[]=[];
			for(i=startLine;i<=endLine;i++)
			{
				rst.push(lines[i]);
			}
			return rst;
		}
		 static structfy(str:string,inWidth:number=4,removeEmpty:boolean=true):string
		{
			if(removeEmpty)
			{
				str=StringTool.trimEmptyLine(str);
			}
			var lines:any[];
			var tIn:number;
			tIn=0;
			var tInStr:string;
			tInStr=StringTool.getEmptyStr(0);
			lines=str.split("\n");
			var i:number;
			var len:number;
			var tLineStr:string;
			len=lines.length;
			for(i=0;i<len;i++)
			{
				tLineStr=lines[i];
//				tLineStr=StringTool.trimSide(tLineStr);
				tLineStr=StringTool.trimLeft(tLineStr);
				tLineStr=StringTool.trimRight(tLineStr);
				tIn+=StringTool.getPariCount(tLineStr);
//				if(tLineStr=="}")
//				{
//					tLineStr=getEmptyStr(tIn*2)+tLineStr;
//				}else
//				{
//					tLineStr=tInStr+tLineStr;
//				}
				if(tLineStr.indexOf("}")>=0)
				{
					tInStr=StringTool.getEmptyStr(tIn*inWidth);
				}
				tLineStr=tInStr+tLineStr;
				lines[i]=tLineStr;
				tInStr=StringTool.getEmptyStr(tIn*inWidth);
				
			}
			return lines.join("\n");
		}
		 static emptyDic:any={};
		 static getEmptyStr(width:number):string
		{
			if(!StringTool.emptyDic.hasOwnProperty(width))
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
				StringTool.emptyDic[width]=rst;
			}
			return StringTool.emptyDic[width];
		}
		 static getPariCount(str:string,inChar:string="{",outChar:string="}"):number
		{
			var varDic:any;
			varDic={};
			varDic[inChar]=1;
			varDic[outChar]=-1;
			var i:number;
			var len:number;
			var tChar:string;
			len=str.length;
			var rst:number;
			rst=0;
			for(i=0;i<len;i++)
			{
				tChar=str.charAt(i);
				if(varDic.hasOwnProperty(tChar))
				{
					rst+=varDic[tChar];
				}
			}
			return rst;
		}
		 static readInt(str:string,startI:number=0):number
		{
			var rst:number;
			rst=0;
			var tNum:number;
			var tC:string;
			var i:number;
			var isBegin:boolean;
			isBegin=false;
			var len:number;
			len=str.length;
			for(i=startI;i<len;i++)
			{
				tC=str.charAt(i);
				if(Number(tC)>0||tC=="0")
				{
					rst=10*rst+Number(tC);
					if(rst>0) isBegin=true;
				}else
				{
					if(isBegin) return rst;
				}
			}
			return rst;
		}
		/**
		 * 替换文本 
		 * @param str
		 * @param oStr
		 * @param nStr
		 * @return 
		 */
		 static getReplace(str:string,oStr:string,nStr:string):string
		{
			if(!str) return "";
//			if(!oStr) return str;
//			if(!nStr) return str;
			var rst:string;
			rst=str.replace(new RegExp(oStr, "g"),nStr);
			return rst;
		}
		 static getWordCount(str:string,findWord:string):number
		{
			var rg:RegExp=new RegExp(findWord, "g")
			return str.match(rg).length;
		}
		 static getResolvePath(path:string,basePath:string):string
		{
			if(StringTool.isAbsPath(path))
			{
				return path;
			}
			var tSign:string;
			tSign="\\";
			if(basePath.indexOf("/")>=0)
			{
				tSign="/";
			}
			if(basePath.charAt(basePath.length-1)==tSign)
			{
				basePath=basePath.substr(0,basePath.length-1);
			}
			var parentSign:string;
			parentSign=".."+tSign;
			var tISign:string;
			tISign="."+tSign;
			var pCount:number;
			pCount=StringTool.getWordCount(path,parentSign);
			path=StringTool.getReplace(path,parentSign,"");
			path=StringTool.getReplace(path,tISign,"");
			var i:number;
			var len:number;
			len=pCount;
			var iPos:number;
			for(i=0;i<len;i++)
			{
				basePath=StringTool.removeLastSign(path,tSign);
			}
			return basePath+tSign+path;
		}
		 static isAbsPath(path:string):boolean
		{
			if(path.indexOf(":")>=0) return true;
			return false;
		}
		 static removeLastSign(str:string,sign:string):string
		{
			var iPos:number;
			iPos=str.lastIndexOf(sign);
			str=str.substring(0,iPos);
			return str;
		}
		 static getParamArr(str:string):any[]
		{
			var paramStr:string;
			paramStr= StringTool.getBetween(str,"(",")",true);
			if(StringTool.trim(paramStr).length<1) return [];
			return paramStr.split(",");
		}
		
		
		static copyStr(str:string):string
		{
			return str.substring(0);
		}
	
		/**
		 * 将Array转成字符串
		 * @param arr
		 * @return 
		 */
		 static ArrayToString(arr:any[]):string
		{
			var rst:string;
			rst="[{items}]".replace(new RegExp("\\{items\\}", "g"),  StringTool.getArrayItems(arr));
			return rst;
		}
		
		 static getArrayItems(arr:any[]):string
		{
			var rst:string;
			
			if(arr.length<1) return "";
			rst=StringTool.parseItem(arr[0]);
			
			var i:number;
			var len:number;
			len=arr.length;
			for(i=1;i<len;i++)
			{
				rst+=","+StringTool.parseItem(arr[i]);
			}
			
			
			return rst;
		}
		 static parseItem(item:any):string
		{
			var rst:string;
			rst="\""+item+"\"";
			return "";
		}

		 static alphaSigns:any=null;
		 static initAlphaSign():void
		{
			if (StringTool.alphaSigns) return;
			StringTool.alphaSigns = { };
			StringTool.addSign("a","z",StringTool.alphaSigns);
			StringTool.addSign("A","Z",StringTool.alphaSigns);
			StringTool.addSign("0","9",StringTool.alphaSigns);
		}
		 static addSign(ss:string,e:string,tar:any):void
		{
			var i:number;
			var len:number;
			var s:number;
			s=ss.charCodeAt(0);
			len=e.charCodeAt(0);
			for(i=s;i<=len;i++)
			{
				tar[String.fromCharCode(i)]=true;
				console.log("add :"+String.fromCharCode(i));
			}
		}
		 static isPureAlphaNum(str:string):boolean
		{
			StringTool.initAlphaSign();
			if (!str) return true;
			var i:number, len:number;
			len = str.length;
			for (i = 0; i < len; i++)
			{
				if (!StringTool.alphaSigns[str.charAt(i)]) return false;
			}
			return true;
		}
	}

