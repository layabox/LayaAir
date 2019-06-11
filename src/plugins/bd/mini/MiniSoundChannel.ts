import { Laya } from "./../../../../../../core/src/Laya";
import { Event } from "../../../../../../core/src/laya/events/Event"
	import { SoundChannel } from "../../../../../../core/src/laya/media/SoundChannel"
	import { SoundManager } from "../../../../../../core/src/laya/media/SoundManager"
	
	/** @private **/
	export class MiniSoundChannel extends SoundChannel {
		/**@private **/
		private _audio:any;
		/**@private **/
		private _onEnd:Function;
		/**@private **/
		private _miniSound:MiniSound;
		constructor(audio:any,miniSound:MiniSound){
			super();
this._audio = audio;
			this._miniSound = miniSound;
			this._onEnd = MiniSoundChannel.bindToThis(this.__onEnd, this);
			audio.onEnded(this._onEnd);
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
		
		/**@private **/
		private __onEnd():void {
			MiniSound._audioCache[this.url] = this._miniSound;
			if (this.loops == 1) {
				if (this.completeHandler) {
					Laya.systemTimer.once(10, this, this.__runComplete, [this.completeHandler], false);
					this.completeHandler = null;
				}
				this.stop();
				this.event(Event.COMPLETE);
				return;
			}
			if (this.loops > 0) {
				this.loops--;
			}
			this.startTime = 0;
			this.play();
		}
		
		
		
		/**
		 * @private 
		 * 播放
		 */
		/*override*/  play():void {
			this.isStopped = false;
			SoundManager.addChannel(this);
			this._audio.play();
		}
		
			
		/**@private  **/
		 set autoplay(value:boolean)
		{
			this._audio.autoplay = value;
		}
		/**
		 * @private 
		 * 自动播放 
		 * @param value
		 */	
		 get autoplay():boolean
		{
			return this._audio.autoplay;
		}
		
		/**
		 * @private 
		 * 当前播放到的位置
		 * @return
		 *
		 */
		/*override*/  get position():number {
			if (!this._audio)
				return 0;
			return this._audio.currentTime;
		}
		
		/**
		 * @private 
		 * 获取总时间。
		 */
		/*override*/  get duration():number {
			if (!this._audio)
				return 0;
			return this._audio.duration;
		}
		
		/**
		 * @private 
		 * 停止播放
		 *
		 */
		/*override*/  stop():void {
			this.isStopped = true;
			SoundManager.removeChannel(this);
			this.completeHandler = null;
			if (!this._audio)
				return;
			this._audio.pause();//停止播放
			this._audio.offEnded(null);
			this._miniSound.dispose();
			this._audio = null;
			this._miniSound = null;
			this._onEnd = null;
		}
		
		/**@private **/
		/*override*/  pause():void {
			this.isStopped = true;
			this._audio.pause();
		}
		
		/**@private **/
		 get loop():boolean
		{
			return this._audio.loop;
		}
		/**@private **/
		 set loop(value:boolean)
		{
			this._audio.loop = value;
		}
		/**@private **/
		/*override*/  resume():void {
			if (!this._audio)
				return;
			this.isStopped = false;
			SoundManager.addChannel(this);
			this._audio.play();
		}
		
		/**
		 * @private 
		 * 设置音量
		 * @param v
		 *
		 */
		/*override*/  set volume(v:number) {
			if (!this._audio)return;
			this._audio.volume=v;
		}
		
		/**
		 * @private 
		 * 获取音量
		 * @return
		 */
		/*override*/  get volume():number {
			if (!this._audio)return 1;
			return this._audio.volume;
		}
	}
	
