import { ILaya } from "../../ILaya";
import { Command2D } from "../display/Scene2DSpecial/RenderCMD2D/Command2D";
import { CommandBuffer2D } from "../display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { LayaGL } from "../layagl/LayaGL";
import { Texture2D } from "../resource/Texture2D";
import { Utils } from "../utils/Utils";
import { LargeTex } from "./LargeTex";
import { LargeTexProcessor } from "./LargeTexProcessor";

//被合并的纹理单元
export class TextureItem {
    /** 
     * @en Texture unique ID (0 is empty, 1 is color block, >1 is texture block)
     * @zh 纹理唯一编号（0是空位，1是颜色块，>1是纹理块）
     * */
    id: number = 0;
    /** 
     * @en Texture URL (optional)
     * @zh 纹理URL（可选）
     * */
    url?: string;

    // 纹理偏移参数（X，Y是偏移量，W，H是缩放量）

    /** 
     * @en Texture offset parameters
     * @zh 纹理偏移参数
     * */
    x: number = 0;
    /** 
     * @en Texture offset parameters
     * @zh 纹理偏移参数
     * */
    y: number = 0;
    /** 
     * @en Texture scale parameters
     * @zh 纹理缩放参数
     * */
    w: number = 0;
    /** 
     * @en Texture scale parameters
     * @zh 纹理缩放参数
     * */
    h: number = 0;

    /** 
     * @en Texture position and size in large texture set (block coordinates, not pixel coordinates)
     * @zh 纹理所处大图合集位置和宽高（块坐标，非像素坐标）
     * */
    pos = new Vector4();

    /** 
     * @en Large texture index
     * @zh 大纹理序号
     * */
    largeTextureIndex: number = 0;
    /** 
     * @en Scale factor
     * @zh 放缩系数
     * */
    scale: number = 1;  
    /** 
     * @en Whether only a placeholder (needs to be replaced with actual texture)
     * @zh 是否仅是占位（需要用实际纹理替换）
     * */
    token: boolean = false;
    /** 
     * @en Companion texture ID
     * @zh 伴随纹理ID
     * */
    partId: number[] = [];
    /** 
     * @en Command
     * @zh 命令
     * */
    // cmd?: Command2D;

    cloneTo(ti: TextureItem) {
        ti.id = this.id;
        ti.url = this.url;
        ti.x = this.x;
        ti.y = this.y;
        ti.w = this.w;
        ti.h = this.h;
        ti.largeTextureIndex = this.largeTextureIndex;
        ti.scale = this.scale;
        ti.token = this.token;
        this.pos.cloneTo(ti.pos);
        ti.partId.length = this.partId.length;
        for (let i = 0; i < this.partId.length; i++)
            ti.partId[i] = this.partId[i];
    }

    /**
     * @en Whether it is itself
     * @param iu id or url
     * @zh 是否是自身
     * @param iu id或url
     */
    isSelf(iu: number | string) {
        return (this.id === iu || this.url === iu);
    }

}

//被合并的颜色单元
type ColorItem = {
    u?: number; //在大纹理中的UV坐标
    v?: number;
    r?: number; //rgba颜色值
    g?: number;
    b?: number;
    a?: number;
    largeTextureIndex?: number; //合并的大纹理序号
    cmd?: Command2D; //合并的命令
}

//合并后的大纹理
export type TextureOut = {
    texItem?: TextureItem; //纹理项
    texture?: LargeTex; //大纹理对象
    texCode?: number; //大纹理序号
}

//大图合集基类
export class LargeTexBase {
    /**
     * @en The texture expansion size (can reduce black edges)
     * @zh 纹理扩边量（可减少黑边）
     * */
    EXTEND_SIZE: number = 0;

    /**
     * @en The minimum size of small textures that can be merged, beyond which they will not be merged
     * @zh 参与合并的小纹理最小允许尺寸，超过这个尺寸将不参与合并 
     * */
    TEX_SIZE_MIN: number = 16;

    /** 
     * @en The maximum allowed size of small textures that can be merged, beyond which they will not be merged
     * @zh 参与合并的小纹理最大允许尺寸，超过这个尺寸将不参与合并 
     * */
    TEX_SIZE_MAX: number = 1024;

    /**
     * @en Whether to enable MipMap
     * @zh 是否启用MipMap
     * */
    mipMap: boolean = true;
    /** 
     * @en Texture repeat mode
     * @zh 纹理重复模式
     * */
    texWrap = WrapMode.Clamp;
    /** 
     * @en Texture sampling mode
     * @zh 纹理采样模式
     * */
    texMode = FilterMode.Trilinear;
    /** 
     * @en Anisotropic value
     * @zh 各向异性值
     * */
    texAnisoLevel = 1;
    /** 
     * @en Large texture pixel format
     * @zh 大纹理像素格式
     * */
    texFormat = RenderTargetFormat.R8G8B8A8;
    /** 
     * @en Background color
     * @zh 背景色
     * */
    backColor = new Vector4(90, 90, 90, 255);

    /** 
     * @en Large texture width
     * @zh 大纹理宽度
     * */
    LARGE_TEX_W: number = 2048;
    /** 
     * @en Large texture height
     * @zh 大纹理高度
     * */
    LARGE_TEX_H: number = 2048;
    /** 
     * @en Large texture maximum number
     * @zh 大纹理最大数量
     * */
    LARGE_TEX_N: number = 32;

    /** 
     * @en Delay time 30ms
     * @zh 延迟时间 30ms
     * */
    delay = 30;

    /** 
     * @en Total capacity
     * @zh 总容量
     * */
    totalCapacity: number = 0;
    /** 
     * @en Used capacity
     * @zh 已经使用的容量
     * */
    usedCapacity: number = 0;
    /** 
     * @en Whether sRGB space
     * @zh 是否sRGB空间
     * */
    sRGB: boolean = false;
    /** 
     * @en The gamma correction value of the texture. If set to 1.0, texture sampling will be linear without any correction.
     * @zh 纹理的伽马校正值。如果设置为1.0，则纹理采样将为线性，不进行任何校正。
     */
    gammaCorrection: number = 1.0;
    /** 
     * @en Whether to check duplicates
     * @zh 是否查重
     * */
    checkDup: boolean = true;
    /** 
     * @en Whether to automatically extend the number of large textures
     * @zh 是否自动扩展大图数量
     * */
    autoExtend: boolean = false;
    /** 
     * @en Whether to immediately execute merging
     * @zh 是否立即执行合并
     * */
    immediately: boolean = false;

    /** 参与合并的纹理对象数组 */
    protected _texItems: TextureItem[][] = [];
    /** 大纹理中位置占用情况的Map，尺寸为 (LARGE_TEX_SIZE / TEX_SIZE_MIN) ^ 2，默认为0，占用的位置放纹理id */
    protected _texMaps: number[][] = [];
    /** 临时空间占用图 */
    protected _tempMaps: number[] = [];
    /** 
     * @en Merged large texture objects
     * @zh 合并的大纹理对象
     * */
    largeTexs: LargeTex[] = [];
    /** 命令缓冲区 */
    protected _cmdBuffer = new CommandBuffer2D();

    /** 
     * @en Whether destroyed
     * @zh 是否已销毁
     * */
    destroyed: boolean = false;
    /** 
     * @en GPU memory usage
     * @zh 显存使用量
     * */
    gpuMemory: number = 0;

    id: number; 
    /** 
     * @en Large texture set name
     * @zh 大图合集名称
     * */
    name: string;
    
    /** 
     * @en Update hook
     * @zh 更新钩子
     * */
    updateHook:(index: number, completedIds: number[]) => void = null;

    //可选的大纹理尺寸
    protected static _largeTexSize = [
        [8, 8],
        [16, 8],
        [8, 16],
        [16, 16],
        [32, 16],
        [16, 32],
        [32, 32],
        [64, 32],
        [32, 64],
        [64, 64],
        [128, 64],
        [64, 128],
        [128, 128],
        [256, 128],
        [128, 256],
        [256, 256],
        [512, 256],
        [256, 512],
        [512, 512],
        [1024, 512],
        [512, 1024],
        [1024, 1024],
        [2048, 1024],
        [1024, 2048],
        [2048, 2048],
    ];

    /**
     * @en 
     * @param largeTexsize large texture size(size must be a power of 2)
     * @param ltn large texture number limit
     * @param tsm small texture unit size (small texture minimum size)
     * @param exs small texture extend size
     * @zh 
     * @param largeTexsize 大纹理像素尺寸（尺寸要符合2次幂）
     * @param ltn 大纹理数量上限
     * @param tsm 小纹理单元尺寸（小纹理最小尺寸）
     * @param exs 小纹理扩边尺寸
     */
    constructor(largeTexsize: number[], ltn: number, tsm: number = 16, exs: number = 0, texFormat: RenderTargetFormat = RenderTargetFormat.R8G8B8A8) {
        if (largeTexsize[0]) {
            this.LARGE_TEX_W = largeTexsize[0];
            if (largeTexsize[1])
                this.LARGE_TEX_H = largeTexsize[1];
            else this.LARGE_TEX_H = largeTexsize[0];
        }

        this.EXTEND_SIZE = exs;
        this.LARGE_TEX_N = ltn;
        this.TEX_SIZE_MIN = tsm;
        this.texFormat = texFormat;
        const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN | 0;
        const nh = this.LARGE_TEX_H / this.TEX_SIZE_MIN | 0;
        this.totalCapacity = nw * nh * ltn;
        for (let i = 0; i < ltn; i++) {
            this._texItems[i] = [];
            this._texMaps[i] = new Array<number>(nw * nh).fill(0);
        }

        this._tempMaps = new Array<number>(nw * nh).fill(0);
    }

    /**
     * @en Response update
     * @param force force update
     * @zh 响应更新
     * @param force 强制更新
     */
    onUpdate(force: boolean = false) {
        if (!this.largeTexs)
            return false;
        for (let i = 0, len = this.largeTexs.length; i < len; i++) {
            const o: LargeTex = this.largeTexs[i];
            if (!o) continue;
            let completedIds = o.onUpdate(force);
            this.updateHook?.(i, completedIds);
            if (!force && ILaya.stage.getTimeFromFrameStart() > this.delay) break;
        }
        return true;
    }

    /**
     * @en Adjust the maximum number of large textures
     * @param add add amount
     * @zh 调整大纹理数量上限
     * @param add 增加量
     */
    adjustLtn(add: number = 1) {
        if (add > 0) {
            const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN | 0;
            const nh = this.LARGE_TEX_H / this.TEX_SIZE_MIN | 0;
            const ltn = this.LARGE_TEX_N + add;
            this.totalCapacity = nw * nh * ltn;
            for (let i = this.LARGE_TEX_N; i < ltn; i++) {
                this._texItems[i] = [];
                this._texMaps[i] = new Array<number>(nw * nh).fill(0);
            }
            this.LARGE_TEX_N += add;
        }
    }

    /**
     * @en Calculate the GPU memory usage
     * @zh 统计显存使用量
     */
    calculateGpuMemory() {
        this.gpuMemory = 0;
        for (let i = this.largeTexs.length - 1; i > -1; i--) 
            this.gpuMemory += this.largeTexs[i]._renderTarget.gpuMemory;
        return this.gpuMemory;
    }

    /**
     * @en Get the current usage rate (percentage)
     * @zh 获取当前使用率（百分比）
     * @returns 
     */
    getLoadUsageRate() {
        return this.usedCapacity / this.totalCapacity;
    }

    /**
     * 大图指定位置用颜色填充
     * @param largeTextureIndex 大纹理序号
     * @param x 位置x
     * @param y 位置y
     * @param w 宽度
     * @param h 高度
     * @param r 红色成分（0~255）
     * @param g 绿色成分（0~255）
     * @param b 蓝色成分（0~255）
     * @param a Alpha（0~255）
     */
    fillWithColor(largeTextureIndex: number, x: number, y: number, w: number, h: number, r: number, g: number, b: number, a: number = 255) {
        if (largeTextureIndex < this.LARGE_TEX_N && this.largeTexs[largeTextureIndex]) {
            const tex = new Texture2D(1, 1, TextureFormat.R8G8B8A8, false, false);
            const data = new Uint8Array([r, g, b, a]);
            tex.setPixelsData(data, false, false);
            this.largeTexs[largeTextureIndex].addTexture(x, y, w, h, 0, tex, true);
        }
    }

    /**
     * 根据一批小纹理计算大纹理尺寸和高宽
     * @param tex 
     * @param scale 
     * @param tsm
     * @param exs
     * @param tp 合并情况
     * @returns [宽，高，利用率]
     */
    static calcFitTexSize(tex: Texture2D[], scale: number, tsm: number, exs: number, tp?: any) {
        if (!tex || tex.length == 0) return [0];
        const size = LargeTexBase._largeTexSize;
        for (let i = 0, len = size.length; i < len; i++) {
            if (tp) tp.length = 0;
            let sum = 0;
            let count = 0;
            const nw = (size[i][0] / tsm) | 0;
            const nh = (size[i][1] / tsm) | 0;
            const texMap = new Array(nw * nh).fill(0);
            for (let j = 0, len = tex.length; j < len; j++) {
                const ss = LargeTexBase.calcTexSize(tex[j].width, tex[j].height, scale, tsm, exs);
                const sx = ss[2], sy = ss[3];

                let find = false;
                for (let k = 0; k < nh - sy + 1 && !find; k++) {
                    for (let l = 0; l < nw - sx + 1 && !find; l++) {
                        if (texMap[k * nw + l] > 0) continue;
                        let fail = false;
                        for (let m = k; m < k + sy && !fail; m++)
                            for (let n = l; n < l + sx && !fail; n++)
                                if (texMap[m * nw + n] > 0)
                                    fail = true;
                        if (!fail) {
                            for (let m = k; m < k + sy; m++) {
                                for (let n = l; n < l + sx; n++) {
                                    texMap[m * nw + n] = 1;
                                    count++;
                                }
                            }
                            sum++;
                            find = true;
                            if (tp) tp.push([l, k, sx, sy]);
                        }
                    }
                }
                if (!find) break;
            }
            if (sum == tex.length)
                return [size[i][0], size[i][1], count * 100 / nw / nh | 0];
        }
        return [0];
    }

    /**
     * 指定的贴图是否都已经在大图合集上
     * @param ui 贴图id或url
     * @param largeTextureIndex 大纹理序号
     * @returns 是否都已经在大图合集上
     */
    areTextureMerged(ui: number | string, largeTextureIndex: number = -1) {
        let result = false;
        if (largeTextureIndex >= 0) {
            let ti = this._findTexture(ui, largeTextureIndex);
            if (ti) {
                let lt = this.largeTexs[largeTextureIndex];
                return lt.hasWaitMerge(ti.id);
            }
        } else {
            for (let i = 0; i < this.LARGE_TEX_N; i++) {
                if (this.areTextureMerged(ui, i)) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }
    
    /**
     * 指定的贴图是否都已经在大图合集上
     * @param texs 贴图组
     */
    areAllTexturesIncluded(texs: Texture2D[]) {
        if (texs) {
            for (let i = texs.length - 1; i > -1; i--) {
                let find = false;
                for (let j = 0; j < this.LARGE_TEX_N; j += 2) {
                    if (this._findTexture(texs[i].id, j)) {
                        find = true;
                        break;
                    }
                }
                if (!find) return false;
            }
            return true;
        }
        return false;
    }

    /**
     * 大图合集指定纹理空间是否够用
     * @param tex 小纹理数组
     * @param scale 放缩系数
     * @param largeTextureIndex 大纹理序号
     * @return 够用true，不够用false
     */
    hasEnoughSpace(tex: Texture2D[], scale: number, largeTextureIndex: number) {
        if (!tex || tex.length == 0 || this._texMaps.length == 0
            || largeTextureIndex < 0 || largeTextureIndex >= this.LARGE_TEX_N) return false;
        const texMap = this._tempMaps;
        const nw = (this.LARGE_TEX_W / this.TEX_SIZE_MIN) | 0;
        const nh = (this.LARGE_TEX_H / this.TEX_SIZE_MIN) | 0;
        for (let j = 0; j < nh; j++)
            for (let i = 0; i < nw; i++)
                texMap[j * nw + i] = this._texMaps[largeTextureIndex][j * nw + i];
        
        for (let i = 0, len = tex.length; i < len; i++) {
            if (!tex[i]) continue;
            const ti = this._findTexture(tex[i].id, largeTextureIndex);
            if (ti) continue;
            const ss = LargeTexBase.calcTexSize(tex[i].width, tex[i].height, scale, this.TEX_SIZE_MIN, this.EXTEND_SIZE);
            if (!this._takeRoomInMap(ss[2], ss[3], texMap)) return false;
        }
        return true;
    }

    /**
     * 获取具有足够空间的大纹理编号
     * @param tex 小纹理数组
     * @param scale 放缩系数
     * @return 成功大纹理编号，失败-1
     */
    findAvailableLargeTextureCode(tex: Texture2D[], scale: number) {
        for (let i = 0; i < this.LARGE_TEX_N; i++)
            if (this.hasEnoughSpace(tex, scale, i))
                return i;
        return -1;
    }

    /**
     * 将一组小纹理合并到指定的大纹理中
     * @param texs 小纹理数组
     * @param scale 放缩系数
     * @param largeTextureIndex 大纹理编号
     * @param needRemove 小纹理用完后是否需要删除
     * @return 成功true，失败false，如果失败，所有的小纹理都没有合并进大纹理中
     */
    addTexturesToLargeTexture(texs: Texture2D[], scale: number, largeTextureIndex: number, needRemove: boolean = false) {
        const space = this.hasEnoughSpace(texs, scale, largeTextureIndex);
        if (!space) return false;
        for (let i = 0, len = texs.length; i < len; i++)
            this.addTexture(texs[i], scale, largeTextureIndex, null, needRemove);
        return true;
    }

    /**
     * 添加小纹理
     * @param tex 纹理对象
     * @param scale 放缩系数（0.1~10.0）
     * @param largeTextureIndex 指定大图纹理编号（-1：不指定）
     * @param url 纹理URL
     * @param needRemove 小纹理用完后是否需要删除
     * @returns 成功大纹理编号，失败-1
     */
    addTexture(tex: Texture2D, scale: number = 1, largeTextureIndex: number = -1, url: string = null, needRemove: boolean = false) {
        if (!tex) return -1;
        
        const w = tex.width * scale | 0;
        const h = tex.height * scale | 0;
        if (w > this.LARGE_TEX_W - this.EXTEND_SIZE * 2
            || h > this.LARGE_TEX_H - this.EXTEND_SIZE * 2) {
            console.warn("LargeTexManager: the texture is too large1!");
            return -1;
        }
        if (w > this.TEX_SIZE_MAX || h > this.TEX_SIZE_MAX) {
            console.warn("LargeTexManager: the texture is too large2!");
            return -1;
        }
        const ti = this._addTexture(tex, scale, largeTextureIndex, url, needRemove);
        if (!ti) {
            console.warn("LargeTexManager: have not enough room!");
            return -1;
        }
        return ti.largeTextureIndex;
    }

    /**
     * 添加纹理占位符
     * @param url 纹理资源
     * @param w 纹理宽度
     * @param h 纹理高度
     * @param scale 放缩系数（0.1~10.0）
     * @param largeTextureIndex 指定大图纹理编号（-1：不指定）
     * @returns
     */
    addPlaceholder(url: string, w: number, h: number, scale: number = 1, largeTextureIndex: number = -1) {
        let w1 = w * scale | 0;
        let h1 = h * scale | 0;
        if (w1 > this.LARGE_TEX_W - this.EXTEND_SIZE * 2
            || h1 > this.LARGE_TEX_H - this.EXTEND_SIZE * 2) {
            console.warn("LargeTexManager: the texture is too large1!");
            return -1;
        }
        if (w1 > this.TEX_SIZE_MAX || h1 > this.TEX_SIZE_MAX) {
            console.warn("LargeTexManager: the texture is too large2!");
            return -1;
        }
        const ti = this._addPlaceholder(url, w, h, scale, largeTextureIndex);
        if (!ti) {
            console.warn("LargeTexManager: have not enough room!");
            return -1;
        }
        return ti.largeTextureIndex;
    }

    /**
     * 更新小纹理
     * @param tex 纹理对象
     * @param scale 放缩系数（0.1~10.0）
     * @param largeTextureIndex 指定大图纹理编号（-1：不指定）
     * @param url 纹理URL
     * @param needRemove 小纹理用完后是否需要删除
     * @returns 成功大纹理编号，失败-1
     */
    updateTexture(tex: Texture2D, scale: number = 1, largeTextureIndex: number = -1, url?: string, needRemove: boolean = false) {
        if (tex) {
            const ti = this._updateTexture(tex, scale, largeTextureIndex, url, needRemove);
            if (!ti) {
                console.warn("LargeTexManager: not found texture to update!");
                return -1;
            }
            return ti.largeTextureIndex;
        }
        return -1;
    }

    /**
     * 获取纹理和UV
     * @param iu 小纹理id或url
     * @param largeTextureIndex 大纹理编号
     * @returns 纹理对象
     */
    getTexture(iu: number | string, largeTextureIndex: number = -1) {
        const ti = this._findTexture(iu, largeTextureIndex);
        if (ti) {
            const to: TextureOut = {};
            to.texItem = ti;
            to.texture = this.largeTexs[ti.largeTextureIndex];
            to.texCode = ti.largeTextureIndex;
            return to;
        }
        return null;
    }

    /**
     * 获取纹理和UV
     * @param tex 纹理对象
     * @param largeTextureIndex 大纹理编号
     * @returns 纹理对象
     */
    getTextureByRef(tex: Texture2D, largeTextureIndex: number = -1) {
        return this.getTexture(tex.id, largeTextureIndex);
    }

    /**
     * 根据大图纹理序号获取大纹理
     * @param largeTextureIndex 大纹理编号
     * @returns 大纹理或null
     */
    getLargeTex(largeTextureIndex: number) {
        return this.largeTexs[largeTextureIndex];
    }

    /**
     * 删除小纹理
     * @param iu 小纹理id或url
     * @param largeTextureIndex 大纹理编号(-1: 不指定)
     */
    removeTexture(iu: number | string, largeTextureIndex: number = -1) {
        if (!this._texItems) return;
        const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN;
        let sx = 0, sy = 0, ex = 0, ey = 0;
        if (largeTextureIndex >= 0) {
            if (largeTextureIndex < this.LARGE_TEX_N) {
                const texItems = this._texItems[largeTextureIndex];
                let texMaps = this._texMaps[largeTextureIndex];
                for (let i = texItems.length - 1; i > -1; i--) {
                    if (texItems[i].isSelf(iu)) {
                        const ti = texItems[i];
                        const currentLargeTextureIndex = ti.largeTextureIndex;
                        sx = ti.pos.x;
                        sy = ti.pos.y;
                        ex = ti.pos.z + sx;
                        ey = ti.pos.w + sy;
                        texMaps = this._texMaps[currentLargeTextureIndex];
                        for (let j = sy; j < ey; j++)
                            for (let k = sx; k < ex; k++)
                                texMaps[j * nw + k] = 0;
                        this.fillWithColor(currentLargeTextureIndex, sx * this.TEX_SIZE_MIN, sy * this.TEX_SIZE_MIN,
                            ti.pos.z * this.TEX_SIZE_MIN, ti.pos.w * this.TEX_SIZE_MIN,
                            this.backColor.x, this.backColor.y, this.backColor.z, this.backColor.w);
                        texItems.splice(i, 1);
                        this.usedCapacity -= ti.pos.z * ti.pos.w;
                    }
                }
            }
        }
        else {
            for (let i = 0; i < this.LARGE_TEX_N; i++)
                this.removeTexture(iu, i);
        }
    }

    /**
     * 清空，重用对象
     */
    clear() {
        for (let i = this.largeTexs.length - 1; i > -1; i--)
            if (this.largeTexs[i])
                this.largeTexs[i].destroy();
        this.largeTexs.length = 0;
        const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN | 0;
        const nh = this.LARGE_TEX_H / this.TEX_SIZE_MIN | 0;
        for (let i = 0; i < this.LARGE_TEX_N; i++) {
            this._texItems[i].length = 0;
            this._texMaps[i] = new Array<number>(nw * nh).fill(0);
        }
        this.usedCapacity = 0;
        this._cmdBuffer.clear();
    }

    /**
     * 销毁对象，清理内存
     * @param keepRes
     */
    destroy(keepRes: boolean = false) {
        if (this.destroyed) return;
        for (let i = 0; i < this.largeTexs.length; i++)
            if (this.largeTexs[i]) {
                if (!keepRes)
                    this.largeTexs[i].destroy();
                else this.largeTexs[i].lock = false;
            }
        this.largeTexs = null;
        this._texMaps = null;
        this._texItems = null;
        this.updateHook = null;
        this._cmdBuffer.clear();
        this._cmdBuffer = null;
        this.destroyed = true;
    }

    /**
     * 查找小纹理参数/占位
     * @param iu 小纹理id或url
     * @param largeTextureIndex 大纹理编号（-1：不指定）
     * @returns 小纹理信息
     */
    protected _findTexture(iu: number | string, largeTextureIndex: number = -1) {
        if (largeTextureIndex >= 0) {
            if (largeTextureIndex < this.LARGE_TEX_N) {
                const texItems = this._texItems[largeTextureIndex];
                const len = texItems.length;
                for (let i = 0; i < len; i++)
                    if (texItems[i].isSelf(iu))
                        return texItems[i];
            }
        }
        else {
            for (let j = 0; j < this.LARGE_TEX_N; j ++ ) {
                const texItems = this._texItems[j];
                const len = texItems.length;
                for (let i = 0; i < len; i++)
                    if (texItems[i].isSelf(iu))
                        return texItems[i];
            }
        }
        return null;
    }

    /**
     * 清除所有纹理
     */
    removeAllTextures() {
        const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN;
        const nh = this.LARGE_TEX_H / this.TEX_SIZE_MIN;
        for (let i = 0; i < this.LARGE_TEX_N; i++) {
            for (let j = 0; j < nh; j++)
                for (let k = 0; k < nw; k++)
                    this._texMaps[i][j * nw + k] = 0;
            this.largeTexs[i] = null;
            this._texItems[i].length = 0;
        }
        this.usedCapacity = 0;
    }

    /**
     * 创建大纹理
     * @param largeTextureIndex 大纹理编号
     * @param sRGB 大图是否sRGB格式
     */
    createLargeTex(largeTextureIndex: number, sRGB?: boolean, gammaCorrection?: number) {
        const mipMap = this.mipMap && !!(LayaGL.renderEngine as any).gl;
        const texMode = this.texMode;
        const anisoLevel = this.texAnisoLevel;
        sRGB = sRGB ? sRGB : this.sRGB;
        gammaCorrection = gammaCorrection ? gammaCorrection : this.gammaCorrection;
        
        if (largeTextureIndex >= 0 && largeTextureIndex < this.LARGE_TEX_N) {
            if (!this.largeTexs[largeTextureIndex]) {
                const lt = new LargeTex(this.LARGE_TEX_W, this.LARGE_TEX_H, this.texFormat, null, mipMap, 4, sRGB , this.gammaCorrection);
                lt.lock = true;
                lt.filterMode = texMode;
                lt.anisoLevel = anisoLevel;
                lt.wrapModeU = this.texWrap;
                lt.wrapModeV = this.texWrap;
                lt.cmdBuffer = this._cmdBuffer;
                lt.immediately = this.immediately;
                lt.name = this.name;
                this.largeTexs[largeTextureIndex] = lt;

                //填充底色
                if (this.backColor.x > 0 || this.backColor.y > 0 || this.backColor.z > 0 || this.backColor.w > 0)
                    this.fillWithColor(largeTextureIndex, 0, 0, this.LARGE_TEX_W, this.LARGE_TEX_H,
                        this.backColor.x, this.backColor.y, this.backColor.z, this.backColor.w);
            }
        }
    }

    /**
     * 计算纹理分块尺寸
     * @param tw 纹理宽度
     * @param th 纹理高度
     * @param scale 放缩系数
     * @param tsm 最小尺寸
     * @param exs 边缘扩展
     * @returns [宽，高，水平块数，垂直块数]
     */
    static calcTexSize(tw: number, th: number, scale: number, tsm: number, exs: number) {
        const w = (tw * scale) | 0;
        const h = (th * scale) | 0;
        let sx = (w + exs * 2) / tsm;
        let sy = (h + exs * 2) / tsm;
        if (sx != (sx | 0)) sx = (sx | 0) + 1;
        if (sy != (sy | 0)) sy = (sy | 0) + 1;
        return [w, h, sx, sy];
    }

    /**
     * 添加小纹理，合成大纹理
     * @param tex 小纹理
     * @param scale 放缩系数
     * @param largeTextureIndex 指定大纹理序号（-1：不指定）
     * @param url 纹理URL
     * @param needRemove 小纹理用完后是否需要删除
     * @returns 
     */
    protected _addTexture(tex: Texture2D, scale: number, largeTextureIndex: number = -1, url: string = null, needRemove: boolean = false) {
        if (!tex || tex instanceof Texture2D == false) return null;

        let ti:TextureItem;
        if (this.checkDup) {
            ti = this._findTexture(tex.id, largeTextureIndex);
            if (ti && !ti.token) return ti;
        }

        const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN | 0;

        if (ti && ti.token) { //有纹理占位，换成实际纹理
            ti.token = false;
            ti.id = tex.id;
            const x1 = ti.pos.x + ti.pos.z;
            const y1 = ti.pos.y + ti.pos.w;
            const tw = ti.w * this.LARGE_TEX_W;
            const th = ti.h * this.LARGE_TEX_H;
            for (let j = ti.pos.y; j < y1; j++)
                for (let k = ti.pos.x; k < x1; k++)
                    this._texMaps[ti.largeTextureIndex][j * nw + k] = ti.id;
            if (!this.largeTexs[ti.largeTextureIndex])
                this.createLargeTex(ti.largeTextureIndex);
            let cmd = this.largeTexs[ti.largeTextureIndex].addTexture(this.TEX_SIZE_MIN * ti.pos.x + this.EXTEND_SIZE,
                this.TEX_SIZE_MIN * ti.pos.y + this.EXTEND_SIZE, tw, th, this.EXTEND_SIZE, tex, needRemove);
            // ti.cmd = cmd;
            return ti;
        } else {
            const ss = LargeTexBase.calcTexSize(tex.width, tex.height, scale, this.TEX_SIZE_MIN, this.EXTEND_SIZE);
            let room = this._findRoom(ss[2], ss[3], largeTextureIndex);
            if (room[0] < 0 && this.autoExtend) {
                this.adjustLtn();
                room = this._findRoom(ss[2], ss[3], largeTextureIndex);
            }
            if (room[0] >= 0) {
                const ti = new TextureItem();
                ti.id = tex.id;
                ti.largeTextureIndex = room[0];
                ti.x = (room[2] * this.TEX_SIZE_MIN + this.EXTEND_SIZE) / this.LARGE_TEX_W;
                ti.y = (room[1] * this.TEX_SIZE_MIN + this.EXTEND_SIZE) / this.LARGE_TEX_H;
                ti.w = ss[0] / this.LARGE_TEX_W;
                ti.h = ss[1] / this.LARGE_TEX_H;
                ti.pos.x = room[2];
                ti.pos.y = room[1];
                ti.pos.z = ss[2];
                ti.pos.w = ss[3];
                ti.scale = scale;
                if (url) ti.url = url;
                else ti.url = tex.url;
                this._addToTextureItem(ti);
                this.usedCapacity += ss[2] * ss[3];

                const x1 = room[2] + ss[2];
                const y1 = room[1] + ss[3];
                for (let j = room[1]; j < y1; j++)
                    for (let k = room[2]; k < x1; k++)
                        this._texMaps[ti.largeTextureIndex][j * nw + k] = ti.id;
                if (!this.largeTexs[ti.largeTextureIndex])
                    this.createLargeTex(ti.largeTextureIndex);
                let cmd = this.largeTexs[ti.largeTextureIndex].addTexture(this.TEX_SIZE_MIN * room[2] + this.EXTEND_SIZE,
                    this.TEX_SIZE_MIN * room[1] + this.EXTEND_SIZE, ss[0], ss[1], this.EXTEND_SIZE, tex, needRemove);
                // ti.cmd = cmd;
                return ti;
            }
        }
        return null;
    }

    /**
     * 添加纹理占位符
     * @param url 纹理资源
     * @param w 纹理宽度
     * @param h 纹理高度
     * @param scale 放缩系数（0.1~10.0）
     * @param largeTextureIndex 指定大图纹理编号（-1：不指定）
     * @returns 纹理占位对象
     */
    protected _addPlaceholder(url: string, w: number, h: number, scale: number = 1, largeTextureIndex: number = -1) {
        const ti = this._findTexture(url, largeTextureIndex);
        if (ti) return ti;

        const ss = LargeTexBase.calcTexSize(w, h, scale, this.TEX_SIZE_MIN, this.EXTEND_SIZE);
        let room = this._findRoom(ss[2], ss[3], largeTextureIndex);
        if (room[0] < 0 && this.autoExtend) {
            this.adjustLtn();
            room = this._findRoom(ss[2], ss[3], largeTextureIndex);
        }

        if (room[0] >= 0) {
            const ti = new TextureItem();
            ti.largeTextureIndex = room[0];
            ti.x = (room[2] * this.TEX_SIZE_MIN + this.EXTEND_SIZE) / this.LARGE_TEX_W;
            ti.y = (room[1] * this.TEX_SIZE_MIN + this.EXTEND_SIZE) / this.LARGE_TEX_H;
            ti.w = ss[0] / this.LARGE_TEX_W;
            ti.h = ss[1] / this.LARGE_TEX_H;
            ti.pos.x = room[2];
            ti.pos.y = room[1];
            ti.pos.z = ss[2];
            ti.pos.w = ss[3];
            ti.scale = scale;
            ti.token = true;
            if (url) ti.url = url;
            this._addToTextureItem(ti);
            this.usedCapacity += ss[2] * ss[3];

            const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN | 0;
            const largeTextureIndex = ti.largeTextureIndex;
            const x1 = room[2] + ss[2];
            const y1 = room[1] + ss[3];
            for (let j = room[1]; j < y1; j++)
                for (let k = room[2]; k < x1; k++)
                    this._texMaps[largeTextureIndex][j * nw + k] = 0x7fffffff;
            return ti;
        }
        return null;
    }

    /**
     * 更新小纹理，合成大纹理
     * @param tex 小纹理
     * @param scale 放缩系数
     * @param largeTextureIndex 指定大纹理序号（-1：不指定）
     * @param url 纹理URL
     * @param needRemove 小纹理用完后是否需要删除
     * @returns 
     */
    protected _updateTexture(tex: Texture2D, scale: number, largeTextureIndex: number = -1, url: string = null, needRemove: boolean = false) {
        if (!tex) return null;

        const ti = this._findTexture(tex.id, largeTextureIndex);
        if (!ti || ti.scale != scale) return null;

        const w = tex.width;
        const h = tex.height;
        const ss = LargeTexBase.calcTexSize(w, h, scale, this.TEX_SIZE_MIN, this.EXTEND_SIZE);
        if (ti.pos.z != ss[2] || ti.pos.w != ss[3]) return null;

        const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN | 0;

        if (ti.token) { //有纹理占位，换成实际纹理
            ti.token = false;
            ti.id = tex.id;
            const x1 = ti.pos.x + ti.pos.z;
            const y1 = ti.pos.y + ti.pos.w;
            const tw = ti.w * this.LARGE_TEX_W;
            const th = ti.h * this.LARGE_TEX_H;
            for (let j = ti.pos.y; j < y1; j++)
                for (let k = ti.pos.x; k < x1; k++)
                    this._texMaps[ti.largeTextureIndex][j * nw + k] = ti.id;
            if (!this.largeTexs[ti.largeTextureIndex])
                this.createLargeTex(ti.largeTextureIndex);
            this.largeTexs[ti.largeTextureIndex].addTexture(this.TEX_SIZE_MIN * ti.pos.x + this.EXTEND_SIZE,
                this.TEX_SIZE_MIN * ti.pos.y + this.EXTEND_SIZE, tw, th, this.EXTEND_SIZE, tex, needRemove);
            return ti;
        } else {
            ti.id = tex.id;
            if (url) ti.url = url;
            if (!this.largeTexs[ti.largeTextureIndex])
                this.createLargeTex(ti.largeTextureIndex);
            this.largeTexs[ti.largeTextureIndex].addTexture(this.TEX_SIZE_MIN * ti.pos.x + this.EXTEND_SIZE,
                this.TEX_SIZE_MIN * ti.pos.y + this.EXTEND_SIZE, ss[0], ss[1], this.EXTEND_SIZE, tex, needRemove);
            return ti;
        }
    }

    /**
     * 查询并占据单张纹理的空间（指定Map）
     * @param x 纹理的尺寸x方向
     * @param y 纹理的尺寸y方向
     * @param texMap 空间占用图
     * @returns 成功true，失败false
     */
    protected _takeRoomInMap(x: number, y: number, texMap: number[]) {
        const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN | 0;
        const room = this._peekRoomInMap(x, y, texMap);
        if (room[0] < 0) return false;
        const i0 = room[1];
        const j0 = room[0];
        const i1 = x + room[1];
        const j1 = y + room[0];
        for (let j = j0; j < j1; j++)
            for (let i = i0; i < i1; i++)
                texMap[j * nw + i] = 0x7fffffff;
        return true;
    }

    /**
     * 查询单张纹理的空间（指定Map）
     * @param x 纹理的尺寸x方向
     * @param y 纹理的尺寸y方向
     * @param texMap 空间占用图
     * @returns 空间位置[垂值位置，水平位置]
     */
    protected _peekRoomInMap(x: number, y: number, texMap: number[]) {
        const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN | 0;
        const nh = this.LARGE_TEX_H / this.TEX_SIZE_MIN | 0;
        for (let j = 0; j < nh - y + 1; j++) {
            for (let i = 0; i < nw - x + 1; i++) {
                let fail = false;
                if (texMap[j * nw + i] > 0)
                    fail = true;
                if (fail) continue;
                for (let m = j; m < j + y && !fail; m++) {
                    for (let l = i; l < i + x && !fail; l++) {
                        if (texMap[m * nw + l] > 0)
                            fail = true;
                    }
                }
                if (!fail) return [j, i];
            }
        }
        return [-1, -1];
    }

    /**
     * 查询纹理的空间
     * @param x 纹理的尺寸x方向
     * @param y 纹理的尺寸y方向
     * @param largeTextureIndex 指定大图编号（-1：不指定）
     * @returns [大图编号，垂直位置，水平位置]
     */
    protected _findRoom(x: number, y: number, largeTextureIndex: number = -1) {
        if (largeTextureIndex >= 0) { //查找指定大图
            if (largeTextureIndex < this.LARGE_TEX_N) {
                const room = this._peekRoomInMap(x, y, this._texMaps[largeTextureIndex]);
                return [largeTextureIndex, room[0], room[1]];
            }
            return [-1, -1, -1];
        }
        for (let i = 0; i < this.LARGE_TEX_N; i++) {
            const room = this._peekRoomInMap(x, y, this._texMaps[i]);
            if (room[0] >= 0)
                return [i, room[0], room[1]];
        }
        return [-1, -1, -1];
    }

    /**
     * 将纹理加入（可排序，面积大的排前面）
     * @param ti 纹理参数
     * @param sort 是否排序
     */
    protected _addToTextureItem(ti: TextureItem, sort: boolean = false) {
        const texItems = this._texItems[ti.largeTextureIndex];
        if (sort) {
            const len = texItems.length;
            for (let i = 0; i < len; i++) {
                if (ti.w * ti.h > texItems[i].w * texItems[i].h) {
                    texItems.splice(i, 0, ti);
                    return;
                }
            }
        }
        texItems.push(ti);
    }
}

/**
 * @en Large texture manager class (general)
 * @zh 大图合集类（通用）
 * */
export class LargeTexManager extends LargeTexBase {
    COLOR_ITEM_SIZE: number = 4; //颜色块尺寸，每个颜色块在纹理中的尺寸为 COLOR_ITEM_SIZE * COLOR_ITEM_SIZE

    private _curColor: Vector3[] = []; //当前合并的颜色序号（x：块横向起始，y：块纵向起始, z: 块内序号）
    private _curColorUV: Vector2 = new Vector2(); //当前合并的颜色UV值
    private _curColorMap: ColorItem[][] = []; //颜色图，已经合成到纹理中的颜色

    private _largeTexCode: number = 0; //当前大纹理编号
    private _reserve: boolean = false; //大图合集的空间是否保留1/4

    active: boolean = true; //当前大图合集对象是否激活

    /**
     * 构造函数
     * @param lts 大纹理像素尺寸
     * @param ltn 大纹理数量上限
     * @param tsm 小纹理单元尺寸
     * @param exs 小纹理扩边尺寸
     */
    constructor(lts: number[], ltn: number, tsm: number = 16, exs: number = 0, texFormat: RenderTargetFormat = RenderTargetFormat.R8G8B8A8) {
        super(lts, ltn, tsm, exs, texFormat);
        LargeTexProcessor.addMgr(this);
        for (let i = 0; i < this.LARGE_TEX_N; i++) {
            this._curColor[i] = new Vector3(0, 0, -1);
            this._curColorMap[i] = []; 
        }
    }

    /**
     * 添加空白边框纹理
     * @param largeTextureIndex 大纹理序号
     */
    addDummySideTexture(largeTextureIndex: number = -1) {
        this.addTexture(Texture2D.blackTexture, 64, largeTextureIndex, null, true);
    }

    /**
     * 添加颜色
     * @param color 颜色
     * @param largeTextureIndex 大图纹理编号（-1:不指定）
     * @returns 成功大纹理编号，失败-1
     */
    addColor(color: Vector4, largeTextureIndex: number = -1) {
        return this._addColor(color.x, color.y, color.z, color.w, largeTextureIndex);
    }

    /**
     * 获取颜色所在的大纹理
     * @param color 颜色
     * @param uv 纹理坐标（不输入表示不获取）
     * @param largeTextureIndex 大纹理编号（-1:不指定）
     * @returns 大纹理或null
     */
    getColor(color: Vector4, uv?: Vector4, largeTextureIndex: number = -1) {
        let i = this._largeTexCode;
        if (largeTextureIndex && largeTextureIndex >= 0 && largeTextureIndex < this.LARGE_TEX_N) i = largeTextureIndex;
        const ci = this._findColor(color.x, color.y, color.z, color.w, i);
        if (ci) {
            if (uv) {
                uv.x = ci.u;
                uv.y = ci.v;
                uv.z = 1 / this.LARGE_TEX_W;
                uv.w = 1 / this.LARGE_TEX_H;
            }
            return this.largeTexs[i];
        }
        return null;
    }

    /**
     * 获得大图合集是否有保留空间
     * @returns 
     */
    getReserve() {
        return this._reserve;
    }

    /**
     * 设置大图合集是否要保留空间
     * @param rv 是否保留
     */
    setReserve(rv: boolean) {
        this._reserve = rv;
    }

    /**
     * 销毁对象，清理内存
     * @param keepRes
     */
    destroy(keepRes: boolean = false) {
        LargeTexProcessor.removeMgr(this);
        super.destroy(keepRes);
        this.active = false;
    }

    /**
     * 查找颜色
     * @param r 颜色值
     * @param g 
     * @param b 
     * @param a 
     * @param largeTextureIndex 大纹理编号
     * @returns 
     */
    private _findColor(r: number, g: number, b: number, a: number, largeTextureIndex: number) {
        if (largeTextureIndex >= 0 && largeTextureIndex < this.LARGE_TEX_N) {
            const len = this._curColorMap[largeTextureIndex].length;
            if (this.texFormat == RenderTargetFormat.R8G8B8) {
                for (let i = 0; i < len; i++) {
                    if (this._curColorMap[largeTextureIndex][i]
                        && this._curColorMap[largeTextureIndex][i].r == r
                        && this._curColorMap[largeTextureIndex][i].g == g
                        && this._curColorMap[largeTextureIndex][i].b == b) {
                        return this._curColorMap[largeTextureIndex][i];
                    }
                }
            }
            else if (this.texFormat == RenderTargetFormat.R8G8B8A8) {
                for (let i = 0; i < len; i++) {
                    if (this._curColorMap[largeTextureIndex][i]
                        && this._curColorMap[largeTextureIndex][i].r == r
                        && this._curColorMap[largeTextureIndex][i].g == g
                        && this._curColorMap[largeTextureIndex][i].b == b
                        && this._curColorMap[largeTextureIndex][i].a == a) {
                        return this._curColorMap[largeTextureIndex][i];
                    }
                }
            }
        }
        return null;
    }

    /**
     * 清除所有纹理
     */
    removeAllTextures() {
        super.removeAllTextures();
        for (let i = 0; i < this.LARGE_TEX_N; i++) {
            this._curColor[i].setValue(0, 0, 0);
            this._curColorMap[i].length = 0;
        }
        this._largeTexCode = 0;
    }

    /**
     * 将颜色加入，颜色写入大纹理中
     * @param r 颜色值
     * @param g 
     * @param b 
     * @param a 
     * @param largeTextureIndex 大纹理编号
     * @returns 
     */
    private _addColor(r: number, g: number, b: number, a: number, largeTextureIndex: number) {
        let i = this._largeTexCode;
        if (largeTextureIndex && largeTextureIndex >= 0 && largeTextureIndex < this.LARGE_TEX_N) i = largeTextureIndex;
        let cti: ColorItem = this._findColor(r, g, b, a, i);
        if (cti) {
            this._curColorUV.x = cti.u;
            this._curColorUV.y = cti.v;
            return i; //这个颜色已经在当前大纹理中存在，复用即可
        }

        cti = {};
        let add = -1;
        const nc = (this.TEX_SIZE_MIN / this.COLOR_ITEM_SIZE) | 0;
        if (this._curColor[i].z >= 0 && this._curColor[i].z < nc * nc) add = i; //当前的颜色块还有空间
        else { //当前颜色块已经没有空间，重新找一个颜色块空间
            const room = this._findRoom(1, 1, 1);
            if (room[0] != -1) {
                const ti = new TextureItem();
                ti.id = 1; //颜色块的ID恒为1
                this._addToTextureItem(ti);

                const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN;
                const i1 = room[0];
                const j1 = room[1];
                const k1 = room[2];

                const index = j1 * nw + k1;
                this._texMaps[i1][index] = 1;
                this._curColor[i1].x = k1;
                this._curColor[i1].y = j1;
                this._curColor[i1].z = 0;
                this._largeTexCode = i1;
                add = this._largeTexCode;

                if (!this.largeTexs[i1])
                    this.createLargeTex(i1);
            }
        }

        //将颜色写入纹理中
        if (add >= 0) {
            let x = this._curColor[add].z % nc;
            let y = (this._curColor[add].z / nc) | 0;
            x = this._curColor[add].x * this.TEX_SIZE_MIN + (x + 0.5) * this.COLOR_ITEM_SIZE;
            y = this._curColor[add].y * this.TEX_SIZE_MIN + (y + 0.5) * this.COLOR_ITEM_SIZE;
            this._curColorUV.x = x / this.LARGE_TEX_W;
            this._curColorUV.y = y / this.LARGE_TEX_H;
            cti.r = r;
            cti.g = g;
            cti.b = b;
            cti.a = a;
            cti.u = this._curColorUV.x;
            cti.v = this._curColorUV.y;
            cti.largeTextureIndex = add;
            this._curColorMap[add].push(cti);
            this._curColor[add].z++;

            let cmd = this.largeTexs[add].addColor(x - this.COLOR_ITEM_SIZE * 0.5, y - this.COLOR_ITEM_SIZE * 0.5,
                this.COLOR_ITEM_SIZE, this.COLOR_ITEM_SIZE, new Vector4(r, g, b, a), this.texFormat);
            return add;
        }
        return -1;
    }

    /**
     * 查询纹理的空间（指定Map）
     * @param x 纹理的尺寸x方向
     * @param y 纹理的尺寸y方向
     * @param texMap 空间占用图
     * @returns 空间位置[垂值位置，水平位置]
     */
    protected _peekRoomInMap(x: number, y: number, texMap: number[]) {
        const nw = this.LARGE_TEX_W / this.TEX_SIZE_MIN | 0;
        const nh = this.LARGE_TEX_H / this.TEX_SIZE_MIN | 0;
        const nw2 = (nw / 2) | 0;
        const nh2 = (nh / 2) | 0;
        for (let j = 0; j < nh - y + 1; j++) {
            for (let i = 0; i < nw - x + 1; i++) {
                let fail = false;
                if (texMap[j * nw + i] > 0)
                        fail = true;
                if (fail) continue;
                for (let m = j; m < j + y && !fail; m++) {
                    for (let l = i; l < i + x && !fail; l++) {
                        if (this._reserve) { //空间有保留
                            if (m > nh2 && l > nw2) {
                                fail = true;
                                continue;
                            }
                        }
                        if (texMap[m * nw + l] > 0)
                                fail = true;
                    }
                }
                if (!fail) return [j, i];
            }
        }
        return [-1, -1];
    }

    /**
     * 获取大图的Base64编码
     * @returns 
     */
    getBase64(): Promise<string[]> {
        let promises: Promise<string>[] = [];
        this.largeTexs.forEach(v => {
            promises.push(Utils.uint8ArrayToArrayBufferAsync(v));
        })
        return Promise.all(promises);
    }
}
