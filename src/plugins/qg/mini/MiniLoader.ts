import { QGMiniAdapter } from "./QGMiniAdapter";
import { MiniFileMgr } from "./../../../../../../openData/src/laya/wx/mini/MiniFileMgr";
import { Event } from "../../../../../../core/src/laya/events/Event"
	import { EventDispatcher } from "../../../../../../core/src/laya/events/EventDispatcher"
	import { Loader } from "../../../../../../core/src/laya/net/Loader"
	import { URL } from "../../../../../../core/src/laya/net/URL"
	import { Handler } from "../../../../../../core/src/laya/utils/Handler"
	import { Utils } from "../../../../../../core/src/laya/utils/Utils"
	
	/** @private **/
	export class MiniLoader  extends EventDispatcher  {
		/**@private 加载文件列表**/
		private static _fileTypeArr:any[] = ['png', 'jpg', 'bmp', 'jpeg', 'gif'];
		
		constructor(){super();

		}
		
		/**
		 * @private 
		 * @param url
		 * @param type
		 * @param cache
		 * @param group
		 * @param ignoreCache
		 */
		private load(url:string, type:string = null, cache:boolean = true, group:string = null, ignoreCache:boolean = false):void {
			var thisLoader:any = this;
			thisLoader._url = url;
			if (!url)
			{
				thisLoader.onLoaded(null);
				return;
			}
			url = URL.customFormat(url);
			if (url.indexOf("data:image") === 0) thisLoader._type = type = Loader.IMAGE;
			else {
				thisLoader._type = type || (type = Loader.getTypeFromUrl(thisLoader._url));
			}
			thisLoader._cache = cache;
			thisLoader._data = null;
			
			if (!ignoreCache && Loader.loadedMap[URL.formatURL(url)]) {
				thisLoader._data = Loader.loadedMap[URL.formatURL(url)];
				this.event(Event.PROGRESS, 1);
				this.event(Event.COMPLETE, thisLoader._data);
				return;
			}
			
			//如果自定义了解析器，则自己解析
			if (Loader.parserMap[type] != null) {
				thisLoader._customParse = true;
				if (Loader.parserMap[type] instanceof Handler) Loader.parserMap[type].runWith(this);
				else Loader.parserMap[type].call(null, this);
				return;
			}
			var contentType:string;
			switch (type) {
				case Loader.ATLAS: 
				case Loader.PREFAB: 
				case Loader.PLF: 
					contentType = Loader.JSON;
					break;
				case Loader.FONT: 
					contentType = Loader.XML;
					break;
				case Loader.PLFB:
					contentType = Loader.BUFFER;
					break;
				default: 
					contentType = type;
			}
			if (Loader.preLoadedMap[URL.formatURL(url)]) {
				thisLoader.onLoaded(Loader.preLoadedMap[URL.formatURL(url)]);
				return;
			} 
			var encoding:string = QGMiniAdapter.getUrlEncode(url,contentType);
			var urlType:string = Utils.getFileExtension(url);
			if ((MiniLoader._fileTypeArr.indexOf(urlType) != -1)) {
				//图片通过miniImage去加载
				QGMiniAdapter.EnvConfig.load.call(this, url, type, cache, group, ignoreCache);
			} else {
				//如果是子域,并且资源单独的图集列表文件里不存在当前路径的数据信息，这时需要针对url进行一次转义
				if(QGMiniAdapter.isZiYu && !MiniFileMgr.ziyuFileData[url])
				{
					url = URL.formatURL(url);
				}
				if(QGMiniAdapter.isZiYu && MiniFileMgr.ziyuFileData[url])
				{
					var tempData:any = MiniFileMgr.ziyuFileData[url];
					thisLoader.onLoaded(tempData);
					return;
				}
				if (!MiniFileMgr.getFileInfo(url)) {
					if (MiniFileMgr.isLocalNativeFile(url)) {
						
						if (QGMiniAdapter.subNativeFiles && QGMiniAdapter.subNativeheads.length == 0)
						{
							for (var key  in QGMiniAdapter.subNativeFiles)
							{
								var tempArr:any[] = QGMiniAdapter.subNativeFiles[key];
								QGMiniAdapter.subNativeheads = QGMiniAdapter.subNativeheads.concat(tempArr);
								for (var aa:number = 0; aa < tempArr.length;aa++)
								{
									QGMiniAdapter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
								}
							}
						}
						//判断当前的url是否为分包映射路径
						if(QGMiniAdapter.subNativeFiles && url.indexOf("/") != -1)
						{
							var curfileHead:string = url.split("/")[0]  +"/";//文件头
							if(curfileHead && QGMiniAdapter.subNativeheads.indexOf(curfileHead) != -1)
							{
								var newfileHead:string = QGMiniAdapter.subMaps[curfileHead];
								url = url.replace(curfileHead,newfileHead);
							}
						}
						//xiaosong add 20190105
						var tempStr:string = URL.rootPath != "" ? URL.rootPath : URL.basePath;
						var tempUrl:string = url;
						if (tempStr != "")
							url = url.split(tempStr)[1];
						if (!url) {
							url = tempUrl;
						}
						//临时，因为微信不支持以下文件格式
						//直接读取本地，非网络加载缓存的资源
						MiniFileMgr.read(url,encoding,new Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [encoding, url, type, cache, group, ignoreCache, thisLoader]));
						return;
					}
					//xiaosong20190301修复资源版本管理的bug
					var tempurl:string=URL.formatURL(url);
					if (tempurl.indexOf("http://usr/") == -1&& (tempurl.indexOf("http://") != -1 || tempurl.indexOf("https://") != -1) && !QGMiniAdapter.AutoCacheDownFile) {
						//远端文件加载走xmlhttprequest
						QGMiniAdapter.EnvConfig.load.call(thisLoader, url, type, cache, group, ignoreCache);
					} else {
						//读取本地磁盘非写入的文件，只是检测文件是否需要本地读取还是外围加载
						MiniFileMgr.readFile(url, encoding, new Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [encoding, url, type, cache, group, ignoreCache, thisLoader]), url);
					}
				} else {
					//读取本地磁盘非写入的文件，只是检测文件是否需要本地读取还是外围加载
					var fileObj:any = MiniFileMgr.getFileInfo(url);
					fileObj.encoding = fileObj.encoding == null ? "utf8" : fileObj.encoding;
					MiniFileMgr.readFile(url, fileObj.encoding, new Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [encoding, url, type, cache, group, ignoreCache, thisLoader]), url);
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
		private static onReadNativeCallBack(encoding:string, url:string, type:string = null, cache:boolean = true, group:string = null, ignoreCache:boolean = false, thisLoader:any = null, errorCode:number = 0, data:any = null):void {
			if (!errorCode) {
				//文本文件读取本地存在
				var tempData:any;
				if (type == Loader.JSON || type == Loader.ATLAS || type == Loader.PREFAB  || type == Loader.PLF) {
					tempData = QGMiniAdapter.getJson(data.data);
				} else if (type == Loader.XML) {
					tempData = Utils.parseXMLFromString(data.data);
				} else {
					tempData = data.data;
				}
				//主域向子域派发数据
				if(!QGMiniAdapter.isZiYu &&QGMiniAdapter.isPosMsgYu && type  != Loader.BUFFER)
				{
					QGMiniAdapter.window.qg.postMessage && QGMiniAdapter.window.qg.postMessage({url:url,data:tempData,isLoad:"filedata"});
				}
				thisLoader.onLoaded(tempData);
			} else if (errorCode == 1) {
				//远端文件加载走xmlhttprequest
				QGMiniAdapter.EnvConfig.load.call(thisLoader, url, type, cache, group, ignoreCache);
			}
		}
	}

