import { NotImplementedError } from "../utils/Error";
import { PAL } from "./PlatformAdapters";

/**
 * @ignore
 */
export class FileSystemAdapter {
    /**
     * @en Reads a file.
     * @param path File path.
     * @param encoding If encoding is not specified, the file will be read as binary data. If encoding is specified, the file will be read as a string.
     * @zh 读取文件。
     * @param path 文件路径。 
     * @param encoding 如果没有指定编码，则文件将作为二进制数据读取。如果指定了编码，则文件将作为字符串读取。
     */
    readFile(path: string, encoding?: string): Promise<ArrayBuffer | string> {
        throw new NotImplementedError();
    }

    /**
     * @en Writes a file. If encoding is not specified, the file will be written as binary data. If encoding is specified, the file will be written as a string.
     * @param path File path.
     * @param data Data to write.
     * @param encoding Encoding type.
     * @zh 写入文件。如果没有指定编码，则文件将作为二进制数据写入。如果指定了编码，则文件将作为字符串写入。
     * @param path 文件路径。 
     * @param data 要写入的数据。 
     * @param encoding 编码类型。如果没有指定编码，则文件将作为二进制数据写入。如果指定了编码，则文件将作为字符串写入。
     */
    writeFile(path: string, data: ArrayBuffer | string, encoding?: string): Promise<void> {
        throw new NotImplementedError();
    }

    /**
     * @en Deletes a file.
     * @param path File path.
     * @zh 删除文件。
     * @param path 文件路径。 
     */
    unlink(path: string): Promise<void> {
        throw new NotImplementedError();
    }

    /**
     * @en Copies a file from srcPath to destPath.
     * @param srcPath Source file path. 
     * @param destPath Destination file path.
     * @zh 复制文件。
     * @param srcPath 源文件路径。
     * @param destPath 目标文件路径。 
     */
    copyFile(srcPath: string, destPath: string): Promise<void> {
        throw new NotImplementedError();
    }

    /**
     * @en Checks if a file or directory exists.
     * @param path File or directory path.
     * @zh 检查文件或目录是否存在。
     * @param path 文件或目录路径。 
     */
    exists(path: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    /**
     * @en Gets the size of a file.
     * @param path File path.
     * @zh 获取文件大小。
     * @param path 文件路径。 
     */
    getFileSize(path: string): Promise<number> {
        throw new NotImplementedError();
    }

    /**
     * @en Creates a directory.
     * @param path Directory path. 
     * @param options Options for creating the directory. If recursive is true, creates the directory recursively.
     * @zh 创建目录。
     * @param path 目录路径。
     * @param options 创建目录的选项。如果recursive为true，则递归创建目录。
     */
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
        throw new NotImplementedError();
    }

    /**
     * @en Deletes a directory.
     * @param path Directory path.
     * @param options Options for deleting the directory. If recursive is true, deletes the directory recursively.
     * @zh 删除目录。
     * @param path 目录路径。
     * @param options 删除目录的选项。如果recursive为true，则递归删除目录。
     */
    rmdir(path: string, options?: { recursive?: boolean }): Promise<void> {
        throw new NotImplementedError();
    }

    /**
     * @en Reads the contents of a directory.
     * @param path Directory path.
     * @zh 读取目录的内容。
     * @param path 目录路径。
     */
    readdir(path: string): Promise<string[]> {
        throw new NotImplementedError();
    }

    /**
     * @en Unzips a zip file.
     * @param zipFilePath Path to the zip file.
     * @param targetPath Path to the target directory where the files will be extracted.
     * @zh 解压缩zip文件。
     * @param zipFilePath zip文件路径。
     * @param targetPath 目标目录路径，文件将被解压到该目录。
     */
    unzip(zipFilePath: string, targetPath: string): Promise<void> {
        throw new NotImplementedError();
    }
}

PAL.register("fs", FileSystemAdapter);