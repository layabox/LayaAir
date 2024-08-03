import { ILaya } from "../../../ILaya";
import { Handler } from "../../utils/Handler";


/**
 * @en The Media class is used for capturing camera and microphone input. You can capture either one or both simultaneously. Before calling getCamera, you can use supported() to check if the current browser supports it.
 * NOTE:
 * Currently, Media only supports Android on mobile platforms, not iOS. It can only be fully used in FireFox; testing in Chrome does not capture video.
 * @zh Media 类用于捕捉摄像头和麦克风。可以单独捕捉任一设备，或者同时捕捉两者。在使用之前，可以使用 `Media.supported()` 方法检查当前浏览器是否支持。
 * NOTE:
 * 目前 Media 仅在移动平台上支持 Android，不支持 iOS。只能在 FireFox 中完整使用，在 Chrome 中测试时无法捕捉视频。
 */
export class Media {
    constructor() {

    }

    /**
     * @en Check browser compatibility
     * @zh 检查浏览器兼容性。
     */
    static supported(): boolean {
        return !!ILaya.Browser.window.navigator.getUserMedia;
    }

    /**
     * @en Access the user's media devices (capture camera and microphone).
     * @param options A simple set of options like { audio: true, video: true } to indicate capturing both. For more details, see <i>https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia</i>.
     * @param onSuccess The success handler which is called with a single argument: the Blob URL of the media, which can be used with the Video element.
     * @param onError The error handler which is called with a single argument: the Error object.
     * @zh 获取用户的媒体设备（捕捉摄像头和麦克风）。
     * @param options 简单的可选项，如 { audio: true, video: true } 表示同时捕捉两者。更详细信息请查看 <i>https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia</i>。
     * @param onSuccess 获取成功的处理器，唯一参数返回媒体的 Blob 地址，可以将其传给 Video 。
     * @param onError 获取失败的处理器，唯一参数是 Error 对象。
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

