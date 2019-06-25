import { Image } from "././Image";
/**
 * 广告插件
 * @author 小松
 * @date -2018-09-19
 */
export declare class AdvImage extends Image {
    /**广告列表数据**/
    private advsListArr;
    /**资源列表请求地址**/
    private resUrl;
    /**加载请求实例**/
    private _http;
    /**广告列表信息**/
    private _data;
    /**每6分钟重新请求一次新广告列表**/
    private _resquestTime;
    /**微信跳转appid**/
    private _appid;
    /**播放索引**/
    private _playIndex;
    /**轮播间隔时间**/
    private _lunboTime;
    constructor(skin?: string);
    /**设置导量加载地址**/
    private setLoadUrl;
    private init;
    private initEvent;
    private onAdvsImgClick;
    private revertAdvsData;
    /**当前小游戏环境是否支持游戏跳转功能**/
    isSupportJump(): boolean;
    /**
     * 跳转游戏
     * @param callBack Function 回调参数说明：type 0 跳转成功；1跳转失败；2跳转接口调用成功
     */
    private jumptoGame;
    private updateAdvsInfo;
    private onLunbo;
    /**获取轮播数据**/
    private getCurrentAppidObj;
    /**
     * 获取广告列表数据信息
     */
    private onGetAdvsListData;
    /**
     * 生成指定范围的随机数
     * @param {*} minNum 最小值
     * @param {*} maxNum 最大值
     */
    static randRange(minNum: any, maxNum: any): number;
    /**
     * @private
     * 请求出错侦的听处理函数。
     * @param	e 事件对象。
     */
    private _onError;
    /**
     * @private
     * 请求消息返回的侦听处理函数。
     * @param	e 事件对象。
     */
    private _onLoad;
    /**
     * @private
     * 请求错误的处理函数。
     * @param	message 错误信息。
     */
    private error;
    /**
     * @private
     * 请求成功完成的处理函数。
     */
    private complete;
    /**转换数据**/
    private getAdvsQArr;
    /**
     * @private
     * 清除当前请求。
     */
    private clear;
    destroy(destroyChild?: boolean): void;
}
