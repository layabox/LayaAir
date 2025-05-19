import { XML } from "../../laya/html/XML";
import { ProgressCallback } from "../../laya/net/BatchProgress";
import { DownloadCompleteCallback, Downloader } from "../../laya/net/Downloader";
import { URL } from "../../laya/net/URL";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { getErrorMsg } from "../../laya/utils/Error";
import { MgCacheManager } from "./MgCacheManager";

export class MgDownloader extends Downloader {
    /**
     * @en Cache manager
     * @zh 缓存管理器
     */
    cacheManager: MgCacheManager;
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

        let old = URL.postFormatURL;
        URL.postFormatURL = url => {
            url = this.escapeURL(url);
            return old.call(this, url);
        };

        if (Browser.onVVMiniGame || Browser.onQGMiniGame) //vivo&oppo
            this.supportSubPackageMultiLevelFolders = false;

        if (Browser.onWXMiniGame) //微信小游戏不需要这个
            this.escapeZhCharsInURL = false;

        let cacheRoot: string;
        if (Browser.onVVMiniGame)
            cacheRoot = "internal://files/layaCache";
        else
            cacheRoot = PAL.g.env.USER_DATA_PATH + "/layaCache";
        this.cacheManager = new MgCacheManager(cacheRoot);
    }

    common(owner: any, url: string, originalUrl: string, contentType: string, onProgress: ProgressCallback, onComplete: DownloadCompleteCallback): void {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            if (contentType === "filePath")
                onComplete(url);
            this.readFile(url, contentType, onComplete);
            return;
        }

        Promise.resolve().then(() => {
            if (this.cacheManager)
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
        if (!url.startsWith("http://") && !url.startsWith("https://") || !this.cacheManager) {
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

        let loadTask = PAL.g.loadSubpackage({
            name: packageName,
            success: () => {
                onComplete(null);
            },
            fail: err => {
                onComplete(null, getErrorMsg(err));
            },
            complete: null
        });

        onProgress && loadTask.onProgressUpdate && loadTask.onProgressUpdate(res => onProgress(res.progress));
    }

    protected downloadFile(url: string, onProgress: ProgressCallback, onComplete: DownloadCompleteCallback): void {
        let task = PAL.g.downloadFile({
            url,
            success: (res) => {
                if (res.statusCode == null || res.statusCode === 200) {
                    let filePath = res.tempFilePath || (res as any).apFilePath; //淘宝用apFilePath
                    if (this.cacheManager)
                        this.cacheManager.addFile(url, filePath);
                    onComplete(filePath);
                }
                else {
                    onComplete(null, getErrorMsg(res));
                }
            },
            fail: (err) => onComplete(null, getErrorMsg(err))
        });

        if (onProgress && task && task.onProgressUpdate) {
            task.onProgressUpdate((res) => {
                onProgress(res.progress);
            });
        }
    }

    protected readFile(url: string, contentType: string, onComplete: DownloadCompleteCallback) {
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
        }).catch(err => onComplete(null, getErrorMsg(err)));
    }

    private urlToFilePath(url: string): string {
        let i = url.lastIndexOf("?");
        if (i != -1)
            return url.substring(0, i);
        else
            return url;
    }

    protected escapeURL(url: string): string {
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
                    console.warn("errorInfo", ">>>" + word);
                }
            }
        }

        return str;
    }
}

const IGNORE = new RegExp("[-_.!~*'();/?:@&=+$,#%]|[0-9|A-Z|a-z]");
