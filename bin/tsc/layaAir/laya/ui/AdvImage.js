import { Image } from "./Image";
import { Event } from "../events/Event";
import { LocalStorage } from "../net/LocalStorage";
import { Browser } from "../utils/Browser";
import { ILaya } from "../../ILaya";
/**
 * 广告插件
 * @author 小松
 * @date -2018-09-19
 */
export class AdvImage extends Image {
    constructor(skin = null) {
        super();
        /**广告列表数据**/
        this.advsListArr = [];
        /**资源列表请求地址**/
        this.resUrl = "https://unioncdn.layabox.com/config/iconlist.json";
        /**加载请求实例**/
        this._http = new Browser.window.XMLHttpRequest();
        /**广告列表信息**/
        this._data = [];
        /**每6分钟重新请求一次新广告列表**/
        this._resquestTime = 360000;
        /**播放索引**/
        this._playIndex = 0;
        /**轮播间隔时间**/
        this._lunboTime = 5000;
        this.skin = skin;
        this.setLoadUrl();
        this.init();
        this.size(120, 120);
    }
    /**设置导量加载地址**/
    setLoadUrl() {
        if (Browser.onLimixiu) {
            this.resUrl = "https://abc.layabox.com/public/wyw/gconfig.json";
        }
    }
    init() {
        if (this.isSupportJump()) {
            //这里需要去加载广告列表资源信息
            if (Browser.onMiniGame || Browser.onBDMiniGame) {
                ILaya.timer.loop(this._resquestTime, this, this.onGetAdvsListData);
            }
            this.onGetAdvsListData();
            this.initEvent();
        }
        else
            this.visible = false;
    }
    initEvent() {
        this.on(Event.CLICK, this, this.onAdvsImgClick);
    }
    onAdvsImgClick() {
        var currentJumpUrl = this.getCurrentAppidObj();
        if (currentJumpUrl)
            this.jumptoGame();
    }
    revertAdvsData() {
        if (this.advsListArr[this._playIndex]) {
            this.visible = true;
            if (Browser.onLimixiu) {
                var ww = "https://abc.layabox.com/public/icon/";
                this.visible = true;
                var advsObj = this.advsListArr[this._playIndex];
                if (advsObj) {
                    if (ILaya.Browser.onLimixiu && window.GameStatusInfo.gameId == advsObj.gameid) {
                        this.onLunbo();
                    }
                    else {
                        this.skin = ww + advsObj.iconUrl;
                        this.size(103, 126);
                    }
                }
            }
            else {
                this.skin = this.advsListArr[this._playIndex];
            }
        }
    }
    /**当前小游戏环境是否支持游戏跳转功能**/
    isSupportJump() {
        if (Browser.onMiniGame) {
            var isSupperJump = window.wx.navigateToMiniProgram instanceof Function;
            return isSupperJump;
        }
        else if (Browser.onLimixiu) {
            if (window.BK.QQ.skipGame)
                return true;
        }
        else if (Browser.onBDMiniGame)
            return true;
        return false;
    }
    /**
     * 跳转游戏
     * @param callBack Function 回调参数说明：type 0 跳转成功；1跳转失败；2跳转接口调用成功
     */
    jumptoGame() {
        var advsObj = this.advsListArr[this._playIndex];
        var desGameId = parseInt(advsObj.gameid); //跳转的gameid，必须为数字
        var extendInfo = advsObj.extendInfo; //额外参数，必须为字符串
        var path = advsObj.path; //扩展数据
        if (Browser.onLimixiu) {
            //根据轮播状态处理数据，非轮播点击一次需要从数组中移除
            if (!advsObj.isLunBo) {
                //根据轮播状态处理数据，非轮播点击一次需要从数组中移除
                if (!advsObj.isLunBo) {
                    //存储点击取消的游戏id数据
                    var gameAdvsObj = LocalStorage.getJSON("gameObj");
                    if (!gameAdvsObj) {
                        gameAdvsObj = {};
                    }
                    if (!gameAdvsObj[advsObj.gameid]) {
                        gameAdvsObj[advsObj.gameid] = {};
                    }
                    gameAdvsObj[advsObj.gameid] = { isclick: true };
                    LocalStorage.setJSON("gameObj", gameAdvsObj);
                    this.advsListArr.splice(this._playIndex, 1);
                }
            }
            window.BK.QQ.skipGame(desGameId, extendInfo);
            this.updateAdvsInfo();
        }
        else if (Browser.onMiniGame) {
            if (this.isSupportJump()) {
                window.wx.navigateToMiniProgram({
                    appId: this._appid,
                    path: "",
                    extraData: "",
                    envVersion: "release",
                    success: function success() {
                        console.log("-------------跳转成功--------------");
                    },
                    fail: function fail() {
                        console.log("-------------跳转失败--------------");
                    },
                    complete: function complete() {
                        console.log("-------------跳转接口调用成功--------------");
                        this.updateAdvsInfo();
                    }.bind(this)
                });
            }
        }
        else if (Browser.onBDMiniGame) {
        }
        else {
            this.visible = false;
        }
    }
    updateAdvsInfo() {
        this.visible = false;
        this.onLunbo();
        ILaya.timer.loop(this._lunboTime, this, this.onLunbo);
    }
    onLunbo() {
        if (this._playIndex >= this.advsListArr.length - 1)
            this._playIndex = 0;
        else
            this._playIndex += 1;
        this.visible = true;
        this.revertAdvsData();
    }
    /**获取轮播数据**/
    getCurrentAppidObj() {
        return this.advsListArr[this._playIndex];
    }
    /**
     * 获取广告列表数据信息
     */
    onGetAdvsListData() {
        var _this = this;
        var random = AdvImage.randRange(10000, 1000000);
        var url = this.resUrl + "?" + random;
        this._http.open("get", url, true);
        this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        this._http.responseType = "text";
        this._http.onerror = function (e) {
            _this._onError(e);
        };
        this._http.onload = function (e) {
            _this._onLoad(e);
        };
        this._http.send(null);
    }
    /**
     * 生成指定范围的随机数
     * @param {*} minNum 最小值
     * @param {*} maxNum 最大值
     */
    static randRange(minNum, maxNum) {
        return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
    }
    /**
     * @private
     * 请求出错侦的听处理函数。
     * @param	e 事件对象。
     */
    _onError(e) {
        this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
    }
    /**
     * @private
     * 请求消息返回的侦听处理函数。
     * @param	e 事件对象。
     */
    _onLoad(e) {
        var http = this._http;
        var status = http.status !== undefined ? http.status : 200;
        if (status === 200 || status === 204 || status === 0) {
            this.complete();
        }
        else {
            this.error("[" + http.status + "]" + http.statusText + ":" + http.responseURL);
        }
    }
    /**
     * @private
     * 请求错误的处理函数。
     * @param	message 错误信息。
     */
    error(message) {
        this.event(Event.ERROR, message);
    }
    /**
     * @private
     * 请求成功完成的处理函数。
     */
    complete() {
        var flag = true;
        try {
            this._data = this._http.response || this._http.responseText;
            this._data = JSON.parse(this._data);
            //加载成功，做出回调通知处理
            if (Browser.onLimixiu) {
                //玩一玩
                this.advsListArr = this.getAdvsQArr(this._data);
                if (this.advsListArr.length) {
                    this.updateAdvsInfo();
                    this.revertAdvsData();
                }
                else {
                    this.visible = false;
                }
            }
            else {
                //百度，微信
                this.advsListArr = this._data.list;
                this._appid = this._data.appid;
                this.updateAdvsInfo();
                this.revertAdvsData();
            }
        }
        catch (e) {
            flag = false;
            this.error(e.message);
        }
    }
    /**转换数据**/
    getAdvsQArr(data) {
        var tempArr = [];
        var gameAdvsObj = LocalStorage.getJSON("gameObj");
        for (var key in data) {
            var tempObj = data[key];
            if (gameAdvsObj && gameAdvsObj[tempObj.gameid] && !tempObj.isQiangZhi)
                continue; //如果游戏id之前点击过就跳过，放弃轮播显示
            tempArr.push(tempObj);
        }
        return tempArr;
    }
    /**
     * @private
     * 清除当前请求。
     */
    clear() {
        var http = this._http;
        http.onerror = http.onabort = http.onprogress = http.onload = null;
    }
    /*override*/ destroy(destroyChild = true) {
        ILaya.timer.clear(this, this.onLunbo);
        super.destroy(true);
        this.clear();
        ILaya.timer.clear(this, this.onGetAdvsListData);
    }
}
