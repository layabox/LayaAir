import { ILaya } from "../../ILaya";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { Byte } from "../../laya/utils/Byte";
import { getErrorMsg } from "../../laya/utils/Error";
import { Utils } from "../../laya/utils/Utils";

interface ICachedFileInfo {
    group: number;
    url: string;
    fileName: string;
    accessTime: number;
    size: number;
}

//使用的缓存子目录数量
const GROUP_COUNT = 5;

export class MgCacheManager {
    /** 
     * @en Minimum space to be cleared when the cache is full
     * @zh 缓存容量满时每次清理容量值 
     */
    static minClearSpace: number = (5 * 1024 * 1024);
    /** 
     * @en Maximum capacity of cache directory
     * @zh 缓存目录的最大容量
     */
    static spaceLimit: number = (200 * 1024 * 1024);
    /**
     * @en The interval time for processing cache requests, in milliseconds
     * @zh 处理缓存请求的间隔时间，单位是毫秒
     */
    static processInterval: number = 2000;
    /**
     * @en The interval time for saving file access time, in milliseconds. This time can be long, because it does not matter if the access time is not accurate.
     * @zh 保存文件访问时间的间隔时间，单位是毫秒。这个时间可以很长，因为访问时间就算不对问题也不大。
     */
    static saveAccessTimeInterval: number = 15000; //保存文件访问时间的间隔

    private cacheRoot: string;
    private totalFileSize: number = 0;
    private cacheGroups: Array<number>;
    private fileCache: Map<string, ICachedFileInfo>;
    private cacheRequest: Array<{ url: string, tempFilePath: string, size: number }>;
    private running: boolean = false;
    private toSaveManifestFlags: Array<boolean>;
    private toSaveManifestRequest: number;
    private lastGroup: number = -1;
    private lastGroupUsed: number = 0;
    private toClear: number = 0; //1-clear once,2-clear all

    constructor(cacheRoot: string) {
        this.cacheRoot = cacheRoot;
        this.fileCache = new Map();
        this.cacheGroups = new Array(GROUP_COUNT);
        this.cacheGroups.fill(0);
        this.cacheRequest = [];
        this.toSaveManifestFlags = new Array(GROUP_COUNT);
    }

    /** @internal */
    start(): Promise<void> {
        //不用等他返回，因为不影响我们的逻辑
        this.checkAndDeleteOldCacheDir();

        return this.createCacheDirs().then(() => this.loadAllManifests()).then(() => {
            ILaya.systemTimer.loop(MgCacheManager.processInterval, this, this.process);
        });
    }

    /**
     * @en Get a file from the cache, if it is not in the cache, return null.
     * @param url The URL of the file to be retrieved.
     * @returns The path of the cached file, or null if it is not in the cache.
     * @zh 从缓存中获取文件，如果不在缓存中，则返回null。
     * @param url 要获取的文件的URL。
     * @returns 缓存文件的路径，如果不在缓存中，则返回null。
     */
    getFile(url: string): Promise<string | null> {
        let info = this.fileCache.get(url);
        if (!info)
            return Promise.resolve(null);

        info.accessTime = this.toSaveManifestRequest = Browser.now();
        this.toSaveManifestFlags[info.group] = true;

        let cacheFilePath: string = `${this.cacheRoot}/${info.group}/${info.fileName}`;
        return PAL.fs.exists(cacheFilePath).then(exists => exists ? cacheFilePath : null);
    }

    /**
     * @en Add a file to the cache.
     * @param url The URL of the file to be cached. 
     * @param tempFilePath The temporary file path of the file to be cached.
     * @zh 将文件添加到缓存中。
     * @param url 要缓存的文件的URL。
     * @param tempFilePath 要缓存的文件的临时文件路径。 
     */
    addFile(url: string, tempFilePath: string): void {
        PAL.fs.getFileSize(tempFilePath).then(size => this.cacheRequest.push({ url, tempFilePath, size }))
            .catch(err => {
                console.warn("[Cache]get file size error", getErrorMsg(err));
            });
    }

    /**
     * @en Clear all cache files. This method will not be executed immediately, but will be executed in the subsequent processing cycle.
     * @zh 清除所有缓存文件。这个方法不会立即执行，而是在后续的处理周期中执行。
     */
    clearAllCache(): void {
        this.toClear = 2;
    }

    private process() {
        if (this.running)
            return;

        if (this.toClear != 0) {
            this.running = true;
            this.toClear = 0;
            if ((this.toClear & 2) !== 0)
                this.doClearAllCache().then(() => this.running = false);
            else
                this.clearSpace(0).then(() => this.saveDirtyManifests()).then(() => this.running = false);
            return;
        }

        if (this.cacheRequest.length === 0) {
            if (this.toSaveManifestRequest != null && Browser.now() - this.toSaveManifestRequest > MgCacheManager.saveAccessTimeInterval) { //保存最后访问时间的优先级比较低，我们5秒检查一次
                this.toSaveManifestRequest = null;
                this.running = true;
                this.saveDirtyManifests().then(() => this.running = false);
            }
            return;
        }

        this.running = true;

        let files = this.cacheRequest.concat();
        this.cacheRequest.length = 0;

        //整个批次加入同一个组，这样只需要保存一个清单文件
        let group = this.selectGroup(files.length);

        let needSpace = 0;
        for (let info of files)
            needSpace += info.size;
        let toClearSpace = this.totalFileSize + needSpace - MgCacheManager.spaceLimit;

        this.clearSpace(toClearSpace)
            .then(() => this.addFilesToCache(files, group))
            .then(() => this.saveDirtyManifests())
            .then(() => this.running = false);
    }

    private selectGroup(fileCount: number): number {
        //每个组使用50次再切换，避免每次计算
        if (this.lastGroup >= 0 && this.lastGroupUsed < 50) {
            this.lastGroupUsed += fileCount;
            return this.lastGroup;
        }

        let min = Number.MAX_VALUE;
        let j: number;
        for (let i = 0; i < GROUP_COUNT; i++) {
            if (this.cacheGroups[i] < min - 50) {
                min = this.cacheGroups[i];
                j = i;
            }
        }

        this.lastGroup = j;
        this.lastGroupUsed = fileCount;
        return j;
    }

    private addFilesToCache(files: typeof this.cacheRequest, group: number): Promise<void> {
        for (let { url, tempFilePath, size } of files) {
            let info = this.fileCache.get(url);
            if (info) { //肯定是文件莫名不存在了，才会进到这里
                this.cacheGroups[info.group]--;
                this.totalFileSize -= info.size;
                this.fileCache.delete(url);

                info.accessTime = Browser.now();
                info.size = size;
            }
            else {
                info = {
                    group,
                    url,
                    size,
                    fileName: Utils.getBaseName(tempFilePath),
                    accessTime: Browser.now()
                };
            }

            this.fileCache.set(url, info);
            this.cacheGroups[info.group]++;
            this.totalFileSize += size;
        }

        //先保存清单文件，再去拷贝文件，这样即使由于意外原因（比如程序关闭）没有拷贝文件，也只是会产生冗余清单记录，不会影响超出存储空间的判断

        return this.saveManifest(group).then(success => {
            if (!success)
                return;

            //拷贝文件
            return <any>Utils.runTasks(files, 5, ({ url, tempFilePath }) => {
                let info = this.fileCache.get(url);
                let saveFilePath = `${this.cacheRoot}/${group}/${info.fileName}`;
                return PAL.fs.copyFile(tempFilePath, saveFilePath)
                    .catch(err => {
                        let msg = getErrorMsg(err);
                        //缓存文件拷贝失败，可能是源文件被系统清掉了
                        console.warn("[Cache]create cache file", msg);

                        //也可能是空间不足
                        if (msg.indexOf("the maximum size of the file storage") !== -1) {
                            this.toClear |= 1; //标记为需要清理一次缓存
                        }
                    });
            });
        });
    }

    private clearSpace(sizeToClear: number): Promise<void> {
        if (sizeToClear < 0)
            return Promise.resolve();

        sizeToClear += MgCacheManager.minClearSpace;

        let allFiles = Array.from(this.fileCache.values());
        allFiles.sort((a, b) => a.accessTime - b.accessTime);

        let t = Browser.now();
        let info: [number, number] = [0, 0]; //outInfo[0]=清理的文件数，outInfo[1]=清理的字节数
        return this.doClearSpace(allFiles, sizeToClear, 0, info).then(() => {
            console.log(`[Cache]cleared ${info[0]} files/${info[1]} bytes in ${Browser.now() - t}ms`);
        });
    }

    private doClearSpace(allFiles: Array<ICachedFileInfo>, sizeToClear: number, round: number, outInfo: [number, number]): Promise<void> {
        let sizeCleared = 0;
        let i = 0;
        let n = allFiles.length;
        for (; i < n; i++) {
            let info = allFiles[i];
            sizeCleared += info.size;
            if (sizeCleared >= sizeToClear)
                break;
        }

        let arr = allFiles.splice(0, i + 1);

        sizeCleared = 0;
        return Utils.runTasks(arr, 20, (info: ICachedFileInfo) => {
            this.fileCache.delete(info.url);
            this.totalFileSize -= info.size;
            this.cacheGroups[info.group]--;
            this.toSaveManifestFlags[info.group] = true;

            let fielName = `${this.cacheRoot}/${info.group}/${info.fileName}`;
            return PAL.fs.unlink(fielName).then(() => {
                sizeCleared += info.size;
            }).catch(err => {
                let msg = getErrorMsg(err);
                if (msg.indexOf("no such file") === -1) //如果是文件不存在的错误，就不报错了
                    console.error("[Cache]delete cache file", msg);
            });
        }).then(() => {
            outInfo[0] += arr.length;
            outInfo[1] += sizeCleared;
            if (sizeCleared < sizeToClear && allFiles.length > 0 && round < 10) //如果清理不够，要继续，但限定轮次，避免消耗太多
                return this.doClearSpace(allFiles, sizeToClear - sizeCleared, ++round, outInfo);
            else
                return null;
        });
    }

    private doClearAllCache(): Promise<void> {
        return PAL.fs.rmdir(this.cacheRoot, { recursive: true }).catch(err => {
            console.warn("[Cache]failed to delete cache folder", getErrorMsg(err));
        }).then(() => this.createCacheDirs()).then(() => {
            this.fileCache.clear();
            this.cacheGroups.fill(0);
            this.totalFileSize = 0;
            this.toSaveManifestFlags.fill(false);
        });
    }

    private loadAllManifests(): Promise<void> {
        return PAL.fs.readdir(this.cacheRoot).then(files => {
            return <any>Promise.all(files.map(fileName => {
                if (fileName.startsWith("manifest-")) {
                    let group = parseInt(fileName.substring(9, fileName.length - 4));
                    if (!isNaN(group) && group >= 0 && group < GROUP_COUNT) {
                        return this.loadManifest(group);
                    }
                }
                return Promise.resolve();
            }));
        });
    }

    private loadManifest(group: number): Promise<void> {
        return PAL.fs.readFile(`${this.cacheRoot}/manifest-${group}.bin`).then((data: ArrayBuffer | string) => {
            let bytes = new Byte(data);
            let version = bytes.readInt16();
            let url: string;
            let fileName: string;
            let accessTime: number;
            let size: number;
            let fileCnt = 0;
            let bytesTotal = 0;
            while (bytes.bytesAvailable > 0) {
                let pos = bytes.pos;
                let len = bytes.readUint32();
                url = bytes.readUTFString();
                fileName = bytes.readUTFString();
                accessTime = bytes.readUint32();
                size = bytes.readUint32();
                bytes.pos = pos + len;

                let info: ICachedFileInfo = {
                    group,
                    url,
                    fileName,
                    accessTime,
                    size
                };
                this.fileCache.set(url, info);
                bytesTotal += size;
                fileCnt++;
            }
            this.cacheGroups[group] = fileCnt;
            this.totalFileSize += bytesTotal;

            console.log(`[Cache]load manifest-${group} ${fileCnt}(files)/${bytesTotal}(bytes)`);
        }).catch(err => {
            console.error(`[Cache]load manifest-${group}`, getErrorMsg(err));
        });
    }

    private saveDirtyManifests(): Promise<void> {
        return <any>Promise.all(this.toSaveManifestFlags.filter(needSave => needSave)
            .map((_, index) => this.saveManifest(index)));
    }

    private saveManifest(group: number): Promise<boolean> {
        let bytes = new Byte();
        bytes.writeInt16(1); //version
        let fileCnt = 0;
        let bytesTotal = 0;
        for (let info of this.fileCache.values()) {
            if (info.group === group) {
                let pos = bytes.pos;
                bytes.writeUint32(0); //占位符，后面会覆盖
                bytes.writeUTFString(info.url);
                bytes.writeUTFString(info.fileName);
                bytes.writeUint32(info.accessTime);
                bytes.writeUint32(info.size);

                let writePos = pos;
                pos = bytes.pos;
                bytes.pos = writePos;
                bytes.writeUint32(pos - writePos);
                bytes.pos = pos;

                fileCnt++;
                bytesTotal += info.size;
            }
        }

        return PAL.fs.writeFile(`${this.cacheRoot}/manifest-${group}.bin`, bytes.buffer).then(() => {
            this.toSaveManifestFlags[group] = false;
            console.log(`[Cache]save manifest-${group} ${fileCnt}(files)/${bytesTotal}(bytes)`);
            return true;
        }).catch(err => {
            let msg = getErrorMsg(err);
            console.error(`[Cache]save manifest-${group}`, msg);

            if (msg.indexOf("the maximum size of the file storage") !== -1) {
                this.toClear |= 1; //标记为需要清理一次缓存
            }

            return false;
        });
    }

    private createCacheDirs(): Promise<void> {
        return <any>Promise.all(this.cacheGroups.map((_, index) => {
            let path = `${this.cacheRoot}/${index}`;
            return PAL.fs.exists(path).then(exists => {
                if (!exists)
                    return PAL.fs.mkdir(path, { recursive: true }).catch(err => {
                        console.error("[Cache]failed to create cache dir", getErrorMsg(err));
                    });
                else
                    return Promise.resolve();
            });
        }));
    }

    private checkAndDeleteOldCacheDir(): Promise<void> {
        //如果存在旧的缓存目录，删除它
        let oldCacheDir = this.cacheRoot.substring(0, this.cacheRoot.lastIndexOf("/")) + "/layaairGame";

        return PAL.fs.exists(oldCacheDir).then(oldExists => {
            if (oldExists) {
                console.log("[Cache]delete old cache folder");
                return PAL.fs.rmdir(oldCacheDir, { recursive: true }).catch(err => {
                    console.warn("[Cache]failed to delete old cache folder", getErrorMsg(err));
                });
            }
            else
                return Promise.resolve();
        });
    }
}