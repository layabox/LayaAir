import { MiniFileMgr } from "./../../../../../../openData/src/laya/wx/mini/MiniFileMgr";
import { Laya } from "./../../../../../../core/src/Laya";
import { MiniInput } from "././MiniInput";
import { MiniLoader } from "./../../../../../../openData/src/laya/wx/mini/MiniLoader";
import { MiniImage } from "./../../../../../../openData/src/laya/wx/mini/MiniImage";
import { MiniLocalStorage } from "./../../../../../../openData/src/laya/wx/mini/MiniLocalStorage";
import { Input } from "../../../../../../core/src/laya/display/Input"
	import { Loader } from "../../../../../../core/src/laya/net/Loader"
	import { LocalStorage } from "../../../../../../core/src/laya/net/LocalStorage"
	import { Browser } from "../../../../../../core/src/laya/utils/Browser"
	import { Handler } from "../../../../../../core/src/laya/utils/Handler"
	import { RunDriver } from "../../../../../../core/src/laya/utils/RunDriver"
	import { Utils } from "../../../../../../core/src/laya/utils/Utils"
	
	export class BMiniAdapter {
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
		 static systemInfo:any;
		/**@private  是否是子域，默认为false**/
		 static isZiYu:boolean;
		/**@private 是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false**/
		 static isPosMsgYu:boolean;
		/**是否自动缓存下载的图片跟声音文件，默认为true**/
		 static autoCacheFile:boolean = true;
		/**50M缓存容量满时每次清理容量值,默认每次清理5M**/
		 static minClearSize:number = (5 * 1024 * 1024); 
		/**本地资源列表**/
		 static nativefiles:any[] = ["layaNativeDir", "wxlocal"];
		/**本地分包资源头映射表**/
		 static subNativeFiles:any;	
		 static subNativeheads:any[] = [];
		 static subMaps:any[] = [];
		/**@private 是否自动缓存非图片声音文件(这里要确保文件编码最好一致)**/
		 static AutoCacheDownFile:boolean = false;
		/**@private **/
		 static getJson(data:string):any {
			return JSON.parse(data);
		}
		
		/**激活微信小游戏适配器*/
		 static enable():void {
			BMiniAdapter.init();
		}
		
		/**
		 * 初始化回调
		 * @param isPosMsg 是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false
		 * @param isSon 是否是子域，默认为false
		 */
		 static init(isPosMsg:boolean = false,isSon:boolean = false):void {
			if (BMiniAdapter._inited) return;
			BMiniAdapter._inited = true;
			BMiniAdapter.window = window;
			if(BMiniAdapter.window.navigator.userAgent.indexOf('SwanGame') <0) return;
			BMiniAdapter.isZiYu = isSon;
			BMiniAdapter.isPosMsgYu = isPosMsg;
			BMiniAdapter.EnvConfig = {};
			
			//设置资源存储目录
			if(!BMiniAdapter.isZiYu)
			{
				MiniFileMgr.setNativeFileDir("/layaairGame");
				MiniFileMgr.existDir(MiniFileMgr.fileNativeDir, Handler.create(BMiniAdapter, BMiniAdapter.onMkdirCallBack));
			}
			BMiniAdapter.systemInfo =BMiniAdapter.window.swan.getSystemInfoSync();
			
			BMiniAdapter.window.focus = function():void {
			};
			//清空路径设定
			Laya['_getUrlPath'] = function():string {
				return "";
			};
			//add---xiaosong--snowgame
			BMiniAdapter.window.logtime = function(str:string):void {
			};
			BMiniAdapter.window.alertTimeLog = function(str:string):void {
			};
			BMiniAdapter.window.resetShareInfo = function():void {
			};
			//适配Context中的to对象
			BMiniAdapter.window.CanvasRenderingContext2D = function():void {
			};
			BMiniAdapter.window.CanvasRenderingContext2D.prototype = BMiniAdapter.window.swan.createCanvas().getContext('2d').__proto__;
			//重写body的appendChild方法
			BMiniAdapter.window.document.body.appendChild = function():void {
			};
			//获取手机的设备像素比
			BMiniAdapter.EnvConfig.pixelRatioInt = 0;
//			RunDriver.getPixelRatio = pixelRatio;
			Browser["_pixelRatio"]=BMiniAdapter.pixelRatio();
			//适配HTMLCanvas中的Browser.createElement("canvas")
			BMiniAdapter._preCreateElement = Browser.createElement;
			//获取小程序pixel值
			Browser["createElement"] = BMiniAdapter.createElement;
			//适配RunDriver.createShaderCondition
			RunDriver.createShaderCondition = BMiniAdapter.createShaderCondition;
			//适配XmlDom
			Utils['parseXMLFromString'] = BMiniAdapter.parseXMLFromString;
			//文本输入框
			Input['_createInputElement'] = MiniInput['_createInputElement'];
			
			//修改文件加载
			BMiniAdapter.EnvConfig.load = Loader.prototype.load;
			//文件加载处理
			Loader.prototype.load = MiniLoader.prototype.load;
			//修改图片加载
			Loader.prototype._loadImage = MiniImage.prototype._loadImage;
			//本地缓存类
			MiniLocalStorage.__init__();
			LocalStorage._baseClass = MiniLocalStorage;
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
		 * @param encoding 文件编码默认utf8，非图片文件加载需要设置相应的编码，二进制编码为空字符串
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
			BMiniAdapter.window.swan.exitMiniProgram();
		}
		
		/**@private **/
		private static onMkdirCallBack(errorCode:number, data:any):void {
			if (!errorCode)
				MiniFileMgr.filesListObj = JSON.parse(data.data);
		}
		
		/**@private 设备像素比。*/
		 static pixelRatio():number {
			if (!BMiniAdapter.EnvConfig.pixelRatioInt) {
				try {
					BMiniAdapter.EnvConfig.pixelRatioInt = BMiniAdapter.systemInfo.pixelRatio;
					return BMiniAdapter.systemInfo.pixelRatio;
				} catch (error) {
				}
			}
			return BMiniAdapter.EnvConfig.pixelRatioInt;
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
				if (BMiniAdapter.idx == 1) {
					if(BMiniAdapter.isZiYu)
					{
						_source = sharedCanvas;
						_source.style = {};
					}else
					{
						_source = window.canvas;
					}
				} else {
					_source =BMiniAdapter.window.swan.createCanvas();
				}
				BMiniAdapter.idx++;
				return _source;
			} else if (type == "textarea" || type == "input") {
				return BMiniAdapter.onCreateInput(type);
			} else if (type == "div") {
				var node:any = BMiniAdapter._preCreateElement(type);
				node.contains = function(value:string):any {
					return null
				};
				node.removeChild = function(value:string):void {
				};
				return node;
			} else {
				return BMiniAdapter._preCreateElement(type);
			}
		}
		/**@private **/
		private static onCreateInput(type:any):any {
			var node:any = BMiniAdapter._preCreateElement(type);
			node.focus = MiniInput.wxinputFocus;
			node.blur = MiniInput.wxinputblur;
			node.style = {};
			node.value = 0;//文本内容
			node.parentElement = {};
			node.placeholder = {};
			node.type = {};
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
	}

