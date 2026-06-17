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

// 是否「iOS + 高性能模式」——所有特殊处理（路径编码 / manifest base64 / copyFile 幂等）只在这一组合生效。
// 启动后不变，惰性缓存。
let _iosHighPerf: boolean | null = null;
function _isIOSHighPerf(): boolean {
    if (_iosHighPerf === null) {
        _iosHighPerf = false;
        try {
            const g: any = (PAL.g as any) || (window as any).my;
            const hp = !!(g && g.env && g.env.isHighPerformanceMode);
            let ios = false;
            if (g && g.getSystemInfoSync) {
                const info = g.getSystemInfoSync();
                const plat = String((info && (info.platform || info.system)) || "").toLowerCase();
                ios = plat.indexOf("ios") !== -1;
            }
            _iosHighPerf = hp && ios;
        } catch (e) {
            _iosHighPerf = false;
        }
    }
    return _iosHighPerf;
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

    // 516（iOS copyFile 不覆盖已存在文件）实测仅出现在 iOS 高性能模式；仅此模式先删已存在目标再拷保证幂等，其它走基类
    copyFile(srcPath: string, destPath: string): Promise<void> {
        if (!_isIOSHighPerf()) return super.copyFile(srcPath, destPath);
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
    // 淘宝的webgl2支持不完善，淘宝推荐使用webgl1.0
    Config.useWebGL2 = false;
    Browser.onTBMiniGame = true;
    PAL.g = (window as any).my;
    // 让 start() 直接 new TbDownloader（图片本地路径编码走 encodeLocalPath 钩子）
    MgBrowserAdapter.downloaderClass = TbDownloader;
};
