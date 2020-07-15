import { GeolocationInfo } from "./GeolocationInfo";
import { ILaya } from "../../../ILaya";
import { Handler } from "../../utils/Handler";


/**
 * 使用前可用<code>supported</code>查看浏览器支持。
 */
export class Geolocation {
    private static navigator = navigator;
    private static position: GeolocationInfo = new GeolocationInfo();

    /**
     * 由于权限被拒绝造成的地理信息获取失败。
     */
    static PERMISSION_DENIED: number = 1;
    /**
     * 由于内部位置源返回了内部错误导致地理信息获取失败。
     */
    static POSITION_UNAVAILABLE: number = 2;
    /**
     * 信息获取所用时长超出<code>timeout</code>所设置时长。
     */
    static TIMEOUT: number = 3;

    /**
     * 是否支持。
     */
    static supported: boolean = !!Geolocation.navigator.geolocation;

    /**
     * 如果<code>enableHighAccuracy</code>为true，并且设备能够提供一个更精确的位置，则会获取最佳可能的结果。
     * 请注意,这可能会导致较慢的响应时间或增加电量消耗（如使用GPS）。
     * 另一方面，如果设置为false，将会得到更快速的响应和更少的电量消耗。
     * 默认值为false。
     */
    static enableHighAccuracy: boolean = false;
    /**
     * 表示允许设备获取位置的最长时间。默认为Infinity，意味着getCurentPosition()直到位置可用时才会返回信息。
     */

    static timeout: number = 1E10;
    /**
     * 表示可被返回的缓存位置信息的最大时限。
     * 如果设置为0，意味着设备不使用缓存位置，并且尝试获取实时位置。
     * 如果设置为Infinity，设备必须返回缓存位置而无论其时限。
     */
    static maximumAge: number = 0;

    constructor() {
    }

    /**
     * 获取设备当前位置。
     * @param	onSuccess	带有唯一<code>Position</code>参数的回调处理器。
     * @param	onError		可选的。带有错误信息的回调处理器。错误代码为Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE和Geolocation.TIMEOUT之一。
     */
    static getCurrentPosition(onSuccess: Handler, onError: Handler = null): void {
        Geolocation.navigator.geolocation.getCurrentPosition(function (pos: any): void {
            Geolocation.position.setPosition(pos);
            onSuccess.runWith(Geolocation.position);
        },
            function (error: any): void {
                onError.runWith(error);
            },
            {
                enableHighAccuracy: Geolocation.enableHighAccuracy,
                timeout: Geolocation.timeout,
                maximumAge: Geolocation.maximumAge
            });
    }

    /**
     * 监视设备当前位置。回调处理器在设备位置改变时被执行。
     * @param	onSuccess	带有唯一<code>Position</code>参数的回调处理器。
     * @param	onError		可选的。带有错误信息的回调处理器。错误代码为Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE和Geolocation.TIMEOUT之一。
     */
    static watchPosition(onSuccess: Handler, onError: Handler): number {
        return Geolocation.navigator.geolocation.watchPosition(function (pos: any): void {
            Geolocation.position.setPosition(pos);
            onSuccess.runWith(Geolocation.position);
        },
            function (error: any): void {
                onError.runWith(error);
            },
            {
                enableHighAccuracy: Geolocation.enableHighAccuracy,
                timeout: Geolocation.timeout,
                maximumAge: Geolocation.maximumAge
            });
    }

    /**
     * 移除<code>watchPosition</code>安装的指定处理器。
     * @param	id
     */
    static clearWatch(id: number): void {
        Geolocation.navigator.geolocation.clearWatch(id);
    }
}

