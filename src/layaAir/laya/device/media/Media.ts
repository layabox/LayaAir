import { ILaya } from "../../../ILaya";
import { Handler } from "../../utils/Handler";


/**
 * Media用于捕捉摄像头和麦克风。可以捕捉任意之一，或者同时捕捉两者。<code>getCamera</code>前可以使用<code>supported()</code>检查当前浏览器是否支持。
 * <b>NOTE:</b>
 * <p>目前Media在移动平台只支持Android，不支持IOS。只可在FireFox完整地使用，Chrome测试时无法捕捉视频。</p>
 */
export class Media {
    constructor() {

    }

    /**
     * 检查浏览器兼容性。
     */
    static supported(): boolean {
        return !!ILaya.Browser.window.navigator.getUserMedia;
    }

    /**
     * 获取用户媒体。
     * @param	options	简单的可选项可以使<code>{ audio:true, video:true }</code>表示同时捕捉两者。详情见<i>https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia</i>。
     * @param	onSuccess 获取成功的处理器，唯一参数返回媒体的Blob地址，可以将其传给Video。
     * @param	onError	获取失败的处理器，唯一参数是Error。
     */
    static getMedia(options: any, onSuccess: Handler, onError: Handler): void {
        if (ILaya.Browser.window.navigator.getUserMedia) {
            ILaya.Browser.window.navigator.getUserMedia(options, function (stream: string): void {
                onSuccess.runWith(ILaya.Browser.window.URL.createObjectURL(stream));
            }, function (err: Error): void {
                    onError.runWith(err);
                });
        }
    }
}

