const fs = require('fs');
const path = require('path');
/**
 * 
 * @ brief: MoveUtils
 * @ author: zyh
 * @ data: 2024-04-29 15:07
 */
export class MoveUtils {
    oldPath: any;
    newPath: any;

    static instance: MoveUtils = new MoveUtils();
    constructor() {
        this.oldPath = {};
        this.newPath = {};
    }

    check(outDir: string, deleteDir: string) {
        for (const key in this.newPath) {
            if (this.oldPath[key]) {
                delete this.oldPath[key];
            }
        }

        for (const key in this.oldPath) {
            this.move(key, outDir, deleteDir);
        }
    }

    move(srcFile: string, outDir: string, deleteDir: string) {
        // 定义不想在目标路径中包含的目录
        const ignoreDir = outDir;
        // 目标基础目录
        const targetBaseDir = deleteDir;

        // 计算相对路径，但排除了`ignoreDir`指定的目录
        const relativePath = path.relative(ignoreDir, srcFile); // 结果应该是 'LayaAir/a.md'
        // 目标文件路径
        const targetFile = path.join(targetBaseDir, relativePath);

        // 检查源文件是否存在
        if (!fs.existsSync(srcFile)) {
            console.error(`Source file does not exist: ${srcFile}`);
        }
        // 确保目标目录存在
        const targetDir = path.dirname(targetFile);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }


        fs.rename(srcFile, targetFile, (err) => {
            if (err) {
                console.error(`Error moving file: ${err}`);
            } else {
                console.log(`File moved successfully to ${targetFile}`);
            }
        });
    }

    static addOldPath(key: string, value: boolean) {
        this.instance.oldPath[key] = value;
    }

    static addNewPath(key: string, value: boolean) {
        this.instance.newPath[key] = value;
    }
}