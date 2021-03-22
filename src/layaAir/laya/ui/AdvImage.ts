import { Image } from "./Image";
import { Event } from "../events/Event"
import { LocalStorage } from "../net/LocalStorage"
import { Browser } from "../utils/Browser"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 广告插件 
 * @author 小松
 * @date -2018-09-19
 */
export class AdvImage extends Image {
	/**广告列表数据**/
	private advsListArr: any[] = [];
	/**资源列表请求地址**/
	private resUrl: string = "https://unioncdn.layabox.com/config/iconlist.json";
	/**加载请求实例**/
	private _http: any = new Browser.window.XMLHttpRequest();
	/**广告列表信息**/
	private _data: any = [];
	/**每6分钟重新请求一次新广告列表**/
	private _resquestTime: number = 360000;
	/**微信跳转appid**/
	private _appid: string;
	/**播放索引**/
	private _playIndex: number = 0;
	/**轮播间隔时间**/
	private _lunboTime: number = 5000;
	constructor(skin: string = null) {
		super();
		this.skin = skin;
		this.setLoadUrl();
		this.init();
		this.size(120, 120);
	}

	/**设置导量加载地址**/
	private setLoadUrl(): void {
	}

	private init(): void {
		if (this.isSupportJump()) {
			//这里需要去加载广告列表资源信息
			if (Browser.onMiniGame || Browser.onBDMiniGame) {
				ILaya.timer.loop(this._resquestTime, this, this.onGetAdvsListData);
			}
			this.onGetAdvsListData();
			this.initEvent();
		} else
			this.visible = false;
	}

	private initEvent(): void {
		this.on(Event.CLICK, this, this.onAdvsImgClick);
	}

	private onAdvsImgClick(): void {
		var currentJumpUrl: string = this.getCurrentAppidObj();
		if (currentJumpUrl)
			this.jumptoGame();
	}

	private revertAdvsData(): void {
		if (this.advsListArr[this._playIndex]) {
			this.visible = true;
			this.skin = this.advsListArr[this._playIndex];
		}
	}

	/**当前小游戏环境是否支持游戏跳转功能**/
	isSupportJump(): boolean {
		if (Browser.onMiniGame) {
			var isSupperJump: boolean = (window as any).wx.navigateToMiniProgram instanceof Function;
			return isSupperJump;
		} else if (Browser.onBDMiniGame)
			return true;
		return false;
	}

	/**
	 * 跳转游戏 
	 * @param callBack Function 回调参数说明：type 0 跳转成功；1跳转失败；2跳转接口调用成功
	 */
	private jumptoGame(): void {
		var advsObj: any = this.advsListArr[this._playIndex];
		var desGameId: number = parseInt(advsObj.gameid); //跳转的gameid，必须为数字
		var extendInfo: number = advsObj.extendInfo; //额外参数，必须为字符串
		var path: any = advsObj.path;//扩展数据
		if (Browser.onMiniGame) {
			if (this.isSupportJump()) {
				(window as any).wx.navigateToMiniProgram({
					appId: this._appid,
					path: "",
					extraData: "",
					envVersion: "release",
					success: ()=> {
						console.log("-------------跳转成功--------------");
					},
					fail: ()=> {
						console.log("-------------跳转失败--------------");
					},
					complete: ()=> {
						console.log("-------------跳转接口调用成功--------------");
						this.updateAdvsInfo();
					}
				});
			}
		} else if (Browser.onBDMiniGame) {

		} else {
			this.visible = false;
		}
	}

	private updateAdvsInfo(): void {
		this.visible = false;
		this.onLunbo();
		ILaya.timer.loop(this._lunboTime, this, this.onLunbo);
	}

	private onLunbo(): void {
		if (this._playIndex >= this.advsListArr.length - 1)
			this._playIndex = 0;
		else
			this._playIndex += 1;
		this.visible = true;
		this.revertAdvsData();
	}

	/**获取轮播数据**/
	private getCurrentAppidObj(): string {
		return this.advsListArr[this._playIndex];
	}

	/**
	 * 获取广告列表数据信息 
	 */
	private onGetAdvsListData(): void {
		var _this: any = this;
		var random: number = AdvImage.randRange(10000, 1000000);
		var url: string = this.resUrl + "?" + random;
		this._http.open("get", url, true);
		this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
		this._http.responseType = "text";
		this._http.onerror = function (e: any): void {
			_this._onError(e);
		}
		this._http.onload = function (e: any): void {
			_this._onLoad(e);
		}
		this._http.send(null);
	}

	/**
	 * 生成指定范围的随机数
	 * @param {*} minNum 最小值
	 * @param {*} maxNum 最大值
	 */
	static randRange(minNum:number, maxNum:number): number {
		return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
	}

	/**
	 * @private
	 * 请求出错侦的听处理函数。
	 * @param	e 事件对象。
	 */
	private _onError(e: any): void {
		this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
	}

	/**
	 * @private
	 * 请求消息返回的侦听处理函数。
	 * @param	e 事件对象。
	 */
	private _onLoad(e: any): void {
		var http: any = this._http;
		var status: number = http.status !== undefined ? http.status : 200;
		if (status === 200 || status === 204 || status === 0) {
			this.complete();
		} else {
			this.error("[" + http.status + "]" + http.statusText + ":" + http.responseURL);
		}
	}

	/**
	 * @private
	 * 请求错误的处理函数。
	 * @param	message 错误信息。
	 */
	private error(message: string): void {
		this.event(Event.ERROR, message);
	}

	/**
	 * @private
	 * 请求成功完成的处理函数。
	 */
	private complete(): void {
		var flag: boolean = true;
		try {
			this._data = this._http.response || this._http.responseText;
			this._data = JSON.parse(this._data);
			//加载成功，做出回调通知处理
			//百度，微信
			this.advsListArr = this._data.list;
			this._appid = this._data.appid;
			this.updateAdvsInfo();
			this.revertAdvsData();

		} catch (e) {
			flag = false;
			this.error(e.message);
		}
	}

	/**转换数据**/
	private getAdvsQArr(data: any): any[] {
		var tempArr: any[] = [];
		var gameAdvsObj: any = LocalStorage.getJSON("gameObj");
		for (var key in data) {
			var tempObj: any = data[key];
			if (gameAdvsObj && gameAdvsObj[tempObj.gameid] && !tempObj.isQiangZhi)
				continue;//如果游戏id之前点击过就跳过，放弃轮播显示
			tempArr.push(tempObj);
		}
		return tempArr;
	}

	/**
	 * @private
	 * 清除当前请求。
	 */
	private clear(): void {
		var http: any = this._http;
		http.onerror = http.onabort = http.onprogress = http.onload = null;
	}
	/**
	 * @override
	 * @param destroyChild 
	 */
 	destroy(destroyChild: boolean = true): void {
		ILaya.timer.clear(this, this.onLunbo);
		super.destroy(true);
		this.clear();
		ILaya.timer.clear(this, this.onGetAdvsListData);
	}
}

ClassUtils.regClass("laya.ui.AdvImage", AdvImage);
ClassUtils.regClass("Laya.AdvImage", AdvImage);