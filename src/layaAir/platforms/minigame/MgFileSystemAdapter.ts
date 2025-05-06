import { FileSystemAdapter } from "../../laya/platform/FileSystemAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { ClassUtils } from "../../laya/utils/ClassUtils";

export class MgFileSystemAdapter extends FileSystemAdapter {

    private fs: WechatMinigame.FileSystemManager;

    constructor() {
        super();

        this.fs = PAL.global.getFileSystemManager();
    }

    readFile(path: string, encoding?: string): Promise<ArrayBuffer | string> {
        return new Promise((resolve, reject) => {
            this.fs.readFile({
                filePath: path,
                encoding: <any>encoding ?? "",
                success: (res) => resolve(res.data),
                fail: (err) => reject(err)
            });
        });
    }

    writeFile(path: string, data: ArrayBuffer | string, encoding?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fs.writeFile({
                filePath: path,
                data: data,
                encoding: <any>encoding,
                success: () => resolve(),
                fail: (err) => reject(err)
            });
        });
    }

    unlink(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fs.unlink({
                filePath: path,
                success: () => resolve(),
                fail: (err) => reject(err)
            });
        });
    }

    copyFile(srcPath: string, destPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fs.copyFile({
                srcPath,
                destPath,
                success: () => resolve(),
                fail: (err) => reject(err)
            });
        });
    }

    exists(path: string): Promise<boolean> {
        return new Promise(resolve => {
            this.fs.access({
                path,
                success: () => resolve(true),
                fail: (err) => {
                    //console.warn('access', path, err.errMsg);
                    resolve(false);
                }
            });
        });
    }

    getFileSize(path: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.fs.getFileInfo({
                filePath: path,
                success: (res) => resolve(res.size),
                fail: (err) => reject(err)
            });
        });
    }

    mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fs.mkdir({
                dirPath: path,
                recursive: options?.recursive,
                success: () => resolve(),
                fail: (err) => reject(err)
            });
        });
    }

    rmdir(path: string, options?: { recursive?: boolean }): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fs.rmdir({
                dirPath: path,
                recursive: options?.recursive,
                success: () => resolve(),
                fail: (err) => reject(err)
            });
        });
    }

    readdir(path: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.fs.readdir({
                dirPath: path,
                success: (res) => resolve(res.files),
                fail: (err) => reject(err)
            });
        });
    }
}

ClassUtils.regClass("PAL.FileSystem", MgFileSystemAdapter);