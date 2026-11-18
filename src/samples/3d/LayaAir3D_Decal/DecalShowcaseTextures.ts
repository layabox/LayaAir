import { Texture2D } from "laya/resource/Texture2D";
import { TextureFormat } from "laya/RenderEngine/RenderEnum/TextureFormat";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "laya/RenderEngine/RenderEnum/WrapMode";

export interface DecalShowcaseTextureSet {
    albedo: Texture2D;
    normal: Texture2D;
    /** Standard Laya metallic/gloss texture, also usable as AO: R metal, G AO, A smoothness.
     * 标准 Laya 金属度/光泽度贴图，也可用作 AO：R 为金属度，G 为 AO，A 为光滑度。 */
    maos: Texture2D;
}

type Surface = (u: number, v: number, x: number, y: number) => number[];

/** Deterministic, self-contained surfaces and stamps for the decal showcase.
 * 为贴花示例生成确定且自包含的表面纹理与印记。 */
export class DecalShowcaseTextures {
    static concrete(size = 512): DecalShowcaseTextureSet {
        return this.build(size, true, (u, v, x, y) => {
            const cloud = noise(u, v, 7, 31) * 0.6 + noise(u, v, 23, 32) * 0.4;
            const grain = hash(x, y, 41);
            const pores = Math.pow(hash(x, y, 42), 30);
            const mottling = cloud * 22 + grain * 12 - pores * 24;
            const seam = Math.min(u, v, 1 - u, 1 - v) < 0.003 ? 0.62 : 1;
            return [(86 + mottling) * seam, (90 + mottling) * seam, (91 + mottling) * seam,
                255, (cloud * 0.25 + grain * 0.18 - pores * 0.22), 3, 218 - pores * 60, 36 + cloud * 18];
        }, 3.5);
    }

    static metal(size = 512): DecalShowcaseTextureSet {
        return this.build(size, true, (u, v, x, y) => {
            const brushed = hash(x, 0, 83) * 13 + noise(u, v, 12, 84) * 16;
            const scratch = hash(x, 0, 85) > 0.995 && hash(0, y >> 5, 86) > 0.45 ? 22 : 0;
            const value = 95 + brushed + scratch;
            return [value * 0.91, value * 0.97, value, 255,
                hash(x, 0, 83) * 0.06 + noise(u, v, 16, 84) * 0.08,
                230, 246, 150 + brushed * 1.5];
        }, 2.5);
    }

    static stencil(size = 512): DecalShowcaseTextureSet {
        return this.build(size, false, (u, v, x, y) => {
            // A broad stencil with cropped-corner frame, industrial numerals and a crossbar.
            // 宽幅喷漆模板，带切角边框、工业数字和横杆。
            const frame = Math.max(corner(u, v, 0.12, 0.12), corner(1 - u, v, 0.12, 0.12),
                corner(u, 1 - v, 0.12, 0.12), corner(1 - u, 1 - v, 0.12, 0.12));
            const zero = digit(u, v, 0.235, 0.25, 0);
            const seven = digit(u, v, 0.53, 0.25, 7);
            const smallBars = rect(u, v, 0.24, 0.76, 0.09, 0.025)
                + rect(u, v, 0.36, 0.76, 0.18, 0.025) + rect(u, v, 0.57, 0.76, 0.19, 0.025);
            const ink = Math.min(1, frame + zero + seven + smallBars);
            const erode = wear(u, v, x, y, 101);
            const alpha = ink * erode;
            const variation = 0.88 + 0.12 * noise(u, v, 40, 105);
            return [239 * variation, 232 * variation, 205 * variation, alpha * 255,
                alpha * (0.11 + noise(u, v, 22, 106) * 0.05), 0, 244, 74 + noise(u, v, 14, 107) * 28];
        }, 1.9);
    }

    static hazard(size = 512): DecalShowcaseTextureSet {
        return this.build(size, false, (u, v, x, y) => {
            const edge = Math.min(u - 0.07, 0.93 - u, v - 0.15, 0.85 - v);
            const roughEdge = (noise(u, v, 30, 131) - 0.5) * 0.022;
            const coverage = smoothstep(0, 0.009, edge + roughEdge);
            // The long, shallow projector is roughly 11.7:1 in world space.
            // Matching phase derivatives preserves a clear diagonal on the strip.
            // 细长投射器在世界空间中的长宽比约为 11.7:1；
            // 匹配相位导数可让条带上的斜纹保持清晰。
            const stripe = fract(u * 14 + v * 1.2) < 0.53;
            const variation = 0.8 + 0.2 * noise(u, v, 34, 132);
            const alpha = coverage * wear(u, v, x, y, 133);
            const c = stripe ? [233, 178, 49] : [24, 29, 29];
            return [c[0] * variation, c[1] * variation, c[2] * variation, alpha * 255,
                alpha * 0.12, 0, 240, 86 + noise(u, v, 18, 134) * 25];
        }, 2.1);
    }

    static oil(size = 512): DecalShowcaseTextureSet {
        return this.build(size, false, (u, v) => {
            const px = (u - 0.5) * 2, py = (v - 0.5) * 2;
            const angle = Math.atan2(py, px);
            const radius = Math.sqrt(px * px + py * py);
            const boundary = 0.59 + Math.sin(angle * 3 + 1) * 0.1 + Math.sin(angle * 7) * 0.045
                + (noise(u, v, 12, 151) - 0.5) * 0.12;
            const alpha = smoothstep(boundary + 0.035, boundary - 0.04, radius) * 0.84;
            const iridescence = noise(u, v, 8, 152);
            return [30 + iridescence * 10, 35 + iridescence * 12, 35 + iridescence * 14, alpha * 255,
                noise(u, v, 28, 153) * 0.015, 34, 248, 240];
        }, 0.9);
    }

    /** Every returned texture is owned by the caller and should be destroyed with the scene.
     * 返回的纹理由调用方持有，应随场景一起销毁。 */
    private static build(size: number, repeat: boolean, surface: Surface, normalStrength: number): DecalShowcaseTextureSet {
        const color = new Uint8Array(size * size * 4);
        const normal = new Uint8Array(size * size * 4);
        const maos = new Uint8Array(size * size * 4);
        const height = new Float32Array(size * size);
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
            const index = y * size + x, p = index * 4;
            const value = surface((x + 0.5) / size, (y + 0.5) / size, x, y);
            color[p] = value[0]; color[p + 1] = value[1]; color[p + 2] = value[2]; color[p + 3] = value[3];
            height[index] = value[4];
            maos[p] = value[5]; maos[p + 1] = value[6]; maos[p + 2] = 0; maos[p + 3] = value[7];
        }
        const sample = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
            const p = (y * size + x) * 4;
            const nx = (sample(x - 1, y) - sample(x + 1, y)) * normalStrength;
            const ny = (sample(x, y - 1) - sample(x, y + 1)) * normalStrength;
            const length = Math.sqrt(nx * nx + ny * ny + 1);
            normal[p] = (nx / length * 0.5 + 0.5) * 255;
            normal[p + 1] = (ny / length * 0.5 + 0.5) * 255;
            normal[p + 2] = (1 / length * 0.5 + 0.5) * 255;
            normal[p + 3] = 255;
        }
        const make = (pixels: Uint8Array, srgb: boolean) => {
            const texture = new Texture2D(size, size, TextureFormat.R8G8B8A8, true, false, srgb);
            texture.setPixelsData(pixels, false, false);
            texture.filterMode = FilterMode.Trilinear;
            texture.wrapModeU = texture.wrapModeV = repeat ? WrapMode.Repeat : WrapMode.Clamp;
            texture.anisoLevel = 4;
            return texture;
        };
        return { albedo: make(color, true), normal: make(normal, false), maos: make(maos, false) };
    }
}

function hash(x: number, y: number, seed: number): number {
    let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
    n = Math.imul(n ^ n >>> 13, 1274126177);
    return ((n ^ n >>> 16) >>> 0) / 4294967295;
}
function noise(u: number, v: number, frequency: number, seed: number): number {
    const px = u * frequency, py = v * frequency, x = Math.floor(px), y = Math.floor(py);
    const a = fract(px), b = fract(py), sx = a * a * (3 - 2 * a), sy = b * b * (3 - 2 * b);
    const h = (dx: number, dy: number) => hash((x + dx) % frequency, (y + dy) % frequency, seed);
    return lerp(lerp(h(0, 0), h(1, 0), sx), lerp(h(0, 1), h(1, 1), sx), sy);
}
function wear(u: number, v: number, x: number, y: number, seed: number): number {
    const chips = smoothstep(0.17, 0.30, noise(u, v, 53, seed));
    const scratches = noise(u, v, 13, seed + 1) > 0.78 && hash(x >> 1, y >> 5, seed + 2) > 0.4 ? 0.15 : 1;
    return chips * scratches * (hash(x, y, seed + 3) < 0.012 ? 0.1 : 1);
}
function rect(u: number, v: number, x: number, y: number, w: number, h: number): number {
    return smoothstep(0, 0.002, Math.min(u - x, x + w - u, v - y, y + h - v));
}
function corner(u: number, v: number, x: number, y: number): number {
    return Math.min(1, rect(u, v, x, y, 0.15, 0.023) + rect(u, v, x, y, 0.023, 0.15));
}
function digit(u: number, v: number, x: number, y: number, number: number): number {
    const width = 0.22, height = 0.42, stroke = 0.058;
    let shape = number === 0
        ? Math.min(1, rect(u, v, x, y, width, stroke) + rect(u, v, x, y + height - stroke, width, stroke)
            + rect(u, v, x, y, stroke, height) + rect(u, v, x + width - stroke, y, stroke, height))
        : Math.min(1, rect(u, v, x, y, width, stroke) + rect(u, v, x + width - stroke, y, stroke, height));
    // Narrow cuts are the bridges left by a real reusable paint stencil.
    // 窄切口模拟真实可复用喷漆模板中保留的连接桥。
    const bridge = Math.abs(v - (y + height * 0.48)) < 0.007;
    if (bridge) shape = 0;
    return shape;
}
function smoothstep(a: number, b: number, value: number): number {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
}
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function fract(value: number): number { return value - Math.floor(value); }
