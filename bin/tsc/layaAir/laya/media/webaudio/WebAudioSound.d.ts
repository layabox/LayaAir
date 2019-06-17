import { EventDispatcher } from "../../events/EventDispatcher";
import { SoundChannel } from "../SoundChannel";
/**
 * @private
 * web audio api方式播放声音
 */
export declare class WebAudioSound extends EventDispatcher {
    private static _dataCache;
    /**
     * 是否支持web audio api
     */
    static webAudioEnabled: boolean;
    /**
     * 播放设备
     */
    static ctx: any;
    /**
     * 当前要解码的声音文件列表
     */
    static buffs: any[];
    /**
     * 是否在解码中
     */
    static isDecoding: boolean;
    /**
     * 用于播放解锁声音以及解决Ios9版本的内存释放
     */
    static _miniBuffer: any;
    /**
     * 事件派发器，用于处理加载解码完成事件的广播
     */
    static e: EventDispatcher;
    /**
     * 是否已解锁声音播放
     */
    private static _unlocked;
    /**
     * 当前解码的声音信息
     */
    static tInfo: any;
    private static __loadingSound;
    /**
     * 声音URL
     */
    url: string;
    /**
     * 是否已加载完成
     */
    loaded: boolean;
    /**
     * 声音文件数据
     */
    data: ArrayBuffer;
    /**
     * 声音原始文件数据
     */
    audioBuffer: any;
    /**
     * 待播放的声音列表
     */
    private __toPlays;
    /**
     * @private
     */
    private _disposed;
    /**
     * 解码声音文件
     *
     */
    static decode(): void;
    /**
     * 解码成功回调
     * @param audioBuffer
     *
     */
    private static _done;
    /**
     * 解码失败回调
     * @return
     *
     */
    private static _fail;
    /**
     * 播放声音以解锁IOS的声音
     *
     */
    private static _playEmptySound;
    /**
     * 尝试解锁声音
     *
     */
    private static _unlock;
    static initWebAudio(): void;
    /**
     * 加载声音
     * @param url
     *
     */
    load(url: string): void;
    private _err;
    private _loaded;
    private _removeLoadEvents;
    private __playAfterLoaded;
    /**
     * 播放声音
     * @param startTime 起始时间
     * @param loops 循环次数
     * @return
     *
     */
    play(startTime?: number, loops?: number, channel?: SoundChannel): SoundChannel;
    readonly duration: number;
    dispose(): void;
}
