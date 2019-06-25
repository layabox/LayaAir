import { Browser } from "laya/utils/Browser";
/**
 * ...
 * @author ww
 */
export class FileSaver {
    constructor() {
    }
    static dataURLtoBlob(dataurl) {
        var arr = dataurl.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        var bstr = Browser.window.atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new (FileSaver.createBlob([u8arr], { type: mime }));
    }
    static createBlob(arr, option) {
        var blob;
        blob = new Blob(arr, option);
        ;
        return blob;
    }
    static saveBlob(blob, filename) {
        Browser.window.saveAs(blob, filename);
    }
    static saveTxtFile(filename, content) {
        FileSaver.saveBlob(FileSaver.createBlob([content], { type: "text/plain;charset=utf-8" }), filename);
    }
    static saveCanvas(filename, canvas) {
        var dataurl = canvas.toDataURL('image/png');
        var blob = FileSaver.dataURLtoBlob(dataurl);
        FileSaver.saveBlob(blob, filename);
    }
}
