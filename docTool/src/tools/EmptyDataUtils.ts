import { MDManager } from "../MDManager";

const fs = require('fs');
const path = require('path');
/**
 * 
 * @ brief: EmptyDataUtils
 * @ author: zyh
 * @ data: 2024-04-26 16:03
 */
export class EmptyDataUtils {
    static writeEmptyData(pathStr) {
        if (!fs.existsSync(pathStr)) return;
        try {
            const stats = fs.statSync(pathStr);
            if (stats.isDirectory()) {
                const files = fs.readdirSync(pathStr);
                files.forEach(file => {
                    let fullPath = path.join(pathStr, file);
                    this.writeEmptyData(fullPath);
                });
            } else if (stats.isFile()) {
                this.writeEmptyDataByData(pathStr);
            }
        } catch (err) {
            console.error(err);
        }
    }

    static writeEmptyDataByData(pathStr: string) {
        const dataStr = fs.readFileSync(pathStr, 'utf-8');
        const data = JSON.parse(dataStr);
        const filename = path.basename(pathStr);
        const className = path.basename(filename, path.extname(filename));

        const mdClass = MDManager.instance.get(className);
        if (mdClass) {
            mdClass.writeEmptyData(data);
        } else {
            console.log(`Not found ${className} in MDManager`);
        }
    }
}