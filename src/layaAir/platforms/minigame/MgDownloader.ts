import { XML } from "../../laya/html/XML";
import { ProgressCallback } from "../../laya/net/BatchProgress";
import { DownloadCompleteCallback, Downloader } from "../../laya/net/Downloader";
import { URL } from "../../laya/net/URL";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { MgCacheManager } from "./MgCacheManager";

var mg: WechatMinigame.Wx;

export class MgDownloader extends Downloader {
    /**
     * @en Cache manager
     * @zh 缓存管理器
     */
    cacheManager: MgCacheManager;
    /**
     * @en Whether to enable cache
     * @zh 是否启用缓存
     */
    enableCache: boolean = true;
    /**
     * @en Whether to escape Chinese characters in URL
     * @zh 是否对URL中的中文字符进行转义
     */
    escapeZhCharsInURL: boolean = true;
    /**
     * @en Whether to support subpackage multi-level folder loading
     * @zh 是否支持分包多级文件夹加载
     */
    supportSubPackageMultiLevelFolders: boolean = true;

    private subPackages: Record<string, string>;

    constructor() {
        super();

        mg = PAL.global;

        URL.postFormatURL = this.postFormatURL.bind(this);
    }

    common(owner: any, url: string, originalUrl: string, contentType: string, onProgress: ProgressCallback, onComplete: DownloadCompleteCallback): void {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            if (contentType === "filePath")
                onComplete(url);
            this.readFile(url, contentType, onComplete);
            return;
        }

        Promise.resolve().then(() => {
            if (this.enableCache)
                return this.cacheManager.getFile(url);
            else
                return Promise.resolve(null);
        }).then(cacheFilePath => {
            if (cacheFilePath) {
                if (contentType === "filePath")
                    onComplete(cacheFilePath);
                else
                    this.readFile(cacheFilePath, contentType, onComplete);
            }
            else {
                this.downloadFile(url, onProgress, (filePath: string, error: string) => {
                    if (filePath) {
                        if (contentType === "filePath")
                            onComplete(filePath);
                        else
                            this.readFile(filePath, contentType, onComplete);
                    }
                    else
                        onComplete(null, error);
                });
            }
        });
    }

    image(owner: any, url: string, originalUrl: string, onProgress: ProgressCallback, onComplete: DownloadCompleteCallback): void {
        if (!url.startsWith("http://") && !url.startsWith("https://") || !this.enableCache) {
            super.image(owner, url, originalUrl, onProgress, onComplete);
            return;
        }

        this.cacheManager.getFile(url).then(cacheFilePath => {
            if (cacheFilePath)
                super.image(owner, cacheFilePath, originalUrl, onProgress, onComplete);
            else {
                this.downloadFile(url, onProgress, (filePath: string, error: string) => {
                    if (filePath)
                        super.image(owner, filePath, originalUrl, onProgress, onComplete);
                    else
                        onComplete(null, error);
                });
            }
        });
    }

    package(path: string, onProgress: ProgressCallback, onComplete: DownloadCompleteCallback): void {
        let packageName = path;
        if (!this.supportSubPackageMultiLevelFolders) {
            packageName = path.replace(/\//g, ".");
            if (packageName !== path) {
                if (!this.subPackages)
                    this.subPackages = {};
                this.subPackages[path] = packageName;
            }
        }

        let loadTask = mg.loadSubpackage({
            name: packageName,
            success: () => {
                onComplete(null);
            },
            fail: err => {
                onComplete(null, `${err.errMsg}(${err.errCode})`);
            },
            complete: null
        });

        onProgress && loadTask.onProgressUpdate && loadTask.onProgressUpdate(res => onProgress(res.progress));
    }

    private downloadFile(url: string, onProgress: ProgressCallback, onComplete: DownloadCompleteCallback): void {
        let task = mg.downloadFile({
            url,
            success: (res) => {
                if (res.statusCode === 200) {
                    if (this.enableCache)
                        this.cacheManager.addFile(url, res.tempFilePath);
                    onComplete(res.tempFilePath);
                }
                else {
                    onComplete(null, res.statusCode + " " + res.errMsg);
                }
            },
            fail: (err) => onComplete(null, err.errMsg)
        });
        if (onProgress) {
            task.onProgressUpdate((res) => {
                onProgress(res.progress);
            });
        }
    }

    private readFile(url: string, contentType: string, onComplete: DownloadCompleteCallback) {
        let filePath = this.urlToFilePath(url);
        PAL.fs.readFile(filePath, contentType === "arraybuffer" ? "" : "utf8").then(data => {
            switch (contentType) {
                case "json":
                    onComplete(JSON.parse(<string>data));
                    break;
                case "xml":
                    onComplete(new XML(<string>data));
                    break;
                default:
                    onComplete(data);
                    break;
            }
        }).catch((err: WechatMinigame.FileError) => onComplete(null, `${err.errMsg}(${err.errCode})`));
    }

    private urlToFilePath(url: string): string {
        let i = url.lastIndexOf("?");
        if (i != -1)
            return url.substring(0, i);
        else
            return url;
    }

    private postFormatURL(url: string): string {
        if (!this.supportSubPackageMultiLevelFolders && this.subPackages) {
            for (let k in this.subPackages) {
                if (url.startsWith(k)) {
                    url = this.subPackages[k] + url.substring(k.length);
                    break;
                }
            }
        }

        if (!this.escapeZhCharsInURL)
            return url;

        // 处理URL中的中文字符
        let str: string = "";
        let len = url.length;
        for (let i = 0; i < len; i++) {
            let word = url[i];
            if (IGNORE.test(word)) {
                str += word;
            }
            else {
                try {
                    str += encodeURI(word);
                }
                catch (e) {
                    console.log("errorInfo", ">>>" + word);
                }
            }
        }

        return str;
    }
}

const IGNORE = new RegExp("[-_.!~*'();/?:@&=+$,#%]|[0-9|A-Z|a-z]");
