import { EventDispatcher } from "laya/events/EventDispatcher";
import { MiniFileMgr } from "./MiniFileMgr";
import { MiniAdpter } from "./MiniAdpter";
import { Handler } from "laya/utils/Handler";
import { Loader } from "laya/net/Loader";
import { SoundManager } from "laya/media/SoundManager";
import { Utils } from "laya/utils/Utils";
import { Sound } from "laya/media/Sound";
import { URL } from "laya/net/URL";	
import { Event } from "laya/events/Event";
	/** @private **/
	export class MiniLoader  extends EventDispatcher  {
		constructor(){
			super();
		}

		/**
		 * @private
		 * @param type 
		 * @param url
		 */
		_loadResourceFilter(type: string, url: string): void {
			var thisLoader:any = this;
			
			//url转义处理
			if (url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1&&(url.indexOf("http://") != -1 || url.indexOf("https://") != -1))
			{
				if(MiniFileMgr.loadPath != "")
				{
					url = url.split(MiniFileMgr.loadPath)[1];//去掉http头
				}else
				{
					var tempStr:string = URL.rootPath != "" ? URL.rootPath : URL._basePath;
					var tempUrl:string = url;
					if(tempStr != "")
						url = url.split(tempStr)[1];//去掉http头
					if(!url)
					{
						url = tempUrl;
					}
				}
			}
			//分包映射url处理
			if (MiniAdpter.subNativeFiles && MiniAdpter.subNativeheads.length == 0)
			{
				for (var key  in MiniAdpter.subNativeFiles)
				{
					var tempArr:any[] = MiniAdpter.subNativeFiles[key];
					MiniAdpter.subNativeheads = MiniAdpter.subNativeheads.concat(tempArr);
					for (var aa:number = 0; aa < tempArr.length;aa++)
					{
						MiniAdpter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
					}
				}
			}
			//判断当前的url是否为分包映射路径
			if(MiniAdpter.subNativeFiles && url.indexOf("/") != -1)
			{
				var curfileHead:string = url.split("/")[0] + "/";//文件头
				if(curfileHead && MiniAdpter.subNativeheads.indexOf(curfileHead) != -1)
				{
					var newfileHead:string = MiniAdpter.subMaps[curfileHead];
					url = url.replace(curfileHead,newfileHead);
				}
			}
			switch (type) {
				case Loader.IMAGE:
				case "htmlimage": //内部类型
				case "nativeimage": //内部类型
					MiniLoader._transformImgUrl(url,type,thisLoader);
					break;
				case Loader.SOUND:
					thisLoader._loadSound(url);
					break;
				default:
					thisLoader._loadResource(type, url);
			}
		}

		/**
		 * private
		 * @param url
		 **/ 
		_loadSound(url:string):void
		{
			var thisLoader:any = this;
			var fileNativeUrl:String;
			if (MiniFileMgr.isLocalNativeFile(url)) {
				var tempStr:any = URL.rootPath != "" ? URL.rootPath : URL._basePath;
				var tempUrl:String = url;
				if(tempStr != "" && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1))
					fileNativeUrl = url.split(tempStr)[1];//去掉http头
				if(!fileNativeUrl)
				{
					fileNativeUrl = tempUrl;
				}
				MiniLoader.onDownLoadCallBack(url,thisLoader,0);//直接创建声音实例
			}else
			{
				var tempurl:string = URL.formatURL(url);
				if (!MiniFileMgr.isLocalNativeFile(url) &&  (tempurl.indexOf("http://") == -1 && tempurl.indexOf("https://") == -1) || (tempurl.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) != -1)) 
				{
					MiniLoader.onDownLoadCallBack(url,thisLoader, 0);
				}else
				{
					
					MiniFileMgr.downOtherFiles(encodeURI(tempurl), Handler.create(MiniLoader, MiniLoader.onDownLoadCallBack, [tempurl,thisLoader]), tempurl);
				}
			}
		}

		/**
		 * private
		 * @param sourceUrl
		 * @param errorCode
		 * @param tempFilePath
		 * 
		 **/
		static onDownLoadCallBack(sourceUrl:string,thisLoader:any,errorCode:number,tempFilePath:string = null):void
		{
			if (!errorCode)
			{
				var fileNativeUrl:string;
				if(MiniAdpter.autoCacheFile)
				{
					if(!tempFilePath){
						if (MiniFileMgr.isLocalNativeFile(sourceUrl)) {
							var tempStr:any = URL.rootPath != "" ? URL.rootPath : URL._basePath;
							var tempUrl:string = sourceUrl;
							if(tempStr != "" && (sourceUrl.indexOf("http://") != -1 || sourceUrl.indexOf("https://") != -1))
								fileNativeUrl = sourceUrl.split(tempStr)[1];//去掉http头
							if(!fileNativeUrl)
							{
								fileNativeUrl = tempUrl;
							}
						}else
						{
							var fileObj:any = MiniFileMgr.getFileInfo(sourceUrl);
							if(fileObj && fileObj.md5)
							{
								var fileMd5Name:string = fileObj.md5;
								fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
							}else
							{
								fileNativeUrl = sourceUrl;
							}
						}
					}else{
						fileNativeUrl = tempFilePath;
					}
				}
				sourceUrl = fileNativeUrl;
				//需要测试这个方式是否可行
				var sound: Sound = (<Sound>(new SoundManager._soundClass()));
				sound.load(sourceUrl);
				thisLoader.onLoaded(sound);
			}else
			{
				thisLoader.event(Event.ERROR,"Load sound failed");
			}
		}

		/**
		 * @private
		 * 给传入的函数绑定作用域，返回绑定后的函数。
		 * @param	fun 函数对象。
		 * @param	scope 函数作用域。
		 * @return 绑定后的函数。
		 */
		static bindToThis(fun:Function, scope:any):Function {
			var rst:Function = fun;
			rst=fun.bind(scope);;
			return rst;
		}

		/**
		 * @private
		 */
		_loadHttpRequestWhat(url:string, contentType:string):void {
			var thisLoader:any = this;
			var encoding:string = MiniAdpter.getUrlEncode(url,contentType);
			if (Loader.preLoadedMap[url])
				thisLoader.onLoaded(Loader.preLoadedMap[url]);
			else
			{
				var tempurl:string = URL.formatURL(url);
				if (url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1&& (tempurl.indexOf("http://") != -1 || tempurl.indexOf("https://") != -1) && !MiniAdpter.AutoCacheDownFile) 
				{
					thisLoader._loadHttpRequest(tempurl, contentType, thisLoader, thisLoader.onLoaded, thisLoader, thisLoader.onProgress, thisLoader, thisLoader.onError);
				}else
				{
					//调用微信加载文件接口承载加载
					//读取本地磁盘非写入的文件，只是检测文件是否需要本地读取还是外围加载
					var fileObj:any = MiniFileMgr.getFileInfo(URL.formatURL(url));
					if(fileObj)
					{
						fileObj.encoding = fileObj.encoding == null ? "utf8" : fileObj.encoding;
						MiniFileMgr.readFile(fileObj.url, encoding, new Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
					} else if (thisLoader.type == "image" || thisLoader.type == "htmlimage")
					{
						thisLoader._transformUrl(url, contentType);
					}
					else
					{
						if(contentType != Loader.IMAGE &&(tempurl.indexOf("http://") == -1 && tempurl.indexOf("https://") == -1) || MiniFileMgr.isLocalNativeFile(url))
						{
							MiniFileMgr.readFile(url, encoding, new Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType,  thisLoader]), url);
						}else
						{
							MiniFileMgr.downFiles(tempurl, encoding, new Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType,  thisLoader]), tempurl,true);
						}
					}
				}
			}
		}

		/**
		 * @private 
		 * @param url
		 * @param thisLoader
		 * @param errorCode
		 * @param data
		 *
		 */
		private static onReadNativeCallBack(url:string, type:string = null, thisLoader:any = null, errorCode:number = 0, data:any = null):void {
			if (!errorCode) {
				//文本文件读取本地存在
				var tempData:any;
				if (type == Loader.JSON || type == Loader.ATLAS || type == Loader.PREFAB  || type == Loader.PLF) {
					tempData = MiniAdpter.getJson(data.data);
				} else if (type == Loader.XML) {
					tempData = Utils.parseXMLFromString(data.data);
				} else {
					tempData = data.data;
				}
				//主域向子域派发数据
				if(!MiniAdpter.isZiYu &&MiniAdpter.isPosMsgYu && type  != Loader.BUFFER)
				{
					MiniAdpter.window.wx.postMessage({url:url,data:tempData,isLoad:"filedata"});
				}
				thisLoader.onLoaded(tempData);
			} else if (errorCode == 1) {
				//远端文件加载走xmlhttprequest
				thisLoader._loadHttpRequest(url, type, thisLoader, thisLoader.onLoaded, thisLoader, thisLoader.onProgress, thisLoader, thisLoader.onError);
			}
		}

		/**
		 * @private
		 * @param url
		 * @param type
		 * @param thisLoader
		 ***/
		private static _transformImgUrl(url:string,type:string,thisLoader:any):void
		{
			//这里要预处理磁盘文件的读取,带layanative目录标识的视为本地磁盘文件，不进行路径转换操作
			if (MiniAdpter.isZiYu)
			{
				thisLoader._loadImage(url);//直接读取本地文件，非加载缓存的图片
				return;
			}
			
			if (!MiniFileMgr.getFileInfo(url)) 
			{
				var tempUrl:string = URL.formatURL(url);
				if (url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1&&(tempUrl.indexOf("http://") != -1 || tempUrl.indexOf("https://") != -1))
				{
					//小游戏在子域里不能远端加载图片资源
					if(MiniAdpter.isZiYu)
					{
						thisLoader._loadImage(url);//直接读取本地文件，非加载缓存的图片
					}else
					{
						MiniFileMgr.downOtherFiles(tempUrl, new Handler(MiniLoader, MiniLoader.onDownImgCallBack, [url, thisLoader]), tempUrl);
					}
				}
				else
					thisLoader._loadImage(url);//直接读取本地文件，非加载缓存的图片
			} else 
			{
				thisLoader._loadImage(url);//外网图片加载
			}
		}

		/**
		 * @private 
		 * 下载图片文件回调处理
		 * @param sourceUrl 图片实际加载地址
		 * @param thisLoader 加载对象
		 * @param errorCode 回调状态码，0成功 1失败
		 * @param tempFilePath 加载返回的临时地址 
		 */
		private static onDownImgCallBack(sourceUrl:string, thisLoader:any, errorCode:number,tempFilePath:string= ""):void {
			if (!errorCode)
				MiniLoader.onCreateImage(sourceUrl, thisLoader,false,tempFilePath);
			else {
				thisLoader.onError(null);
			}
		}

		/**
		 * @private 
		 * 创建图片对象
		 * @param sourceUrl
		 * @param thisLoader
		 * @param isLocal 本地图片(没有经过存储的,实际存在的图片，需要开发者自己管理更新)
		 * @param tempFilePath 加载的临时地址
		 */
		private static onCreateImage(sourceUrl:string, thisLoader:any, isLocal:boolean = false,tempFilePath:string= ""):void {
			var fileNativeUrl:string;
			if(MiniAdpter.autoCacheFile)
			{
				if (!isLocal) {
					if(tempFilePath != "")
					{
						fileNativeUrl = tempFilePath;
					}else
					{
						var fileObj:any = MiniFileMgr.getFileInfo(sourceUrl);
						var fileMd5Name:string = fileObj.md5;
						fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
					}
				} else
					if(MiniAdpter.isZiYu)
					{
						//子域里需要读取主域透传过来的信息，然后这里获取一个本地磁盘图片路径，然后赋值给fileNativeUrl
						var tempUrl:string = URL.formatURL(sourceUrl);
						if(MiniFileMgr.ziyuFileTextureData[tempUrl])
						{
							fileNativeUrl = MiniFileMgr.ziyuFileTextureData[tempUrl];
						}else
							fileNativeUrl = sourceUrl;
					}else
						fileNativeUrl = sourceUrl;
			}else
			{
				if(!isLocal)
					fileNativeUrl = tempFilePath;
				else
					fileNativeUrl = sourceUrl;
			}
			//将url传递给引擎层
			thisLoader._loadImage(fileNativeUrl);
		}
	}

