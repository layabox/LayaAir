import { MiniAdpter } from "./MiniAdpter";
/**
	 * 视频类 
	 * @author xiaosong
	 * @date -2019-04-22
	 */	
	export class MiniVideo
	{
		/**视频是否播放结束**/
		 videoend:boolean = false;
		 videourl:string = "";
		 videoElement:any;
		
		constructor(width:number = 320, height:number = 240){
			this.videoElement = MiniAdpter.window.wx.createVideo({width:width,height:height,autoplay:true});
		}
		
		 static __init__():void
		{
			//Video = MiniVideo;
		}
		
		 onPlayFunc:Function;
		 onEndedFunC:Function;
		 on(eventType:string,ths:any,callBack:Function):void
		{
			if(eventType == "loadedmetadata")
			{
				//加载完毕
				this.onPlayFunc = callBack.bind(ths);
				this.videoElement.onPlay = this.onPlayFunction.bind(this);
			}else if(eventType == "ended")
			{
				//播放完毕
				this.onEndedFunC = callBack.bind(ths);
				this.videoElement.onEnded = this.onEndedFunction.bind(this);
			}
			this.videoElement.onTimeUpdate = this.onTimeUpdateFunc.bind(this);
		}
		
		/**视频的总时⻓长，单位为秒**/
		private _duration:number;
		/**视频播放的当前位置**/
		private position:number;
		private onTimeUpdateFunc(data:any):void
		{
			this.position = data.position;
			this._duration = data.duration;
		}
		
		/**
		 * 获取视频长度（秒）。ready事件触发后可用。
		 */
		 get duration():number
		{
			return this._duration;
		}
		
		private onPlayFunction():void
		{
			if(this.videoElement)
				this.videoElement.readyState = 200;
			console.log("=====视频加载完成========");
			this.onPlayFunc != null && this.onPlayFunc();
		}
		
		private onEndedFunction():void
		{
			if(!this.videoElement)
				return;
			this.videoend = true;
			console.log("=====视频播放完毕========");
			this.onEndedFunC != null && this.onEndedFunC();
		}
		
		 off(eventType:string,ths:any,callBack:Function):void
		{
			if(eventType == "loadedmetadata")
			{
				//加载完毕
				this.onPlayFunc = callBack.bind(ths);
				this.videoElement.offPlay = this.onPlayFunction.bind(this);
			}else if(eventType == "ended")
			{
				//播放完毕
				this.onEndedFunC = callBack.bind(ths);
				this.videoElement.offEnded = this.onEndedFunction.bind(this);
			}
		}
		
		/**
		 * 设置播放源。
		 * @param url	播放源路径。
		 */
		 load(url:string):void
		{
			if(!this.videoElement)
				return;
			this.videoElement.src = url;
		}
		
		/**
		 * 开始播放视频。
		 */
		 play():void
		{
			if(!this.videoElement)
				return;
			this.videoend = false;
			this.videoElement.play();
		}
		
		/**
		 * 暂停视频播放。
		 */
		 pause():void
		{
			if(!this.videoElement)
				return;
			this.videoend = true;
			this.videoElement.pause();
		}
		
		/**
		 * 设置和获取当前播放头位置。
		 */
		 get currentTime():number
		{
			if(!this.videoElement)
				return 0;
			return this.videoElement.initialTime;
		}
		
		 set currentTime(value:number)
		{
			if(!this.videoElement)
				return;
			this.videoElement.initialTime = value;
		}
		
		/**
		 * 获取视频源尺寸。ready事件触发后可用。
		 */
		 get videoWidth():number
		{
			if(!this.videoElement)
				return 0;
			return this.videoElement.width;
		}
		
		 get videoHeight():number
		{
			if(!this.videoElement)
				return 0;
			return this.videoElement.height;
		}
		
		/**
		 * 返回音频/视频的播放是否已结束
		 */
		 get ended():boolean
		{
			return this.videoend;
		}
		
		/**
		 * 设置或返回音频/视频是否应在结束时重新播放。
		 */
		 get loop():boolean
		{
			if(!this.videoElement)
				return false;
			return this.videoElement.loop;
		}
		
		 set loop(value:boolean)
		{
			if(!this.videoElement)
				return;
			this.videoElement.loop = value;
		}
		
		/**
		 * playbackRate 属性设置或返回音频/视频的当前播放速度。如：
		 * <ul>
		 * <li>1.0 正常速度</li>
		 * <li>0.5 半速（更慢）</li>
		 * <li>2.0 倍速（更快）</li>
		 * <li>-1.0 向后，正常速度</li>
		 * <li>-0.5 向后，半速</li>
		 * </ul>
		 * <p>只有 Google Chrome 和 Safari 支持 playbackRate 属性。</p>
		 */
		 get playbackRate():number
		{
			if(!this.videoElement)
				return 0;
			return this.videoElement.playbackRate;
		}
		
		 set playbackRate(value:number)
		{
			if(!this.videoElement)
				return;
			this.videoElement.playbackRate = value;
		}
		
		/**
		 * 获取和设置静音状态。
		 */
		 get muted():boolean
		{
			if(!this.videoElement)
				return false;
			return this.videoElement.muted;
		}
		
		 set muted(value:boolean)
		{
			if(!this.videoElement)
				return;
			this.videoElement.muted = value;
		}
		
		/**
		 * 返回视频是否暂停
		 */
		 get paused():boolean
		{
			if(!this.videoElement)
				return false;
			return this.videoElement.paused;
		}
		
		/**
		 * 设置大小 
		 * @param width
		 * @param height
		 */		
		 size(width:number,height:number):void
		{
			if(!this.videoElement)
				return;
			this.videoElement.width = width;
			this.videoElement.height = height;
		}
		
		 get x():number
		{
			if(!this.videoElement)
				return 0;
			return this.videoElement.x;
		}
		
		 set x(value:number)
		{
			if(!this.videoElement)
				return;
			this.videoElement.x = value;
		}
		
		 get y():number
		{
			if(!this.videoElement)
				return 0;
			return this.videoElement.y;
		}
		
		 set y(value:number)
		{
			if(!this.videoElement)
				return;
			this.videoElement.y = value;
		}
		
		/**
		 * 获取当前播放源路径。
		 */
		 get currentSrc():string
		{
			return this.videoElement.src;
		}
		
		 destroy():void
		{
			if(this.videoElement)
				this.videoElement.destroy();	
			this.videoElement= null;
			this.onEndedFunC = null;
			this.onPlayFunc = null;
			this.videoend = false;
			this.videourl = null;
		}
		
		/**
		 * 重新加载视频。
		 */
		 reload():void
		{
			if(!this.videoElement)
				return;
			this.videoElement.src = this.videourl;
		}
	}

