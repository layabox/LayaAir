import { GeolocationInfo } from "./GeolocationInfo";
import { Handler } from "../../utils/Handler";


/**
 * @en A class that encapsulates Geolocation-related functionalities can check if the browser supports the Geolocation API by using `Geolocation.supported`.
 * @zh 封装了地理位置相关功能的类，可以通过`Geolocation.supported`查看浏览器是否支持地理位置API。
 */
export class Geolocation {
    private static navigator = navigator;
    private static position: GeolocationInfo = new GeolocationInfo();

    /**
     * @en Indicates failure to get geographical information due to denied permission.
     * @zh 表示由于权限被拒绝造成的地理信息获取失败。
     */
    static PERMISSION_DENIED: number = 1;
    /**
     * @en Indicates failure to get geographical information due to an internal error from the location source.
     * @zh 表示由于内部位置源返回了内部错误导致地理信息获取失败。
     */
    static POSITION_UNAVAILABLE: number = 2;
    /**
     * @en Whether the runtime environment supports the Geolocation API.
     * @zh 信息获取所用时长超出`timeout`所设置时长。
     */
    static TIMEOUT: number = 3;

    /**
     * @en Whether the runtime environment supports the Geolocation API.
     * @zh 运行环境是否支持地理位置API。
     */
    static supported: boolean = !!Geolocation.navigator.geolocation;

    /**
     * @en If `enableHighAccuracy` set to true, and if the device can provide a more accurate location, it will get the best possible results.
     * Note that this may lead to slower response times or increased power consumption (such as when using GPS).
     * On the other hand, if set to false, it will get faster response and less power consumption.
     * The default value is false.
     * @zh 如果`enableHighAccuracy`设置为 true，并且设备能够提供一个更精确的位置，则会获取最佳可能的结果。
     * 请注意，这可能会导致响应时间变慢或电量消耗增加（例如使用 GPS）。
     * 另一方面，如果设置为 false，将会得到更快的响应和更少的电量消耗。
     * 默认值为 false。
     */
    static enableHighAccuracy: boolean = false;

    /**
     * @en Represents the maximum duration allowed for the device to obtain the location. The default is Infinity, meaning getCurentPosition() will not return until the location is available.
     * @zh 表示允许设备获取位置的最长时间。默认为 Infinity，意味着 `getCurentPosition()` 直到位置可用时才会返回信息。
     */
    static timeout: number = 1E10;

    /**
     * @en Represents the maximum age of the cached location information that can be returned.
     * If set to 0, it means the device does not use cached locations and attempts to obtain a real-time location.
     * If set to Infinity, the device must return a cached location regardless of its age.
     * @zh 表示可被返回的缓存位置信息的最大时限。
     * 如果设置为 0，意味着设备不使用缓存位置，并且尝试获取实时位置。
     * 如果设置为 Infinity，设备必须返回缓存位置而无论其时限。
     */
    static maximumAge: number = 0;

    constructor() {
    }

    /**
     * @en Gets the device's current position.
     * @param onSuccess Callback handler with a unique `Position` parameter.
     * @param onError Optional. Callback handler with an error message. Error code is one of Geolocation.PERMISSION_DENIED, Geolocation.POSITION_UNAVAILABLE, and Geolocation.TIMEOUT.
     * @zh 获取设备当前位置。
     * @param onSuccess 带有唯一 `Position` 参数的回调处理器。
     * @param onError 可选的。带有错误信息的回调处理器。错误代码为 Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE 和 Geolocation.TIMEOUT 之一。
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
     * @en Watches the device's current position. The callback handler is executed when the device's position changes.
     * @param onSuccess Callback handler with a unique `Position` parameter.
     * @param onError Optional. Callback handler with an error message. Error code is one of Geolocation.PERMISSION_DENIED, Geolocation.POSITION_UNAVAILABLE, and Geolocation.TIMEOUT.
     * @zh 监视设备当前位置。回调处理器在设备位置改变时被执行。
     * @param onSuccess 带有唯一 `Position` 参数的回调处理器。
     * @param onError 可选的。带有错误信息的回调处理器。错误代码为 Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE 和 Geolocation.TIMEOUT 之一。
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
     * @en Removes the specified handler installed by `watchPosition`.
     * @param id The ID of the watch position handler to clear.
     * @zh 移除 `watchPosition` 安装的指定处理器。
     * @param id 要清除的监视位置处理器的 ID。
     */
    static clearWatch(id: number): void {
        Geolocation.navigator.geolocation.clearWatch(id);
    }
}

