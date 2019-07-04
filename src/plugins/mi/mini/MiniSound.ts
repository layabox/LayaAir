import { KGMiniAdapter } from "./KGMiniAdapter";
import { MiniFileMgr } from "./../../../../../../openData/src/laya/wx/mini/MiniFileMgr";
import { MiniSoundChannel } from "./../../../../../bd/src/laya/bd/mini/MiniSoundChannel";
import { Event } from "../../../../../../core/src/laya/events/Event"
	import { EventDispatcher } from "../../../../../../core/src/laya/events/EventDispatcher"
	import { SoundManager } from "../../../../../../core/src/laya/media/SoundManager"
	import { URL } from "../../../../../../core/src/laya/net/URL"
	import { Handler } from "../../../../../../core/src/laya/utils/Handler"
	
	/** @private **/
	export class MiniSound extends EventDispatcher {
		/**@private **/
		private static _musicAudio:any;
		/**@private **/
		private static _id:number = 0;
		/**@private **/
		private _sound:any;
		/**
		 * @private
		 * 声音URL
		 */
		 url:string;
		/**
		 * @private
		 * 是否已加载完成
		 */
		 loaded:boolean = false;
		/**@private **/
		 readyUrl:string;
		/**@private **/
		 static _audioCache:any = {};
		
		constructor(){super();

			//_sound = _createSound();
		}
		
		/** @private **/
		private static _createSound():any {
			MiniSound._id++;
			return KGMiniAdapter.window.qg.createInnerAudioContext();
		}
		
		/**
		 * @private
		 * 加载声音。
		 * @param url 地址。
		 *
		 */
		 load(url:string):void {
			if (!MiniFileMgr.isLocalNativeFile(url)) {
				url = URL.formatURL(url);
			}else
			{
				if (url.indexOf("http://") != -1 || url.indexOf("https://") != -1)
				{
					if(MiniFileMgr.loadPath != "")
					{
						url = url.split(MiniFileMgr.loadPath)[1];//去掉http头
					}else
					{
						var tempStr:string = URL.rootPath != "" ? URL.rootPath : URL.basePath;
						if(tempStr != "")
							url = url.split(tempStr)[1];//去掉http头
					}
				}
			}
			this.url = url;
			this.readyUrl = url;
			if (MiniSound._audioCache[this.readyUrl]) {
				this.event(Event.COMPLETE);
				return;
			}
			if(KGMiniAdapter.autoCacheFile&&MiniFileMgr.getFileInfo(url))
			{
				this.onDownLoadCallBack(url,0);
			}else
			{
				if(!KGMiniAdapter.autoCacheFile)
				{
					this.onDownLoadCallBack(url,0);
				}else
				{
                    if (MiniFileMgr.isLocalNativeFile(url))
					{
						tempStr = URL.rootPath != "" ? URL.rootPath : URL.basePath;
                        var tempUrl:string = url;
                        if(tempStr != "")
                            url = url.split(tempStr)[1];//去掉http头
                        if (!url){
                            url = tempUrl;
                        }
						//分包目录资源加载处理
						if (KGMiniAdapter.subNativeFiles && KGMiniAdapter.subNativeheads.length == 0)
						{
							for (var key  in KGMiniAdapter.subNativeFiles)
							{
								var tempArr:any[] = KGMiniAdapter.subNativeFiles[key];
								KGMiniAdapter.subNativeheads = KGMiniAdapter.subNativeheads.concat(tempArr);
								for (var aa:number = 0; aa < tempArr.length;aa++)
								{
									KGMiniAdapter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
								}
							}
						}
						//判断当前的url是否为分包映射路径
						if(KGMiniAdapter.subNativeFiles && url.indexOf("/") != -1)
						{
							var curfileHead:string = url.split("/")[0] + "/";//文件头
							if(curfileHead && KGMiniAdapter.subNativeheads.indexOf(curfileHead) != -1)
							{
								var newfileHead:string = KGMiniAdapter.subMaps[curfileHead];
								url = url.replace(curfileHead,newfileHead);
							}
						}
                        this.onDownLoadCallBack(url,0);
					}else
					{
						if (!MiniFileMgr.isLocalNativeFile(url) &&  (url.indexOf("http://") == -1 && url.indexOf("https://") == -1) || (url.indexOf("http://usr/") != -1)) {
							this.onDownLoadCallBack(url, 0);
						}else
						{
							MiniFileMgr.downOtherFiles(url, Handler.create(this, this.onDownLoadCallBack, [url]), url);
						}					}
				}
			}
		}
		
		/**@private **/
		private onDownLoadCallBack(sourceUrl:string,errorCode:number):void
		{
			if (!errorCode)
			{
				var fileNativeUrl:string;
				if(KGMiniAdapter.autoCacheFile)
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
					this._sound = MiniSound._createSound();
					this._sound.src = this.url =  fileNativeUrl;
				}else
				{
					this._sound = MiniSound._createSound();
					this._sound.src = sourceUrl;
				}
				if(!this._sound)
					debugger;
				this._sound.oncanplay= this.onCanPlay.bind(this);//xiaosong20190305
				this._sound.onerror= this.onError.bind(this);//xiaosong20190305
			}else
			{
				this.event(Event.ERROR);
			}
		}
		
		/**@private **/
		private onError(error:any):void
		{
			this.event(Event.ERROR);
			this._sound.offerror && (this._sound.offerror(null));
		}
			
		/**@private **/
		private onCanPlay():void
		{
			this.loaded = true;
			this.event(Event.COMPLETE);
			this._sound.offcanplay && (this._sound.offcanplay(null));
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
		 * 播放声音。
		 * @param startTime 开始时间,单位秒
		 * @param loops 循环次数,0表示一直循环
		 * @return 声道 SoundChannel 对象。
		 *
		 */
		 play(startTime:number = 0, loops:number = 0):MiniSoundChannel {
			var tSound:any;
			if (this.url == SoundManager._tMusic) {
				if (!MiniSound._musicAudio) MiniSound._musicAudio = MiniSound._createSound();
				tSound = MiniSound._musicAudio;
			} else {
				if(MiniSound._audioCache[this.readyUrl])
				{
					tSound = MiniSound._audioCache[this.readyUrl]._sound;
				}else
				{
					tSound = MiniSound._createSound();
				}
			}
			if(!tSound)
				return null;	//修复声音加载失败报错的bug
			if(KGMiniAdapter.autoCacheFile&&MiniFileMgr.getFileInfo(this.url))
			{
				var fileNativeUrl:string;
				var fileObj:any = MiniFileMgr.getFileInfo(this.url);
				var fileMd5Name:string = fileObj.md5;
				tSound.src = this.url =MiniFileMgr.getFileNativePath(fileMd5Name);
			}else
			{
				tSound.src = this.url;
			}
			var channel:MiniSoundChannel = new MiniSoundChannel(tSound,this);
			channel.url = this.url;
			channel.loops = loops;
			channel.loop = (loops === 0 ? true : false);
			channel.startTime = startTime;
			channel.play();
			SoundManager.addChannel(channel);
			return channel;
		}
		
		/**
		 * @private
		 * 获取总时间。
		 */
		 get duration():number {
			return this._sound.duration;
		}
		
		/**
		 * @private
		 * 释放声音资源。
		 *
		 */
		 dispose():void {
			var ad:any = MiniSound._audioCache[this.readyUrl];
			if (ad) {
				ad.src = "";
				if(ad._sound)
				{
					ad._sound.destroy && ad._sound.destroy();	
					ad._sound =null;
					ad =null;
				}
				delete MiniSound._audioCache[this.readyUrl];
			}
		}
	}

