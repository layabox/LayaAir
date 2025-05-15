import { ILaya } from "../../ILaya";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { Byte } from "../../laya/utils/Byte";
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
    minClearSpace: number = (5 * 1024 * 1024);
    /** 
     * @en Maximum capacity of cache directory
     * @zh 缓存目录的最大容量
     */
    spaceLimit: number = (200 * 1024 * 1024);
    /**
     * @en The interval time for processing cache requests, in milliseconds
     * @zh 处理缓存请求的间隔时间，单位是毫秒
     */
    processInterval: number = 2000;

    private cacheRoot: string;
    private totalFileSize: number = 0;
    private cacheGroups: Array<number>;
    private fileCache: Map<string, ICachedFileInfo>;
    private cacheRequest: Map<string, { tempFilePath: string, fileSize: number }>;
    private running: boolean = false;
    private toSaveManifestFlags: Array<boolean>;
    private lastGroup: number = -1;
    private lastGroupUsed: number = 0;

    constructor(cacheRoot: string) {
        this.cacheRoot = cacheRoot;
        this.fileCache = new Map();
        this.cacheGroups = new Array(GROUP_COUNT);
        this.cacheGroups.fill(0);
        this.cacheRequest = new Map();
        this.toSaveManifestFlags = new Array(GROUP_COUNT);
    }

    start(): Promise<void> {
        //不用等他返回，因为不影响我们的逻辑
        this.checkAndDeleteOldCacheDir();

        return Promise.resolve().then(() => {
            //建立缓存目录
            return Promise.all(this.cacheGroups.map((_, index) => {
                let path = `${this.cacheRoot}/${index}`;
                return PAL.fs.exists(path).then(exists => {
                    if (!exists)
                        return PAL.fs.mkdir(path, { recursive: true });
                    else
                        return Promise.resolve();
                });
            }));
        }).then(() => {
            //读取所有清单文件
            console.time("read all manifests");
            return PAL.fs.readdir(this.cacheRoot).then(files => {
                return Promise.all(files.map(fileName => {
                    if (fileName.startsWith("manifest-")) {
                        let group = parseInt(fileName.substring(9, fileName.length - 4));
                        if (!isNaN(group) && group >= 0 && group < GROUP_COUNT) {
                            return this.loadManifest(group);
                        }
                    }
                    return Promise.resolve();
                }));
            });
        }).then(() => {
            console.log(`${this.fileCache.size} files ${this.totalFileSize} bytes in manifests`);
            console.timeEnd("read all manifests");

            ILaya.systemTimer.loop(this.processInterval, this, this.process);
        });
    }

    getFile(url: string): Promise<string | null> {
        let info = this.fileCache.get(url);
        if (!info)
            return Promise.resolve(null);

        info.accessTime = Browser.now();
        let cacheFilePath: string = `${this.cacheRoot}/${info.group}/${info.fileName}`;
        return PAL.fs.exists(cacheFilePath).then(exists => exists ? cacheFilePath : null);
    }

    addFile(url: string, tempFilePath: string): void {
        PAL.fs.getFileSize(tempFilePath).then(fileSize => this.cacheRequest.set(url, { tempFilePath, fileSize }))
            .catch((err: WechatMinigame.FileError) => {
                console.warn("get file size", PAL.getErrorMsg(err));
            });
    }

    private process() {
        if (this.running || this.cacheRequest.size === 0)
            return;

        this.running = true;

        let entries = Array.from(this.cacheRequest.entries());
        this.cacheRequest.clear();

        //整个批次加入同一个组，这样只需要保存一个清单文件
        let group = this.selectGroup(entries.length);

        Promise.resolve().then(() => {
            //检查是否需要清理空间
            let needSpace = 0;
            for (let info of entries)
                needSpace += info[1].fileSize;

            if (this.totalFileSize + needSpace < this.spaceLimit)
                return Promise.resolve();

            console.time("clear cache space");

            //如果需要清理空间，先清理旧的文件
            let toClearSpace = this.totalFileSize + needSpace - this.spaceLimit + this.minClearSpace;
            let totalSize = 0;
            let arr = Array.from(this.fileCache.values());
            arr.sort((a, b) => a.accessTime - b.accessTime);
            let i = 0;
            for (let n = arr.length; i < n; i++) {
                let info = arr[i];
                totalSize += info.size;
                this.toSaveManifestFlags[info.group] = true;
                if (totalSize >= toClearSpace)
                    break;
            }

            return Utils.runTasks(arr.slice(0, i + 1), 20, (info: ICachedFileInfo) => this.deleteFile(info)).then(() => {
                console.log(`cleared ${arr.length} files ${totalSize} bytes`);
                console.timeEnd("clear cache space");

            });
        }).then(() => {
            //这里先保存清单文件，再去拷贝文件，这样即使由于意外原因（比如程序关闭）没有拷贝文件，也只是会产生冗余清单记录，不会影响超出存储空间的判断
            for (let [url, { tempFilePath, fileSize }] of entries) {
                let info: ICachedFileInfo = this.fileCache.get(url);
                if (info) { //肯定是文件莫名不存在了，才会进到这里
                    this.cacheGroups[info.group]--;
                    this.totalFileSize -= info.size;
                    this.fileCache.delete(url);
                }
                else {
                    info = <any>{
                        group,
                        url: url,
                        fileName: Utils.getBaseName(tempFilePath),
                    };
                }
                info.accessTime = Browser.now();
                info.size = fileSize;
                this.fileCache.set(url, info);
                this.cacheGroups[info.group]++;
                this.totalFileSize += fileSize;
            }

            return this.saveManifest(group);

        }).then(() => {
            //拷贝文件
            return Utils.runTasks(entries, 5, ([_, { tempFilePath }]) =>
                PAL.fs.copyFile(tempFilePath, `${this.cacheRoot}/${group}/${Utils.getBaseName(tempFilePath)}`)
                    .catch((err: WechatMinigame.FileError) => {
                        //缓存文件拷贝失败，可能是源文件被系统清掉了
                        console.warn("create cache file", PAL.getErrorMsg(err));
                    }));
        }).then(() => {
            //保存其他修改过的清单文件
            return Promise.all(this.toSaveManifestFlags.map((needSave, index) => {
                if (needSave)
                    return this.saveManifest(index);
                else
                    return Promise.resolve();
            }));
        }).then(() => this.running = false);
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

    private deleteFile(info: ICachedFileInfo): Promise<void> {
        this.fileCache.delete(info.url);
        this.totalFileSize -= info.size;
        this.cacheGroups[info.group]--;

        let fielName = `${this.cacheRoot}/${info.group}/${info.fileName}`;
        return PAL.fs.unlink(fielName).catch((err: WechatMinigame.FileError) => {
            console.error("delete cache file", PAL.getErrorMsg(err));
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
            let cnt = 0;
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
                this.totalFileSize += size;
                cnt++;
            }
            this.cacheGroups[group] = cnt;
        }).catch(err => {
            console.error(`load manifest-${group}`, PAL.getErrorMsg(err));
        });
    }

    private saveManifest(group: number): Promise<void> {
        console.time(`save manifest-${group}`);
        let bytes = new Byte();
        bytes.writeInt16(1); //version
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
            }
        }

        return PAL.fs.writeFile(`${this.cacheRoot}/manifest-${group}.bin`, bytes.buffer).then(() => {
            this.toSaveManifestFlags[group] = false;
            console.timeEnd(`save manifest-${group}`);
        }).catch(err => {
            console.error(`save manifest-${group}`, PAL.getErrorMsg(err));
        });
    }

    private checkAndDeleteOldCacheDir(): Promise<void> {
        //如果存在旧的缓存目录，删除它
        let oldCacheDir = this.cacheRoot.substring(0, this.cacheRoot.lastIndexOf("/")) + "/layaairGame";

        return PAL.fs.exists(oldCacheDir).then(oldExists => {
            if (oldExists) {
                console.log("delete old cache folder");
                return PAL.fs.rmdir(oldCacheDir, { recursive: true }).catch((err: WechatMinigame.FileError) => {
                    console.warn("failed to delete old cache folder", PAL.getErrorMsg(err));
                });
            }
            else
                return Promise.resolve();
        });
    }
}