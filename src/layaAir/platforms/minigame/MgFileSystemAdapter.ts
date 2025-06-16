import { FileSystemAdapter } from "../../laya/platform/FileSystemAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";

export class MgFileSystemAdapter extends FileSystemAdapter {

    private fs: WechatMinigame.FileSystemManager;
    private hasAccess: boolean = false;

    constructor() {
        super();

        this.fs = PAL.g.getFileSystemManager();
        this.hasAccess = typeof (this.fs.access) === "function";
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
            if (this.hasAccess) {
                this.fs.access({
                    path,
                    success: () => resolve(true),
                    fail: (err) => resolve(false)
                });
            }
            else {
                this.fs.getFileInfo({
                    filePath: path,
                    success: (res) => resolve(true),
                    fail: (err) => resolve(false)
                });
            }
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
        //根据实际测试和网上资料，真机上rmdir异步方法设置了recursive为true后有可能不返回（既不成功也不失败），所以改成同步的实现
        // return new Promise((resolve, reject) => {
        //     this.fs.rmdir({
        //         dirPath: path,
        //         recursive: options?.recursive,
        //         success: () => resolve(),
        //         fail: (err) => reject(err)
        //     });
        // });
        try {
            this.fs.rmdirSync(path, options?.recursive);
            return Promise.resolve();
        }
        catch (e) {
            return Promise.reject(e);
        }
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

    unzip(zipFilePath: string, targetPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fs.unzip({
                zipFilePath,
                targetPath,
                success: () => resolve(),
                fail: (err) => reject(err)
            });
        });
    }
}

PAL.register("fs", MgFileSystemAdapter);