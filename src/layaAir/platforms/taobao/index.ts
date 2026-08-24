import { Config } from "../../Config";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";
import { MgFileSystemAdapter } from "../minigame/MgFileSystemAdapter";
import { MgDownloader } from "../minigame/MgDownloader";

const _B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const _MARK = "B64:"; // base64 文本标记前缀；二进制 manifest 以 version(0x00/0x01) 开头，不会撞上 'B'

function _ab2b64(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let res = "";
    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i], b1 = i + 1 < bytes.length ? bytes[i + 1] : 0, b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
        res += _B64[b0 >> 2] + _B64[((b0 & 3) << 4) | (b1 >> 4)];
        res += i + 1 < bytes.length ? _B64[((b1 & 15) << 2) | (b2 >> 6)] : "=";
        res += i + 2 < bytes.length ? _B64[b2 & 63] : "=";
    }
    return res;
}

function _b642ab(b64: string): ArrayBuffer {
    const lookup: Record<string, number> = {};
    for (let i = 0; i < _B64.length; i++) lookup[_B64[i]] = i;
    b64 = String(b64).replace(/[^A-Za-z0-9+/]/g, "");
    const bytes: number[] = [];
    for (let j = 0; j < b64.length; j += 4) {
        const c0 = lookup[b64[j]], c1 = lookup[b64[j + 1]], c2 = lookup[b64[j + 2]], c3 = lookup[b64[j + 3]];
        bytes.push((c0 << 2) | (c1 >> 4));
        if (b64[j + 2] !== undefined) bytes.push(((c1 & 15) << 4) | (c2 >> 2));
        if (b64[j + 3] !== undefined) bytes.push(((c2 & 3) << 6) | c3);
    }
    return new Uint8Array(bytes).buffer;
}

function _hasMark(u8: Uint8Array): boolean {
    return u8.length >= 4 && u8[0] === 66 && u8[1] === 54 && u8[2] === 52 && u8[3] === 58; // "B64:"
}

// 高性能模式（淘宝把 my.env.isHighPerformanceMode 存到通用的 Browser.isIOSHighPerformanceMode）：copyFile 幂等用它——
// 高性能模式下 copyFile 不覆盖已存在文件（iOS 报 516、安卓报 ALREADY_EXIST），普通模式会覆盖。
function _isHighPerf(): boolean {
    return !!Browser.isIOSHighPerformanceMode;
}

// iOS + 高性能：路径编码 / manifest base64 只在这一组合生效。
function _isIOSHighPerf(): boolean {
    return !!Browser.isIOSHighPerformanceMode && Browser.onIOS;
}

// 加载边界编码：iOS 高性能下，native 读取/加载（readFile / super.image）要 %2520 编码路径（native 内部会 decode）。
// 缓存层路径始终保持原始，只在交给 native 的这一刻编码，不污染缓存数据。
function _encPath(p: string): string {
    if (!p || !_isIOSHighPerf()) return p;
    try { return encodeURI(encodeURI(p)); } catch (e) { return p; }
}

// 仅 iOS 高性能：① manifest 是二进制 ArrayBuffer，淘宝 writeFile 不收 ArrayBuffer（PARAMETER_NOT_CORRECT），
// 转 "B64:"+base64 文本写、按前缀自适应读；② 资源 readFile 在加载边界编码路径。
class TbFileSystemAdapter extends MgFileSystemAdapter {
    // 仅匹配缓存清单 manifest-<group>.bin，避免误伤名字里含 "manifest-" 的普通资源
    private static _isManifest(path: string): boolean {
        return /\/manifest-\d+\.bin$/.test(path);
    }

    writeFile(path: string, data: ArrayBuffer | string, encoding?: string): Promise<void> {
        if (TbFileSystemAdapter._isManifest(path) && typeof data !== "string" && _isIOSHighPerf()) {
            return super.writeFile(path, _MARK + _ab2b64(data as ArrayBuffer), "utf8");
        }
        return super.writeFile(path, data, encoding);
    }

    readFile(path: string, encoding?: string): Promise<ArrayBuffer | string> {
        if (!TbFileSystemAdapter._isManifest(path)) {
            return super.readFile(_encPath(path), encoding); // 资源读取：加载边界编码
        }
        // manifest：按二进制读回，依据 "B64:" 前缀自适应解码（路径无空格，不编码）
        return super.readFile(path).then((buf) => {
            const u8 = new Uint8Array(buf as ArrayBuffer);
            if (_hasMark(u8)) {
                let s = "";
                for (let i = 4; i < u8.length; i++) s += String.fromCharCode(u8[i]);
                return _b642ab(s);
            }
            return buf as ArrayBuffer;
        });
    }

    // 高性能模式下 copyFile 不覆盖已存在文件（iOS 报 516、安卓报 ALREADY_EXIST）；仅高性能模式先删已存在目标再拷保证幂等，普通模式走基类（会覆盖）
    copyFile(srcPath: string, destPath: string): Promise<void> {
        if (!_isHighPerf()) return super.copyFile(srcPath, destPath);
        return super.exists(destPath)
            .then(ex => ex ? super.unlink(destPath).catch(() => { }) : null)
            .then(() => super.copyFile(srcPath, destPath));
    }
}

PAL.register("fs", TbFileSystemAdapter);

// 图片走 native Image.src 加载本地文件，iOS 高性能下本地路径需 %2520 编码。
// 只覆盖 MgDownloader 的 encodeLocalPath 钩子，image() 逻辑沿用基类、一行不复制。
class TbDownloader extends MgDownloader {
    protected encodeLocalPath(path: string): string {
        return _encPath(path);
    }
}

MgBrowserAdapter.beforeInit = function () {
    PAL.g = (window as any).my;
    if (!PAL.g.loadSubpackage && PAL.g.loadSubPackage)
        PAL.g.loadSubpackage = PAL.g.loadSubPackage;
    // 淘宝高性能字段是 my.env.isHighPerformanceMode（不带 iOS，安卓也可能 true），存到通用的 Browser.isIOSHighPerformanceMode
    Browser.isIOSHighPerformanceMode = !!((PAL.g as any)?.env?.isHighPerformanceMode);
    if (!Browser.isIOSHighPerformanceMode) {
        // 普通模式下淘宝的webgl2支持不完善，淘宝推荐使用webgl1.0（高性能模式不关闭 webgl2）
        Config.useWebGL2 = false;
    }
    Browser.onTBMiniGame = true;
    // 让 start() 直接 new TbDownloader（图片本地路径编码走 encodeLocalPath 钩子）
    MgBrowserAdapter.downloaderClass = TbDownloader;
};
