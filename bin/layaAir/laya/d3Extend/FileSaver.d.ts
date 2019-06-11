/**
 * ...
 * @author ww
 */
export declare class FileSaver {
    constructor();
    static dataURLtoBlob(dataurl: string): any;
    static createBlob(arr: any[], option: any): any;
    static saveBlob(blob: any, filename: string): void;
    static saveTxtFile(filename: string, content: string): void;
    static saveCanvas(filename: string, canvas: any): void;
}
