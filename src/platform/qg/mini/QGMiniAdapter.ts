import {Browser} from "laya/utils/Browser";
import { Laya } from "Laya";
import { MiniFileMgr } from "./MiniFileMgr";
import { Handler } from "laya/utils/Handler";
import { RunDriver } from "laya/utils/RunDriver";
import { MiniInput } from "./MiniInput";
import { Loader } from "laya/net/Loader";
import { Matrix } from "laya/maths/Matrix";
import { Stage } from "laya/display/Stage";
import { MiniLoader } from "./MiniLoader";
import { Utils } from "laya/utils/Utils";
import { Input } from "laya/display/Input";
import {URL} from "laya/net/URL";
import {Config} from "Config";
	export class QGMiniAdapter {
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
		 static nativefiles:any[] = ["layaNativeDir"];
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
			QGMiniAdapter.init(Laya.isWXPosMsg, Laya.isWXOpenDataContext);
		}
		
		/**
		 * 初始化回调
		 * @param isPosMsg 是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false
		 * @param isSon 是否是子域，默认为false
		 */
		 static init(isPosMsg:boolean = false, isSon:boolean = false):void {
			if (QGMiniAdapter._inited) return;
			QGMiniAdapter._inited = true;
			QGMiniAdapter.window = window;
			if(!QGMiniAdapter.window.hasOwnProperty('qg'))
				return;
			if (QGMiniAdapter.window.navigator.userAgent.indexOf('OPPO') < 0) return;
			QGMiniAdapter.isZiYu = isSon;
			QGMiniAdapter.isPosMsgYu = isPosMsg;
			QGMiniAdapter.EnvConfig = {};
			
			//设置资源存储目录
			if (!QGMiniAdapter.isZiYu) {
				MiniFileMgr.setNativeFileDir("/layaairGame");
				MiniFileMgr.existDir(MiniFileMgr.fileNativeDir, Handler.create(QGMiniAdapter, QGMiniAdapter.onMkdirCallBack));
			}
			//系统信息			
			QGMiniAdapter.window.qg.getSystemInfo({
				success:function(data:any):void{
					QGMiniAdapter.systemInfo = data;
				}
			});
			
			QGMiniAdapter.window.focus = function():void {
			};
			//清空路径设定
			Laya['_getUrlPath'] = function():string {
				return "";
			};
			Laya['getUrlPath'] = function():string {
				return "";
			};
			//add---xiaosong--snowgame
			QGMiniAdapter.window.logtime = function(str:string):void {
			};
			QGMiniAdapter.window.alertTimeLog = function(str:string):void {
			};
			QGMiniAdapter.window.resetShareInfo = function():void {
			};
			//适配Context中的to对象
//			window.CanvasRenderingContext2D = function():void {
//			};
//			window.CanvasRenderingContext2D.prototype = window.qg.createCanvas().getContext('2d').__proto__;
			//重写body的appendChild方法
			QGMiniAdapter.window.document.body.appendChild = function():void {
			};
			//获取手机的设备像素比
			QGMiniAdapter.EnvConfig.pixelRatioInt = 0;
			Browser["_pixelRatio"] = QGMiniAdapter.pixelRatio();
			//适配HTMLCanvas中的Browser.createElement("canvas")
			QGMiniAdapter._preCreateElement = Browser.createElement;
			//获取小程序pixel值
			Browser["createElement"] = QGMiniAdapter.createElement;
			//适配RunDriver.createShaderCondition
			RunDriver.createShaderCondition = QGMiniAdapter.createShaderCondition;
			//适配XmlDom
			Utils['parseXMLFromString'] = QGMiniAdapter.parseXMLFromString;
			//文本输入框
			Input['_createInputElement'] = MiniInput['_createInputElement'];
			
			Loader.prototype._loadResourceFilter = MiniLoader.prototype._loadResourceFilter;
			Loader.prototype._loadSound = MiniLoader.prototype._loadSound;
			Loader.prototype._loadHttpRequestWhat = MiniLoader.prototype._loadHttpRequestWhat;
			Config.useRetinalCanvas = true;
			QGMiniAdapter.window.qg.onMessage && QGMiniAdapter.window.qg.onMessage(QGMiniAdapter._onMessage);
		}
		
		private static _onMessage(data:any):void {
			switch (data.type) {
			case "changeMatrix": 
				Laya.stage.transform.identity();
				Laya.stage._width = data.w;
				Laya.stage._height = data.h;
				Laya.stage._canvasTransform = new Matrix(data.a, data.b, data.c, data.d, data.tx, data.ty);
				break;
			case "display": 
				Laya.stage.frameRate = data.rate || Stage.FRAME_FAST;
				break;
			case "undisplay": 
				Laya.stage.frameRate = Stage.FRAME_SLEEP;
				break;
			}
			if (data['isLoad'] == "opendatacontext") {
				if (data.url) {
					MiniFileMgr.ziyuFileData[data.url] = data.atlasdata;//图集配置数据
					MiniFileMgr.ziyuFileTextureData[data.imgReadyUrl] = data.imgNativeUrl;//imgNativeUrl 为本地磁盘地址;imgReadyUrl为外网路径
				}
			} else if (data['isLoad'] == "openJsondatacontext") {
				if (data.url) {
					MiniFileMgr.ziyuFileData[data.url] = data.atlasdata;//json配置数据信息
				}
			} else if (data['isLoad'] == "openJsondatacontextPic") {
				MiniFileMgr.ziyuFileTextureData[data.imgReadyUrl] = data.imgNativeUrl;//imgNativeUrl 为本地磁盘地址;imgReadyUrl为外网路径
			}
		}
		
		/**
		 * 获取url对应的encoding值
		 * @param url 文件路径
		 * @param type 文件类型
		 * @return
		 */
		 static getUrlEncode(url:string, type:string):string {
			if (type == "arraybuffer")
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
		 static downLoadFile(fileUrl:string, fileType:string = "", callBack:Handler = null, encoding:string = "utf8"):void {
			var fileObj:any = MiniFileMgr.getFileInfo(fileUrl);
			if (!fileObj)
				MiniFileMgr.downLoadFile(fileUrl, fileType, callBack, encoding);
			else {
				callBack != null && callBack.runWith([0]);
			}
		}
		
		/**
		 * 从本地删除文件
		 * @param fileUrl 文件地址(全路径)
		 * @param callBack 回调处理，在存储图片时用到
		 */
		 static remove(fileUrl:string, callBack:Handler = null):void {
			MiniFileMgr.deleteFile("", fileUrl, callBack, "", 0);
		}
		
		/**
		 * 清空缓存空间文件内容
		 */
		 static removeAll():void {
			MiniFileMgr.deleteAll();
		}
		
		/**
		 * 判断是否是4M包文件
		 * @param fileUrl 文件地址(全路径)
		 * @return
		 */
		 static hasNativeFile(fileUrl:string):boolean {
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
		 static getFileList():any {
			return MiniFileMgr.filesListObj;
		}
		
		/**@private 退出小游戏**/
		 static exitMiniProgram():void {
			QGMiniAdapter.window["wx"].exitMiniProgram();
		}
		
		/**@private **/
		private static onMkdirCallBack(errorCode:number, data:any):void {
			if (!errorCode)
				MiniFileMgr.filesListObj = JSON.parse(data.data);
				MiniFileMgr.fakeObj = MiniFileMgr.filesListObj;
		}
		
		/**@private 设备像素比。*/
		 static pixelRatio():number {
			if (!QGMiniAdapter.EnvConfig.pixelRatioInt) {
				try {
					QGMiniAdapter.systemInfo.pixelRatio = QGMiniAdapter.window.devicePixelRatio;//xiaosong add
					QGMiniAdapter.EnvConfig.pixelRatioInt = QGMiniAdapter.systemInfo.pixelRatio;
					return QGMiniAdapter.systemInfo.pixelRatio;
				} catch (error) {
				}
			}
			return QGMiniAdapter.EnvConfig.pixelRatioInt;
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
				rst=(new (window as any).DOMParser()).parseFromString(value,'text/xml');
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
				if (QGMiniAdapter.idx == 1) {
					if(QGMiniAdapter.isZiYu)
					{
						_source = QGMiniAdapter.window.document.createElement("canvas");
						_source.style = {};
					}else
					{
						_source = QGMiniAdapter.window.__canvas;
					}
				} else {
					_source = QGMiniAdapter.window.document.createElement("canvas");
				}
				QGMiniAdapter.idx++;
				return _source;
			} else if (type == "textarea" || type == "input") {
				return QGMiniAdapter.onCreateInput(type);
			} else if (type == "div") {
				var node:any = QGMiniAdapter._preCreateElement(type);
				node.contains = function(value:string):any {
					return null
				};
				node.removeChild = function(value:string):void {
				};
				return node;
			}
			else {
				return QGMiniAdapter._preCreateElement(type);
			}
		}
		
		/**@private **/
		private static onCreateInput(type:any):any {
			var node:any = QGMiniAdapter._preCreateElement(type);
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
		
		/**
		 * 传递图集url地址到
		 * @param url 为绝对地址
		 */
		 static sendAtlasToOpenDataContext(url:string):void {
			if (!QGMiniAdapter.isZiYu) {
				var atlasJson:any = Loader.getRes(URL.formatURL(url));
				if (atlasJson) {
					var textureArr:any[] = ((<string>atlasJson.meta.image )).split(",");
					
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
					for (i = 0; i < toloadPics.length; i++) {
						var tempAtlasPngUrl:string = toloadPics[i];
						QGMiniAdapter.postInfoToContext(url, tempAtlasPngUrl, atlasJson);
					}
				} else {
					throw "传递的url没有获取到对应的图集数据信息，请确保图集已经过！";
				}
			}
		}
		
		private static postInfoToContext(url:string, atlaspngUrl:string, atlasJson:any):void {
			var postData:any = {"frames": atlasJson.frames, "meta": atlasJson.meta};
			var textureUrl:string = atlaspngUrl;
			var fileObj:any = MiniFileMgr.getFileInfo(URL.formatURL(atlaspngUrl));
			if (fileObj) {
				var fileMd5Name:string = fileObj.md5;
				var fileNativeUrl:string = MiniFileMgr.getFileNativePath(fileMd5Name);
			} else {
				fileNativeUrl = textureUrl;//4M包使用
			}
			if (fileNativeUrl) {
				QGMiniAdapter.window.qg.postMessage && QGMiniAdapter.window.qg.postMessage({url: url, atlasdata: postData, imgNativeUrl: fileNativeUrl, imgReadyUrl: textureUrl, isLoad: "opendatacontext"});
			} else {
				throw "获取图集的磁盘url路径不存在！";
			}
		}
		
		/**
		 * 发送单张图片到开放数据域
		 * @param url
		 */
		 static sendSinglePicToOpenDataContext(url:string):void {
			var tempTextureUrl:string = URL.formatURL(url);
			var fileObj:any = MiniFileMgr.getFileInfo(tempTextureUrl);
			if (fileObj) {
				var fileMd5Name:string = fileObj.md5;
				var fileNativeUrl:string = MiniFileMgr.getFileNativePath(fileMd5Name);
				url = tempTextureUrl;
			} else {
				fileNativeUrl = url;//4M包使用
			}
			if (fileNativeUrl) {
				QGMiniAdapter.window.qg.postMessage && QGMiniAdapter.window.qg.postMessage({url: url, imgNativeUrl: fileNativeUrl, imgReadyUrl: url, isLoad: "openJsondatacontextPic"});
			} else {
				throw "获取图集的磁盘url路径不存在！";
			}
		}
		
		/**
		 * 传递json配置数据到开放数据域
		 * @param url 为绝对地址
		 */
		 static sendJsonDataToDataContext(url:string):void {
			if (!QGMiniAdapter.isZiYu) {
				var atlasJson:any = Loader.getRes(url);
				if (atlasJson) {
					QGMiniAdapter.window.qg.postMessage && QGMiniAdapter.window.qg.postMessage({url: url, atlasdata: atlasJson, isLoad: "openJsondatacontext"});
				} else {
					throw "传递的url没有获取到对应的图集数据信息，请确保图集已经过！";
				}
			}
		}
	}

