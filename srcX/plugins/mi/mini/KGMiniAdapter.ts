import { MiniFileMgr } from "./../../../../../../openData/src/laya/wx/mini/MiniFileMgr";
import { Laya } from "./../../../../../../core/src/Laya";
import { MiniInput } from "./../../../../../bd/src/laya/bd/mini/MiniInput";
import { MiniLoader } from "./../../../../../../openData/src/laya/wx/mini/MiniLoader";
import { MiniImage } from "./../../../../../../openData/src/laya/wx/mini/MiniImage";
import { Input } from "../../../../../../core/src/laya/display/Input"
	import { Loader } from "../../../../../../core/src/laya/net/Loader"
	import { LocalStorage } from "../../../../../../core/src/laya/net/LocalStorage"
	import { URL } from "../../../../../../core/src/laya/net/URL"
	import { Browser } from "../../../../../../core/src/laya/utils/Browser"
	import { Handler } from "../../../../../../core/src/laya/utils/Handler"
	import { RunDriver } from "../../../../../../core/src/laya/utils/RunDriver"
	import { Utils } from "../../../../../../core/src/laya/utils/Utils"
	
	export class KGMiniAdapter {
		/**@private  包装对象**/
		 static EnvConfig:any;
		/**@private **/
		/**全局window对象**/
		 static window:any;
		/**@private **/
		private static _preCreateElement:Function;
		/**@private 适配库是否初始化**/
		private static _inited:boolean = false;
		/**@private 获取手机系统信息**/
		 static systemInfo:any = {};
		/**@private  是否是子域，默认为false**/
		 static isZiYu:boolean;
		/**@private 是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false**/
		 static isPosMsgYu:boolean;
		/**是否自动缓存下载的图片跟声音文件，默认为true**/
		 static autoCacheFile:boolean = true;
		/**50M缓存容量满时每次清理容量值,默认每次清理5M**/
		 static minClearSize:number = (5 * 1024 * 1024); 
		/**本地资源列表**/
		 static nativefiles:any[] = ["layaNativeDir","wxlocal"];
		/**本地分包资源表**/
		 static subNativeFiles:any;
		/**本地分包文件目录数组**/
		 static subNativeheads:any[] = [];
		/**本地分包文件目录映射表**/
		 static subMaps:any[] = [];
		/**@private 是否自动缓存非图片声音文件(这里要确保文件编码最好一致)**/
		 static AutoCacheDownFile:boolean = false;
		/**@private **/
		 static getJson(data:string):any {
			return JSON.parse(data);
		}
		
		/**激活微信小游戏适配器*/
		 static enable():void {
			KGMiniAdapter.init();
		}
		
		/**
		 * 初始化回调
		 * @param isPosMsg 是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false
		 * @param isSon 是否是子域，默认为false
		 */
		 static init(isPosMsg:boolean = false,isSon:boolean = false):void {
			if (KGMiniAdapter._inited) return;
			KGMiniAdapter._inited = true;
			KGMiniAdapter.window = window;
			if(KGMiniAdapter.window.navigator.userAgent.indexOf('QuickGame') <0) return;
			KGMiniAdapter.isZiYu = isSon;
			KGMiniAdapter.isPosMsgYu = isPosMsg;
			KGMiniAdapter.EnvConfig = { };
			//设置资源存储目录
			if(!KGMiniAdapter.isZiYu)
			{
				MiniFileMgr.setNativeFileDir("/layaairGame");
				MiniFileMgr.existDir(MiniFileMgr.fileNativeDir, Handler.create(KGMiniAdapter, KGMiniAdapter.onMkdirCallBack));
			}
			if(!KGMiniAdapter.isZiYu)
			{
				KGMiniAdapter.systemInfo = KGMiniAdapter.window.qg.getSystemInfoSync();
//				systemInfo.pixelRatio = systemInfo.screenDensity;//xiaosong add
			}
			
			KGMiniAdapter.window.focus = function():void {
			};
			//清空路径设定
			Laya['getUrlPath'] = function():string {
				return "";
			};
			Laya['_getUrlPath'] = function():string {
				return "";
			};
			//add---xiaosong--snowgame
			KGMiniAdapter.window.logtime = function(str:string):void {
			};
			KGMiniAdapter.window.alertTimeLog = function(str:string):void {
			};
			KGMiniAdapter.window.resetShareInfo = function():void {
			};
			//适配Context中的to对象
//			window.CanvasRenderingContext2D = function():void {
//			};
//			window.CanvasRenderingContext2D.prototype = KGMiniAdapter.window.qg.createCanvas().getContext('2d').__proto__;
			
//			if(!window.navigator)
//				window.navigator = {};
//			if(!window.navigator.userAgent)
//				window.navigator.userAgent = "";
//			window.document.body = {};
//			window.document.body.appendChild = function():void {};
			
			//获取手机的设备像素比
			KGMiniAdapter.EnvConfig.pixelRatioInt = 0;
			Browser["_pixelRatio"]=KGMiniAdapter.pixelRatio();
			//适配HTMLCanvas中的Browser.createElement("canvas")
			KGMiniAdapter._preCreateElement = Browser.createElement;
			//获取小程序pixel值
			Browser["createElement"] = KGMiniAdapter.createElement;
			//适配RunDriver.createShaderCondition
			RunDriver.createShaderCondition = KGMiniAdapter.createShaderCondition;
			//适配XmlDom
			Utils['parseXMLFromString'] = KGMiniAdapter.parseXMLFromString;
			//文本输入框
			Input['_createInputElement'] = MiniInput['_createInputElement'];
			//修改文件加载
			KGMiniAdapter.EnvConfig.load = Loader.prototype.load;
			//文件加载处理
			Loader.prototype.load = MiniLoader.prototype.load;
			//修改图片加载
			Loader.prototype._loadImage = MiniImage.prototype._loadImage;
			//本地缓存类
//			LocalStorage._baseClass = MiniLocalStorage;
//			MiniLocalStorage.__init__();
			KGMiniAdapter.onReciveData();
		}
		
		private static onReciveData():void
		{
			//接收主域透传的数据
			if(KGMiniAdapter.isZiYu)
			{
				KGMiniAdapter.window.qg.onMessage(function(message:any):void{
					if(message['isLoad'] == "opendatacontext")
					{
						if(message.url)
						{
							MiniFileMgr.ziyuFileData[message.url] = message.atlasdata;//图集配置数据
							MiniFileMgr.ziyuFileTextureData[message.imgReadyUrl] = message.imgNativeUrl;//imgNativeUrl 为本地磁盘地址;imgReadyUrl为外网路径
						}
					}else if(message['isLoad'] == "openJsondatacontext")
					{
						if(message.url)
						{
							MiniFileMgr.ziyuFileData[message.url] = message.atlasdata;//json配置数据信息
						}
					}else if(message['isLoad'] == "openJsondatacontextPic")
					{
						MiniFileMgr.ziyuFileTextureData[message.imgReadyUrl] = message.imgNativeUrl;//imgNativeUrl 为本地磁盘地址;imgReadyUrl为外网路径
					}
				});
			}	
		}
		
		
		private static _measureText:Function;
		 static measureText(str:string):any
		{
			var tempObj:any = KGMiniAdapter._measureText(str);
			if(!tempObj)
			{
				tempObj ={width:16};
				console.warn("-------微信获取文字宽度失败----等待修复---------");
			}
			return tempObj;
		}
		
		/**
		 * 获取url对应的encoding值 
		 * @param url 文件路径
		 * @param type 文件类型
		 * @return 
		 */		
		 static getUrlEncode(url:string,type:string):string
		{
			if(type == "arraybuffer")
				return "";
			return "utf8";
		}
			
		/**
		 * 下载文件 
		 * @param fileUrl 文件地址(全路径)
		 * @param fileType 文件类型(image、text、json、xml、arraybuffer、sound、atlas、font)
		 * @param callBack 文件加载回调,回调内容[errorCode码(0成功,1失败,2加载进度)
		 * @param encoding 文件编码默认 ascill，非图片文件加载需要设置相应的编码，二进制编码为空字符串
		 */				
		 static downLoadFile(fileUrl:string, fileType:string = "",callBack:Handler = null,encoding:string = "utf8"):void
		{
			var fileObj:any = MiniFileMgr.getFileInfo(fileUrl);
			if(!fileObj)
				MiniFileMgr.downLoadFile(fileUrl,fileType,callBack,encoding);
			else
			{
				callBack != null && callBack.runWith([0]);
			}
		}
		
		/**
		 * 从本地删除文件
		 * @param fileUrl 文件地址(全路径)
		 * @param callBack 回调处理，在存储图片时用到
		 */
		 static remove(fileUrl:string, callBack:Handler = null):void {
			MiniFileMgr.deleteFile("",fileUrl,callBack,"",0);
		}
		
		/**
		 * 清空缓存空间文件内容 
		 */		
		 static removeAll():void
		{
			MiniFileMgr.deleteAll();
		}
		
		/**
		 * 判断是否是4M包文件
		 * @param fileUrl 文件地址(全路径)
		 * @return 
		 */		
		 static  hasNativeFile(fileUrl:string):boolean
		{
			return MiniFileMgr.isLocalNativeFile(fileUrl);
		}
		
		/**
		 * 判断缓存里是否存在文件
		 * @param fileUrl 文件地址(全路径)
		 * @return
		 */
		 static getFileInfo(fileUrl:string):any {
			return MiniFileMgr.getFileInfo(fileUrl);
		}
		
		/**
		 * 获取缓存文件列表
		 * @return
		 */
		 static getFileList():any
		{
			return MiniFileMgr.filesListObj;
		}
		
		/**@private 退出小游戏**/
		 static exitMiniProgram():void
		{
			KGMiniAdapter.window.qg.exitMiniProgram();
		}
		
		/**@private **/
		private static onMkdirCallBack(errorCode:number, data:any):void {
			if (!errorCode)
				MiniFileMgr.filesListObj = JSON.parse(data.data);
		}
		
		/**@private 设备像素比。*/
		 static pixelRatio():number {
			if (!KGMiniAdapter.EnvConfig.pixelRatioInt) {
				try {
					KGMiniAdapter.EnvConfig.pixelRatioInt = KGMiniAdapter.systemInfo.pixelRatio;
					return KGMiniAdapter.systemInfo.pixelRatio;
				} catch (error) {
				}
			}
			return KGMiniAdapter.EnvConfig.pixelRatioInt;
		}
		/**
		 * @private 
		 * 将字符串解析成 XML 对象。
		 * @param value 需要解析的字符串。
		 * @return js原生的XML对象。
		 */
		private static parseXMLFromString:Function = function(value:string):XMLDocument {
			var rst:any;
			var Parser:any;
			value = value.replace(/>\s+</g, '><');
			try {
				rst=(new window.Parser.DOMParser()).parseFromString(value,'text/xml');
			} catch (error) {
				throw "需要引入xml解析库文件";
			}
			return rst;
		}
		/**@private **/
		private static idx:number = 1;
		/**@private **/
		 static createElement(type:string):any {
			if (type == "canvas") {
				var _source:any;
				if (KGMiniAdapter.idx == 1) {
					if(KGMiniAdapter.isZiYu)
					{
						var tempCanvas:any = new Canvas();
						_source = tempCanvas;
						_source.style = {};
					}else
					{
						_source = KGMiniAdapter.window.canvas;
						//xiaosong-add
						_source.style = {
							width:_source.width +"px",
							height:_source.height +"px"
						};
					}
				} else {
					tempCanvas = new Canvas();
					_source = tempCanvas;
				}
				KGMiniAdapter.idx++;
				return _source;
			} else if (type == "textarea" || type == "input") {
				return KGMiniAdapter.onCreateInput(type);
			} else if (type == "div") {
				var node:any = KGMiniAdapter._preCreateElement(type);
				node.contains = function(value:string):any {
					return null
				};
				node.removeChild = function(value:string):void {
				};
				return node;
			} else {
				return KGMiniAdapter._preCreateElement(type);
			}
		}
		/**@private **/
		private static onCreateInput(type:any):any {
			var node:any = KGMiniAdapter._preCreateElement(type);
			node.focus = MiniInput.wxinputFocus;
			node.blur = MiniInput.wxinputblur;
			node.style = {};
			node.value = 0;//文本内容
//			node.parentElement = {};//xiaosong add    
			node.placeholder = {};
//			node.type = {};//xiaosong
			node.setColor = function(value:string):void {
			};
			node.setType = function(value:string):void {
			};
			node.setFontFace = function(value:string):void {
			};
			node.addEventListener = function(value:string):void {
			};
			node.contains = function(value:string):any {
				return null
			};
			node.removeChild = function(value:string):void {
			};
			return node;
		}
		
		/**@private **/
		 static createShaderCondition(conditionScript:string):Function {
			var func:Function = function():any {
				var abc:string = conditionScript;
				return this[conditionScript.replace("this.", "")];
			}
			return func;
		}
		
		/**
		 * 传递图集url地址到 
		 * @param url 为绝对地址
		 */		
		 static sendAtlasToOpenDataContext(url:string):void
		{
			if(!KGMiniAdapter.isZiYu)
			{
				var atlasJson:any = Loader.getRes(URL.formatURL(url));
				if(atlasJson)
				{
					var  textureArr:any[] = ((<string>atlasJson.meta.image )).split(",");
					
					//构造加载图片信息
					if (atlasJson.meta && atlasJson.meta.image) {
						//带图片信息的类型
						var toloadPics:any[] = atlasJson.meta.image.split(",");
						var split:string = url.indexOf("/") >= 0 ? "/" : "\\";
						var idx:number = url.lastIndexOf(split);
						var folderPath:string = idx >= 0 ? url.substr(0, idx + 1) : "";
						for (var i:number = 0, len:number = toloadPics.length; i < len; i++) {
							toloadPics[i] = folderPath + toloadPics[i];
						}
					} else {
						//不带图片信息
						toloadPics = [url.replace(".json", ".png")];
					}
					for(i = 0;i<toloadPics.length;i++)
					{
						var tempAtlasPngUrl:string = toloadPics[i];
						KGMiniAdapter.postInfoToContext(url,tempAtlasPngUrl,atlasJson);
					}
				}else
				{
					throw "传递的url没有获取到对应的图集数据信息，请确保图集已经过！";
				}
			}
		}
		
		private static postInfoToContext(url:string,atlaspngUrl:string,atlasJson:any):void
		{
			var postData:any = {"frames":atlasJson.frames,"meta":atlasJson.meta}; 
			var textureUrl:string = atlaspngUrl;
			var fileObj:any = MiniFileMgr.getFileInfo(URL.formatURL(atlaspngUrl));
			if(fileObj)
			{
				var fileMd5Name:string = fileObj.md5;
				var fileNativeUrl:string = MiniFileMgr.getFileNativePath(fileMd5Name);
			}else
			{
				fileNativeUrl = textureUrl;//4M包使用
			}
			if(fileNativeUrl)
			{
				var openDataContext:any =KGMiniAdapter.window.qg.getOpenDataContext();
				openDataContext.postMessage({url:url,atlasdata:postData,imgNativeUrl:fileNativeUrl,imgReadyUrl:textureUrl,isLoad:"opendatacontext"});
			}else
			{
				throw "获取图集的磁盘url路径不存在！";
			}
		}
		
		/**
		 * 发送单张图片到开放数据域 
		 * @param url
		 */		
		 static sendSinglePicToOpenDataContext(url:string):void
		{
			var tempTextureUrl:string = URL.formatURL(url);
			var fileObj:any = MiniFileMgr.getFileInfo(tempTextureUrl);
			if(fileObj)
			{
				var fileMd5Name:string = fileObj.md5;
				var fileNativeUrl:string = MiniFileMgr.getFileNativePath(fileMd5Name);
				url = tempTextureUrl;
			}else
			{
				fileNativeUrl = url;//4M包使用
			}
			if(fileNativeUrl)
			{
				KGMiniAdapter.window.qg.postMessage({url:url,imgNativeUrl:fileNativeUrl,imgReadyUrl:url,isLoad:"openJsondatacontextPic"});
			}else
			{
				throw "获取图集的磁盘url路径不存在！";
			}
		}
		
		/**
		 * 传递json配置数据到开放数据域 
		 * @param url 为绝对地址
		 */		
		 static sendJsonDataToDataContext(url:string):void
		{
			if(!KGMiniAdapter.isZiYu)
			{
				var atlasJson:any = Loader.getRes(url);
				if(atlasJson)
				{
					KGMiniAdapter.window.qg.postMessage({url:url,atlasdata:atlasJson,isLoad:"openJsondatacontext"});
				}else
				{
					throw "传递的url没有获取到对应的图集数据信息，请确保图集已经过！";
				}
			}
		}
	}

