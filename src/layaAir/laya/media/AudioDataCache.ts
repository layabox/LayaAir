import { Config } from "../../Config";
import { ILaya } from "../../ILaya";
import { Loader } from "../net/Loader";
import { Browser } from "../utils/Browser";

const EXPIRE_TIME = 30000; // 30s
const CHECK_INTERVAL = 10000; // 10s

/**
 * @en Audio data cache manager. It uses a least recently used (LRU) caching strategy to manage cached audio data.
 * @zh 音频数据缓存管理器。内部使用了最少最近使用（LRU）缓存策略来管理缓存的音频数据。
 */
export class AudioDataCache {
    private _items: Record<string, { obj: any, size: number, time: number }>;
    private _size: number = 0;
    private _lastCheck: number = 0;

    constructor() {
        this._items = {};
    }

    /**
     * @en Add an audio data to the cache.
     * @param url The URL of the audio data.
     * @param obj The AudioBuffer object.
     * @param size The size of the audio data in bytes. 
     * @zh 将音频数据添加到缓存中。
     * @param url 音频数据的 URL。
     * @param obj AudioBuffer 对象。
     * @param size 音频数据的大小（字节）。
     */
    add(url: string, obj: any, size: number): void {
        if (this._items[url])
            this._size -= this._items[url].size;

        let time = Browser.now();
        this._items[url] = { obj, size: size, time };
        this._size += size;
        if (this._size > Config.audioBufferCacheMaxSize && time - this._lastCheck > CHECK_INTERVAL) {
            this._lastCheck = time;
            for (let key in this._items) {
                let item2 = this._items[key];
                if (time - item2.time > EXPIRE_TIME) {
                    this._size -= item2.size;
                    delete this._items[key];
                    console.debug("AudioDataCache: remove " + key);
                }
            }
        }
    }

    /**
     * @en Get an audio data from the cache.
     * @param url The URL of the audio data.
     * @param callback The callback function to be called with the audio data.
     * @param callbackThis The context of the callback function.
     * @zh 从缓存中获取音频数据。
     * @param url 音频数据的 URL。
     * @param callback 回调函数，将音频数据传递给它。
     * @param callbackThis 回调函数的上下文。
     */
    get(url: string, callback: (obj: any) => void, callbackThis?: any): void {
        let item = this._items[url];
        if (item != null) {
            item.time = Browser.now();
            callback.call(callbackThis, item.obj);
            return;
        }

        //不需要在Loader里cache
        ILaya.loader.load(url, { type: Loader.SOUND, cache: false }).then(buffer => {
            if (buffer)
                this.add(url, buffer, buffer.__byteLength);
            callback.call(callbackThis, buffer);
        });
    }
}