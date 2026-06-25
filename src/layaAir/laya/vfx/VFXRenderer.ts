import { Loader } from "../net/Loader";
import { VFXGeometry } from "./VFXGeometry";
import { VFXStripGeometry } from "./VFXStripGeometry";
import { VisualEffect } from "./VisualEffect";
import { ReflectionProbe } from "../d3/component/Volume/reflectionProbe/ReflectionProbe";
import { GeometryElement } from "../d3/core/GeometryElement";
import { UnlitMaterial } from "../d3/core/material/UnlitMaterial";
import { MeshFilter } from "../d3/core/MeshFilter";
import { BaseRender } from "../d3/core/render/BaseRender";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { RenderElement } from "../d3/core/render/RenderElement";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Bounds } from "../d3/math/Bounds";
import { Laya3DRender } from "../d3/RenderObjs/Laya3DRender";
import { Mesh } from "../d3/resource/models/Mesh";
import { MeshUtil } from "../d3/resource/models/MeshUtil";
import { LayaGL } from "../layagl/LayaGL";
import { Color } from "../maths/Color";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { IRenderContext3D } from "../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BaseRenderType, IBaseRenderNode } from "../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { RenderState } from "../RenderDriver/RenderModuleData/Design/RenderState";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../RenderEngine/RenderEnum/RenderCapable";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../resource/BaseTexture";
import { Material, MaterialRenderMode } from "../resource/Material";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { Stat } from "../utils/Stat";
import { Laya } from "../../Laya";

export class VFXRenderer extends BaseRender {

    private static _stripMaterialCache: Map<string, Material> = new Map();
    private static _billboardMaterialCache: Map<string, Material> = new Map();
    private static _customShaderMaterialCache: Map<string, Material> = new Map();
    private static _defaultDotTexture: Texture2D | null = null;

    /**
     * 程序生成 DefaultDot 软圆纹理（对齐 Unity VFX Graph DefaultParticle.png）
     * 64×64 白色软圆，alpha 为距中心的平滑衰减
     */
    static getDefaultDotTexture(): Texture2D {
        if (VFXRenderer._defaultDotTexture) return VFXRenderer._defaultDotTexture;

        const size = 64;
        const data = new Uint8Array(size * size * 4);
        const c = (size - 1) * 0.5;
        const radius = c;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dx = (x - c) / radius;
                const dy = (y - c) / radius;
                const d = Math.sqrt(dx * dx + dy * dy);
                // smoothstep(1.0, 0.0, d) — 中心 1，边缘 0
                let t = 1.0 - d;
                if (t < 0) t = 0;
                if (t > 1) t = 1;
                const alpha = t * t * (3 - 2 * t); // smoothstep
                const idx = (y * size + x) * 4;
                data[idx] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
                data[idx + 3] = Math.round(alpha * 255);
            }
        }

        const tex = new Texture2D(size, size, TextureFormat.R8G8B8A8, false, false, false, false);
        tex.setPixelsData(data, false, false);
        tex.wrapModeU = WrapMode.Clamp;
        tex.wrapModeV = WrapMode.Clamp;
        tex.filterMode = FilterMode.Bilinear;
        VFXRenderer._defaultDotTexture = tex;
        return tex;
    }

    /**
     * 按 blendMode 获取/创建 Billboard 默认材质（带 DefaultDot 纹理）
     * 用户未配置 sharedMaterials[0] 时使用
     */
    static getBillboardMaterial(blendMode: string = "Alpha"): Material {
        let mat = VFXRenderer._billboardMaterialCache.get(blendMode);
        if (!mat) {
            mat = new Material();
            mat.setShaderName("VFXUnlit");
            mat.setColor("u_Color", new Color(1, 1, 1, 1));
            mat.setTexture("u_AlbedoTexture", VFXRenderer.getDefaultDotTexture());
            mat.renderQueue = 3000;
            mat.cull = RenderState.CULL_NONE;
            applyBlendMode(mat, blendMode);
            VFXRenderer._billboardMaterialCache.set(blendMode, mat);
        }
        return mat;
    }

    /**
     * Billboard procedural material 缓存（key = primitive|blendMode）
     * 每个 primitive × blendMode 组合独立一份 material（因为 shader define 不同）
     */
    private static _billboardProceduralCache: Map<string, Material> = new Map();

    /** mesh 已经跑过 vertex color smooth 的标记 (key = mesh._id), 避免重复跑 */
    private static _smoothedMeshIds: Set<number> = new Set();
    private static _smoothedNormalMeshIds: Set<number> = new Set();

    /**
     * 给 mesh 跑 smooth normal: Unity .fbx import 默认 split vertex by hard edge + smooth normal
     * 平均化, 让相邻 face 共享 normal → shading 平滑无 alternating. Laya .fbx import 没这步,
     * 让蓝图 PBR shader 算 SurfaceShading 时邻接 face normal 不一致 → fragment shading 跳变 →
     * 三角形 alternating striping (image 56 蜡池区现象). 这里 weld by position + 平均 normal 复用
     * vc smooth 的 cluster 基础设施.
     */
    static smoothMeshNormals(mesh: Mesh): void {
        if (!mesh) return;
        const meshId = (mesh as any)._id;
        if (VFXRenderer._smoothedNormalMeshIds.has(meshId)) return;
        VFXRenderer._smoothedNormalMeshIds.add(meshId);

        try {
            const positions: Vector3[] = [];
            const normals: Vector3[] = [];
            mesh.getPositions(positions);
            mesh.getNormals(normals);
            if (!positions.length || !normals.length) return;

            const vertCount = positions.length;
            const indices = mesh.getIndices();
            // weld by position (cluster level)
            const posKey = (p: any) => `${Math.round(p.x * 1000)},${Math.round(p.y * 1000)},${Math.round(p.z * 1000)}`;
            const keyToCluster = new Map<string, number>();
            const vertToCluster = new Int32Array(vertCount);
            let clusterCount = 0;
            for (let i = 0; i < vertCount; i++) {
                const k = posKey(positions[i]);
                let cid = keyToCluster.get(k);
                if (cid === undefined) { cid = clusterCount++; keyToCluster.set(k, cid); }
                vertToCluster[i] = cid;
            }
            // 每个 cluster 累加 normal
            const cNx = new Float32Array(clusterCount);
            const cNy = new Float32Array(clusterCount);
            const cNz = new Float32Array(clusterCount);
            for (let i = 0; i < vertCount; i++) {
                const cid = vertToCluster[i];
                cNx[cid] += normals[i].x;
                cNy[cid] += normals[i].y;
                cNz[cid] += normals[i].z;
            }
            // normalize per cluster
            for (let c = 0; c < clusterCount; c++) {
                const len = Math.hypot(cNx[c], cNy[c], cNz[c]);
                if (len > 1e-6) {
                    cNx[c] /= len; cNy[c] /= len; cNz[c] /= len;
                } else {
                    cNy[c] = 1; // fallback up
                }
            }
            // build cluster adjacency 跨 cluster Laplacian smooth normal
            const adj: Set<number>[] = new Array(clusterCount);
            for (let i = 0; i < clusterCount; i++) adj[i] = new Set();
            const triCount = indices.length / 3;
            for (let t = 0; t < triCount; t++) {
                const c0 = vertToCluster[indices[t * 3]];
                const c1 = vertToCluster[indices[t * 3 + 1]];
                const c2 = vertToCluster[indices[t * 3 + 2]];
                if (c0 !== c1) { adj[c0].add(c1); adj[c1].add(c0); }
                if (c0 !== c2) { adj[c0].add(c2); adj[c2].add(c0); }
                if (c1 !== c2) { adj[c1].add(c2); adj[c2].add(c1); }
            }
            // Laplacian smooth normal cross cluster (5 iter, factor 0.6)
            const factor = 0.6;
            for (let iter = 0; iter < 5; iter++) {
                const nx = new Float32Array(clusterCount);
                const ny = new Float32Array(clusterCount);
                const nz = new Float32Array(clusterCount);
                for (let c = 0; c < clusterCount; c++) {
                    const nb = adj[c];
                    if (nb.size === 0) {
                        nx[c] = cNx[c]; ny[c] = cNy[c]; nz[c] = cNz[c]; continue;
                    }
                    let sx = 0, sy = 0, sz = 0;
                    nb.forEach(n => { sx += cNx[n]; sy += cNy[n]; sz += cNz[n]; });
                    const inv = 1 / nb.size;
                    nx[c] = cNx[c] * (1 - factor) + sx * inv * factor;
                    ny[c] = cNy[c] * (1 - factor) + sy * inv * factor;
                    nz[c] = cNz[c] * (1 - factor) + sz * inv * factor;
                }
                // normalize
                for (let c = 0; c < clusterCount; c++) {
                    const len = Math.hypot(nx[c], ny[c], nz[c]);
                    if (len > 1e-6) { nx[c] /= len; ny[c] /= len; nz[c] /= len; } else { ny[c] = 1; }
                }
                cNx.set(nx); cNy.set(ny); cNz.set(nz);
            }
            // 写回每个 vertex 的 normal = 它所属 cluster 的 smoothed normal
            for (let i = 0; i < vertCount; i++) {
                const cid = vertToCluster[i];
                normals[i].x = cNx[cid];
                normals[i].y = cNy[cid];
                normals[i].z = cNz[cid];
            }
            mesh.setNormals(normals);
        } catch (err) {
            console.warn("[VFXRenderer] smoothMeshNormals failed:", err);
        }
    }

    /**
     * 给 mesh 跑 Laplacian vertex color smooth: 蓝图 ShaderGraph 用 mesh 顶点色驱动多区域选色
     * (e.g. SG_Candle 用 vc.g 分饰圈/蜡池/dripping), per-vertex 颜色直接 dump 显示三角形渐变.
     * Unity 端因为有 bloom + AA + tonemap 视觉融合, Laya 简单 lighting 直接暴露相邻三角形色差.
     * 这里对相邻 vertex (共三角形) 颜色做加权平均, 减少 striping 同时保留大尺度 region 差异.
     * 只 smooth r/g/a 通道 (b 通道在 vertex shader vfxTransformVertex 阶段 override 给 per-particle).
     */
    static smoothMeshVertexColors(mesh: Mesh, iterations: number = 2, factor: number = 0.35): void {
        if (!mesh) return;
        const meshId = (mesh as any)._id;
        if (VFXRenderer._smoothedMeshIds.has(meshId)) return;
        VFXRenderer._smoothedMeshIds.add(meshId);

        try {
            const indices = mesh.getIndices();
            if (!indices) return;
            const colors: Color[] = [];
            mesh.getColors(colors);
            if (!colors.length) return;
            // Laya Mesh.getColors 先扩 length=vertexCount 再 if(element) 填，mesh 缺 color
            // 顶点元素时 colors.length>0 但 colors[i] 全 undefined，直接 .r 访问会崩。
            // 检查首个元素确认真有 color 数据；UNI VFX 的 mesh 多数没 vertex color
            if (colors[0] == null) return;

            // mesh 的 vertex 通常 split for UV/normal seams: 同物理位置不同 index 不互连
            // 直接 indices 算 adj 在 per-triangle independent vertices mesh 上 smooth 永不 propagate.
            // 先 weld by position → 同 position 的 vertices 归一个 cluster, 用 clusterID 重建 adj.
            const vertCount = colors.length;
            const positions: Vector3[] = [];
            mesh.getPositions(positions);
            // build position→clusterID map (quantize position 到 mm 精度避免浮点 drift)
            const posKey = (p: any) => `${Math.round(p.x * 1000)},${Math.round(p.y * 1000)},${Math.round(p.z * 1000)}`;
            const keyToCluster = new Map<string, number>();
            const vertToCluster = new Int32Array(vertCount);
            let clusterCount = 0;
            for (let i = 0; i < vertCount; i++) {
                const k = posKey(positions[i]);
                let cid = keyToCluster.get(k);
                if (cid === undefined) {
                    cid = clusterCount++;
                    keyToCluster.set(k, cid);
                }
                vertToCluster[i] = cid;
            }
            // build cluster adjacency: cluster 邻居 = 通过 indices 三角形连接的其它 cluster
            const adj: Set<number>[] = new Array(clusterCount);
            for (let i = 0; i < clusterCount; i++) adj[i] = new Set();
            const triCount = indices.length / 3;
            for (let t = 0; t < triCount; t++) {
                const c0 = vertToCluster[indices[t * 3]];
                const c1 = vertToCluster[indices[t * 3 + 1]];
                const c2 = vertToCluster[indices[t * 3 + 2]];
                if (c0 !== c1) { adj[c0].add(c1); adj[c1].add(c0); }
                if (c0 !== c2) { adj[c0].add(c2); adj[c2].add(c0); }
                if (c1 !== c2) { adj[c1].add(c2); adj[c2].add(c1); }
            }

            // cluster-level color: 每个 cluster 取所有 vertex color 平均作为初始
            const cR = new Float32Array(clusterCount);
            const cG = new Float32Array(clusterCount);
            const cA = new Float32Array(clusterCount);
            const cCount = new Float32Array(clusterCount);
            for (let i = 0; i < vertCount; i++) {
                const cid = vertToCluster[i];
                cR[cid] += colors[i].r;
                cG[cid] += colors[i].g;
                cA[cid] += colors[i].a;
                cCount[cid]++;
            }
            for (let c = 0; c < clusterCount; c++) {
                const inv = cCount[c] > 0 ? 1 / cCount[c] : 0;
                cR[c] *= inv; cG[c] *= inv; cA[c] *= inv;
            }
            // N iterations Laplacian smooth on cluster level
            for (let iter = 0; iter < iterations; iter++) {
                const nR = new Float32Array(clusterCount);
                const nG = new Float32Array(clusterCount);
                const nA = new Float32Array(clusterCount);
                for (let c = 0; c < clusterCount; c++) {
                    const nb = adj[c];
                    if (nb.size === 0) {
                        nR[c] = cR[c]; nG[c] = cG[c]; nA[c] = cA[c];
                        continue;
                    }
                    let sR = 0, sG = 0, sA = 0;
                    nb.forEach(n => { sR += cR[n]; sG += cG[n]; sA += cA[n]; });
                    const inv = 1 / nb.size;
                    nR[c] = cR[c] * (1 - factor) + sR * inv * factor;
                    nG[c] = cG[c] * (1 - factor) + sG * inv * factor;
                    nA[c] = cA[c] * (1 - factor) + sA * inv * factor;
                }
                cR.set(nR); cG.set(nG); cA.set(nA);
            }
            // 写回每个 vertex: 用所属 cluster 的 smoothed color (b 通道保留)
            for (let i = 0; i < vertCount; i++) {
                const cid = vertToCluster[i];
                colors[i].r = cR[cid];
                colors[i].g = cG[cid];
                colors[i].a = cA[cid];
            }
            mesh.setColors(colors);
        } catch (err) {
            console.warn("[VFXRenderer] smoothMeshVertexColors failed:", err);
        }
    }

    /** 共享 atlas texture 本地 cache（res:// uuid → BaseTexture），避免 Laya.loader 异步竞争 */
    private static _atlasTextureCache: Map<string, BaseTexture> = new Map();
    // 已尝试加载并失败的纹理 url；避免 missing 资源每帧重试导致 1000+ 行 "Failed to load" 日志刷屏
    private static _failedTextureUrls: Set<string> = new Set();

    private static _tryLoadTextureOnce(url: string, onLoaded: (tex: BaseTexture) => void): void {
        if (!url || VFXRenderer._failedTextureUrls.has(url)) return;
        const cached = VFXRenderer._atlasTextureCache.get(url);
        if (cached) { onLoaded(cached); return; }
        Laya.loader.load(url).then(async (tex: BaseTexture) => {
            if (tex) {
                // PNG RGB-only atlas (e.g. TX_Flipbook_example.png 白数字 + 橙/cyan 方块底,
                // colorType=2 无 alpha channel) 走 alpha blend 时方块底色全显示. Unity 端默认 Particles
                // shader Color Mapping Default = color * tex, PNG no alpha → tex.a=1 → Unity 端实际行为不明,
                // 但 visually 蜡烛场景方块透明跟数字白显示. 这里跑 saturation 检测把彩色像素 alpha 设 0,
                // 灰度像素保留 luminance, 让 atlas 视觉对齐 Unity (背景透明). 检测条件:
                // 所有 pixel alpha 都是 255 (PNG 无 alpha 让 IDE import 自动填 1) 才跑.
                await VFXRenderer._patchTextureAlphaFromLuminance(tex, url);
                VFXRenderer._atlasTextureCache.set(url, tex);
                onLoaded(tex);
            } else {
                VFXRenderer._failedTextureUrls.add(url);
                console.warn(`[VFX Renderer] texture load returned null (will not retry): ${url}`);
            }
        }, (err: any) => {
            VFXRenderer._failedTextureUrls.add(url);
            console.warn(`[VFX Renderer] texture load failed (will not retry): ${url}`, err);
        });
    }

    /** mark mesh / texture 已 patch 避免重复跑 */
    private static _patchedTextureUrls: Set<string> = new Set();

    private static async _patchTextureAlphaFromLuminance(tex: BaseTexture, url: string): Promise<void> {
        if (VFXRenderer._patchedTextureUrls.has(url)) return;
        VFXRenderer._patchedTextureUrls.add(url);
        console.log("[VFX alpha] start url=", url);
        try {
            // ⚠不能用 loader.load(url, BUFFER)：同 url 已按 Texture 加载过时，资产缓存按 url 直接命中
            // 返回 Texture 对象（请求类型被忽略）→ "non-ArrayBuffer: object"，alpha 修补静默失效。
            // 改用 loader.fetch：内部走 AssetDb.resolveURL 解析 res://，纯下载字节不进资产缓存。
            const buffer = await (Laya.loader as any).fetch(url, "arraybuffer");
            if (!buffer || !(buffer instanceof ArrayBuffer)) {
                console.warn("[VFX alpha] fetch returned non-ArrayBuffer:", typeof buffer);
                return;
            }
            // 只处理 PNG (其它格式如 KTX/DDS 通常带正确 alpha)
            if (!url.toLowerCase().endsWith(".png")) {
                console.log("[VFX alpha] skip - not png");
                return;
            }
            const blob = new Blob([buffer], { type: "image/png" });
            const imgBitmap = await createImageBitmap(blob);
            const canvas = document.createElement("canvas");
            canvas.width = imgBitmap.width;
            canvas.height = imgBitmap.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(imgBitmap, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            // 检测: 所有 pixel alpha=255 → PNG 无 alpha channel (IDE 自动填 1)
            let allOpaque = true;
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] !== 255) { allOpaque = false; break; }
            }
            console.log("[VFX alpha] allOpaque=", allOpaque, "pixels.length=", pixels.length);
            if (!allOpaque) return; // 真有 alpha 通道不动
            // 区分两种 PNG atlas 类型:
            // (A) "火焰风格": 大量黑色背景 + 彩色渐变主体 (flame/smoke) → 用 luminance 当 alpha
            // (B) "数字风格": 满 atlas 彩色色块 + 灰度 mask (number/icon atlas) → 用 sat 检测让彩色透明
            let blackCount = 0;
            const pixelCount = pixels.length / 4;
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i] < 20 && pixels[i + 1] < 20 && pixels[i + 2] < 20) blackCount++;
            }
            const blackRatio = blackCount / pixelCount;
            const isFlameStyle = blackRatio > 0.15;
            console.log("[VFX alpha] blackRatio=", blackRatio.toFixed(3), "isFlameStyle=", isFlameStyle);
            let modified = false;
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
                const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                if (isFlameStyle) {
                    // 火焰/烟雾: 黑色背景 alpha=0, 彩色主体保留 luminance 当 alpha
                    pixels[i + 3] = Math.round(lum);
                    if (lum < 254) modified = true;
                } else {
                    // 数字/icon: 灰度 (sat 低) 保留, 彩色背景 alpha=0
                    const maxC = Math.max(r, g, b);
                    const minC = Math.min(r, g, b);
                    const sat = maxC - minC;
                    if (sat > 30) {
                        pixels[i + 3] = 0;
                        modified = true;
                    } else {
                        pixels[i + 3] = Math.round(lum);
                        if (lum < 254) modified = true;
                    }
                }
            }
            if (!modified) return;
            // Laya.loader.load 返回 Texture wrapper, 真 Texture2D 在 .bitmap 字段
            const t2d = ((tex as any).bitmap || tex) as Texture2D;
            if (t2d && (t2d as any).setPixelsData) {
                (t2d as any).setPixelsData(new Uint8Array(pixels.buffer), false, false);
                console.log("[VFX] alpha patched from luminance:", url, "size=", canvas.width, "x", canvas.height);
            } else {
                console.warn("[VFX alpha] no setPixelsData on bitmap, t2d=", t2d, "tex=", tex);
            }
        } catch (e) {
            console.warn("[VFX] alpha patch failed:", url, e);
        }
    }

    /**
     * 对齐 Unity VFXPlanarPrimitiveOutput：procedural billboard（用 gl_VertexID 生成顶点）
     * primitive: "Quad" / "Triangle" / "Octagon"
     * cropFactor: Octagon 专用裁角因子 [0, 0.5]
     * mainTextureUuid / uvMode / fbW / fbH 加入 cache key —— Multi-Output 同一 system 多 output ctx
     *   各自配 atlas + flipbook 时需要独立 material 实例，否则 cache 共享让最后一个 ctx 设置盖掉前面
     */
    private static _geoUidNext: number = 1;

    static getBillboardProceduralMaterial(
        primitive: string,
        blendMode: string = "Alpha",
        cropFactor: number = 0.146,
        mainTextureUuid: string = "",
        uvMode: string = "Default",
        fbW: number = 4,
        fbH: number = 4,
        geoUid: number = 0,
    ): Material | null {
        // geoUid 让 multi-output 同 system 多个 procedural billboard 各自独立 material instance,
        // 避免 RenderElement 合并 instanced draw 时丢失第二个 indirect（multi-output bug 根因）
        const key = `${primitive}__${blendMode}__${uvMode}__${fbW}x${fbH}__${mainTextureUuid}__u${geoUid}`;
        let mat = VFXRenderer._billboardProceduralCache.get(key);
        if (!mat) {
            // Shader 异步加载未完成时返回 null（和 getStripMaterial 一致），让下一帧重试
            if (!Shader3D.find("VFXBillboardProcedural")) {
                return null;
            }
            mat = new Material();
            mat.setShaderName("VFXBillboardProcedural");
            mat.setColor("u_Color", new Color(1, 1, 1, 1));
            mat.setTexture("u_AlbedoTexture", VFXRenderer.getDefaultDotTexture());
            mat.renderQueue = 3000;
            mat.cull = RenderState.CULL_NONE;
            applyBlendMode(mat, blendMode);
            // 每种 primitive 用 shader define 选择顶点生成路径
            // 先全部关闭再开启对应的
            mat.removeDefine(Shader3D.getDefineByName("VFX_PRIMITIVE_QUAD"));
            mat.removeDefine(Shader3D.getDefineByName("VFX_PRIMITIVE_TRIANGLE"));
            mat.removeDefine(Shader3D.getDefineByName("VFX_PRIMITIVE_OCTAGON"));
            if (primitive === "Triangle") mat.addDefine(Shader3D.getDefineByName("VFX_PRIMITIVE_TRIANGLE"));
            else if (primitive === "Octagon") mat.addDefine(Shader3D.getDefineByName("VFX_PRIMITIVE_OCTAGON"));
            else mat.addDefine(Shader3D.getDefineByName("VFX_PRIMITIVE_QUAD"));
            VFXRenderer._billboardProceduralCache.set(key, mat);
        }
        // cropFactor 每帧可更新（即使 cache 命中也设一次，支持动态调整）
        mat.setFloat("u_CropFactor", cropFactor);
        return mat;
    }

    /** Distortion procedural material 缓存（Unity VFXDistortion 对齐） */
    private static _distortionMaterialCache: Map<string, Material> = new Map();

    /**
     * 对齐 Unity VFXDistortion：采样 u_CameraOpaqueTexture 做 UV 偏移
     * mode: "Procedural"（径向透镜）/ "NormalMap"（用 u_AlbedoTexture 的 RG 当法线）
     * distortionStrength: UV 偏移乘法因子 [0, 1]
     * Camera 必须启用 opaqueTexture 才能看到效果
     */
    static getDistortionMaterial(mode: string, blendMode: string, distortionStrength: number): Material | null {
        const key = `${mode}__${blendMode}`;
        let mat = VFXRenderer._distortionMaterialCache.get(key);
        if (!mat) {
            if (!Shader3D.find("VFXDistortionQuad")) {
                return null;
            }
            mat = new Material();
            mat.setShaderName("VFXDistortionQuad");
            mat.setColor("u_Color", new Color(1, 1, 1, 1));
            mat.setTexture("u_AlbedoTexture", VFXRenderer.getDefaultDotTexture());
            mat.renderQueue = 3000;
            mat.cull = RenderState.CULL_NONE;
            applyBlendMode(mat, blendMode);
            if (mode === "NormalMap") {
                mat.addDefine(Shader3D.getDefineByName("USE_NORMAL_MAP"));
            }
            VFXRenderer._distortionMaterialCache.set(key, mat);
        }
        // distortionStrength 每帧可更新
        mat.setFloat("u_DistortionStrength", distortionStrength);
        return mat;
    }

    /** Cube procedural material 缓存（Unity VFXBasicCubeOutput 对齐） */
    private static _cubeProceduralCache: Map<string, Material> = new Map();

    /**
     * 对齐 Unity VFXBasicCubeOutput：3D cube 粒子（6 面，带简易 Lambert 光照）
     */
    static getCubeProceduralMaterial(blendMode: string = "Alpha"): Material | null {
        let mat = VFXRenderer._cubeProceduralCache.get(blendMode);
        if (!mat) {
            if (!Shader3D.find("VFXCubeProcedural")) {
                return null;
            }
            mat = new Material();
            mat.setShaderName("VFXCubeProcedural");
            mat.setColor("u_Color", new Color(1, 1, 1, 1));
            mat.setTexture("u_AlbedoTexture", VFXRenderer.getDefaultDotTexture());
            mat.renderQueue = 3000;
            // Cube 是 3D 实体，启用背面剔除（back face culling）以避免看到内部
            mat.cull = RenderState.CULL_BACK;
            applyBlendMode(mat, blendMode);
            VFXRenderer._cubeProceduralCache.set(blendMode, mat);
        }
        return mat;
    }

    private static _pendingCustomShaderLoads: Set<string> = new Set();

    /**
     * 按 shaderName + blendMode 获取/创建自定义 shader 材质
     * 用于 outputShaderGraphQuad / outputShaderGraphMesh 等用户指定 shader 的 output context
     *
     * Shader 未注册时（例如 .bps 还没被 loader 加载）通过 AssetDb shaderNameMap
     * 反查到 res:// url 异步加载（每次只 kick off 一次），返回 VFXUnlit fallback；
     * .bps 加载完成后下一次 getCustomShaderMaterial 调用会命中已注册 shader。
     */
    /** mesh 顶点能力 → 材质 define 同步（COLOR=slot1 / UV=slot2 / TANGENT=slot4）。
     *  WebGPU 要求 shader 引用的顶点槽必须出现在 VertexState；mesh 缺元素时必须关掉对应 define。 */
    static _syncMeshAttrDefines(mat: Material, geometry: any): void {
        try {
            const mesh = geometry && (geometry._mesh || geometry.mesh);
            if (!mesh || !mat) return;
            const vb = mesh.vertexBuffer || mesh._vertexBuffer;
            const decl = vb && vb.vertexDeclaration;
            const elems = decl && (decl._vertexElements || decl.vertexElements);
            if (!elems || !elems.length) return;
            const usages = new Set<number>();
            for (const e of elems) usages.add(e.elementUsage !== undefined ? e.elementUsage : e._elementUsage);
            // 官方 mesh define 集合（MeshUtil.getMeshDefine 与 MeshRenderer 同源），加上手动 usage 双保险
            let meshDefs: any[] | null = null;
            try {
                meshDefs = [];
                MeshUtil.getMeshDefine(mesh, meshDefs as any);
            } catch (e) { meshDefs = null; }
            const sync = (defName: string, usage: number) => {
                const def = Shader3D.getDefineByName(defName);
                if (!def) return;
                const has = meshDefs ? meshDefs.indexOf(def) >= 0 : usages.has(usage);
                if (has || usages.has(usage)) mat.addDefine(def);
                else mat.removeDefine(def);
            };
            sync("COLOR", 1);
            sync("UV", 2);
            sync("UV1", 7);
            sync("TANGENT", 4);
        } catch (e) { }
    }

    static getCustomShaderMaterial(shaderName: string, blendMode: string = "Alpha", variant: "instanced" | "strip" = "instanced"): Material {
        const key = `${shaderName}__${blendMode}__${variant}`;
        let mat = VFXRenderer._customShaderMaterialCache.get(key);
        if (mat) return mat;

        const shader = Shader3D.find(shaderName);
        if (!shader) {
            // VFXUnlit / VFXBillboardProcedural 等内置 shader 走 runtime 注册，不应进入此分支；
            // 若未注册则直接抛错（避免 fallback 无限递归）
            if (shaderName === "VFXUnlit") {
                console.error("[VFX Renderer] built-in 'VFXUnlit' shader not registered");
                return null as any;
            }
            if (!VFXRenderer._pendingCustomShaderLoads.has(shaderName)) {
                VFXRenderer._pendingCustomShaderLoads.add(shaderName);
                const url = (Laya as any).AssetDb?.inst?.shaderName_to_URL?.(shaderName);
                const loadPromise = url
                    ? Laya.loader.load(url)
                    : (Laya as any).AssetDb?.inst?.shaderName_to_URL_async?.(shaderName)
                        .then((u: string) => u ? Laya.loader.load(u) : null);
                Promise.resolve(loadPromise)
                    .then(() => console.log(`[VFX Renderer] custom shader '${shaderName}' loaded (url=${url})`))
                    .catch((err: any) => console.warn(`[VFX Renderer] custom shader '${shaderName}' load failed`, err));
            }
            // Shader 还没注册：返回 VFXUnlit fallback，不缓存（让下一帧重试）
            return VFXRenderer.getCustomShaderMaterial("VFXUnlit", blendMode, variant);
        }

        mat = new Material();
        mat.setShaderName(shaderName);
        // 蓝图 shader 启 supportVFX 后用 VFX_INSTANCED define 选 vfxTransformVertex 分支
        // (普通 mesh 用 shader 时此 define 关，VS 走原始 path)。
        // ⚠ strip 变体绝不能加 VFX_INSTANCED：strip 几何是普通顶点流(a_Position/a_Color/a_Texcoord0/a_Normal)
        //   没有实例属性 a_AttrScale/a_AttrColor 等 → p.scale 读 0 → 顶点全缩到 pivot 退化不可见且零报错
        //   (Buff VFX4 UNI-Masked 丝带不显示根因)。strip 的粒子色走标准 a_Color → vertex.vertexColor 通道。
        if (variant !== "strip") {
            const vfxDef = Shader3D.getDefineByName("VFX_INSTANCED");
            if (vfxDef) mat.addDefine(vfxDef);
        } else {
            // strip 顶点流自带 a_Texcoord0，但 UV define 通常由 Mesh 顶点声明自动推导——strip 几何
            // 不是 Mesh 不走那条路，必须显式开，否则 Vertex 结构无 texCoord0 字段（SG 纹理采样退化到 (0,0) 单点）
            const uvDef = Shader3D.getDefineByName("UV");
            if (uvDef) mat.addDefine(uvDef);
        }
        // 同步强制开 COLOR define：让蓝图 #ifdef COLOR 路径启用，FS 端 pixel.vertexColor
        // 能拿到 vfxTransformVertex 写入的 p.color (instance a_AttrColor)。
        // 不强制的话 Laya 按 mesh 是否有顶点色决定 COLOR，让粒子色全链路断 → 蓝图算
        // baseColor 退到默认 (1,1,1,1) 让 PBR 高 metallic/smoothness 走纯黑。
        const colorDef = Shader3D.getDefineByName("COLOR");
        if (colorDef) mat.addDefine(colorDef);
        // EMISSION 宏: 蓝图 Lit shader(SurfaceShading→pbrFrag)里 `color += surface.emissionColor`
        // 被 `#ifdef EMISSION` 门控。.bps material 没 emission 开关 → 宏不设 → 自定义 shader
        // 算好的 emissionColor(materialize 溶解边缘 HDR 辉光/白块、emissionMap)被整段跳过。
        // Unlit 路径无此分支不受影响; Lit 无 emission 时 emissionColor 默认 0 加 0 无害。
        // 修 Energy DM materialize 白块/辉光缺失根因。
        const emissionDef = Shader3D.getDefineByName("EMISSION");
        if (emissionDef) mat.addDefine(emissionDef);
        mat.setColor("u_Color", new Color(1, 1, 1, 1));
        mat.setTexture("u_AlbedoTexture", VFXRenderer.getDefaultDotTexture());
        mat.renderQueue = 3000;
        mat.cull = RenderState.CULL_NONE;
        applyBlendMode(mat, blendMode);
        VFXRenderer._customShaderMaterialCache.set(key, mat);
        return mat;
    }

    /**
     * 按 blendMode 获取/创建 strip 材质（缓存共享）
     * blendMode: "Alpha" | "Additive" | "Premultiplied" | "Opaque"
     *
     * 使用 VFXUnlit shader（支持 a_AttrPosition 等 VFX 实例属性），
     * 不能用 UnlitMaterial（engine 的标准 Unlit shader 不认识 VFX 属性）
     */
    static getStripMaterial(blendMode: string = "Alpha", mainTextureUuid: string = "",
        colorMapping: string = "Default",
        uvScale?: { x: number, y: number }, uvBias?: { x: number, y: number },
        gradientStops?: { t: number, color: [number, number, number, number] }[],
        tilingMode: string = "Stretch",
        tilingSegments: number = 1): Material {
        // cache key 包含 mainTexture / colorMapping / uv / gradient / tiling，让不同配置 strip 不冲突
        const gradHash = (gradientStops && gradientStops.length > 0)
            ? gradientStops.map(s => `${s.t.toFixed(3)}:${s.color.map(c => c.toFixed(2)).join(",")}`).join("|")
            : "";
        const usHash = uvScale ? `${uvScale.x},${uvScale.y}` : "1,1";
        const ubHash = uvBias ? `${uvBias.x},${uvBias.y}` : "0,0";
        const tilingHash = `${tilingMode}__${tilingSegments}`;
        const key = `${blendMode}__${mainTextureUuid}__${colorMapping}__${usHash}__${ubHash}__${gradHash}__${tilingHash}`;
        let mat = VFXRenderer._stripMaterialCache.get(key);
        if (mat) return mat;
        if (!Shader3D.find("VFXStrip")) {
            return null; // shader 尚未加载，下帧重试
        }
        mat = new Material();
        mat.setShaderName("VFXStrip");
        mat.setColor("u_Color", new Color(1, 1, 1, 1));
        if (Texture2D.whiteTexture) {
            mat.setTexture("u_AlbedoTexture", Texture2D.whiteTexture);
        }
        // ColorMapping = GradientMapped: bake gradient stops 成 256×1 RGBA 纹理
        const useGradient = colorMapping === "GradientMapped" && gradientStops && gradientStops.length > 0;
        const gradDef = Shader3D.getDefineByName("VFX_STRIP_GRADIENT_MAPPED");
        const sbDef = Shader3D.getDefineByName("VFX_STRIP_UV_SCALE_BIAS");
        console.log(`[VFX Strip Mat] colorMapping=${colorMapping}, useGradient=${useGradient}, gradDef=${!!gradDef}, sbDef=${!!sbDef}, stops=${gradientStops?.length ?? 0}`);
        if (useGradient) {
            if (gradDef) mat.addDefine(gradDef);
            const gradTex = bakeGradientTexture256(gradientStops!);
            mat.setTexture("u_VfxStripGradient", gradTex);
            console.log(`[VFX Strip Mat] gradient texture baked, hasDefine=${gradDef ? mat.hasDefine(gradDef) : "noDef"}`);
        }
        // UV Mode = ScaleAndBias: 设 scale/bias uniform + 启用 define
        const useScaleBias = (uvScale && (uvScale.x !== 1 || uvScale.y !== 1)) || (uvBias && (uvBias.x !== 0 || uvBias.y !== 0));
        if (useScaleBias) {
            if (sbDef) mat.addDefine(sbDef);
            mat.setVector2("u_VfxUVScale", new Vector2(uvScale?.x ?? 1, uvScale?.y ?? 1));
            mat.setVector2("u_VfxUVBias", new Vector2(uvBias?.x ?? 0, uvBias?.y ?? 0));
        }
        // tilingMode=RepeatPerSegment: 让 texture 沿 strip 在每个 segment 内 tile 一次 (ppsc-1 个 segments)
        // Stretch: 整 texture 拉伸覆盖整 strip (default, 不 tile)
        const repeatDef = Shader3D.getDefineByName("VFX_STRIP_REPEAT_PER_SEGMENT");
        if (repeatDef) {
            if (tilingMode === "RepeatPerSegment") mat.addDefine(repeatDef);
            else mat.removeDefine(repeatDef);
        }
        mat.setFloat("u_VfxStripTilingSegments", Math.max(tilingSegments, 1));
        mat.renderQueue = 3000;
        mat.cull = RenderState.CULL_NONE;
        applyBlendMode(mat, blendMode);
        VFXRenderer._stripMaterialCache.set(key, mat);
        if (mainTextureUuid) {
            VFXRenderer._tryLoadTextureOnce(mainTextureUuid, tex => {
                if (mat) mat.setTexture("u_AlbedoTexture", tex);
            });
        }
        return mat;
    }

    private _geometries: GeometryElement[] = [];

    addGeometry(geometry: GeometryElement): void {
        this._geometries.push(geometry);
        this._rebuildRenderElements();
    }

    removeGeometry(geometry: GeometryElement): void {
        const index = this._geometries.indexOf(geometry);
        if (index >= 0) {
            this._geometries.splice(index, 1);
            this._rebuildRenderElements();
        }
    }

    clearGeometries(): void {
        this._geometries.length = 0;
        this._rebuildRenderElements();
    }

    /** @internal */
    visualEffect: VisualEffect;

    constructor() {
        super();
        this._baseRenderNode.renderNodeType = BaseRenderType.ParticleRender;
        this._baseRenderNode.perCameraUpdate = true;
        this.geometryBounds = new Bounds(new Vector3(), new Vector3());
    }

    /**
     * VFXRenderer 用动态生成的 customShaderMaterial (不在 sharedMaterials),
     * BaseRender._isSupportRenderFeature 扫不到 _supportReflectionProbe flag,
     * 让 PBR 蓝图 shader 拿不到 reflection probe IBL uniform → 高 metallic mesh 全黑或毛糙不融合.
     * 这里手动 force enable + 强制 set probReflection = sceneReflectionProb 让 BaseRender setter 把
     * reflection probe shaderData 注册到 _baseRenderNode.additionShaderData["ReflectionProbe"],
     * 这样 render element dispatch 时引擎自动 bind 这个 global block 给 shader,
     * 蓝图 PBR shader 才能拿到 u_AmbientColor / u_IBLTex / u_IblSH 真值.
     */
    protected _onEnable(): void {
        super._onEnable();
        (this as any)._surportReflectionProbe = true;
        (this as any)._addReflectionProbeUpdate?.();
        // 直接 set probReflection 绕开 volumeManager 自动分配, 让 BaseRender setter 把 probe shaderData
        // 注册到 _baseRenderNode.additionShaderData["ReflectionProbe"], render dispatch 时引擎自动 bind.
        const scene = (this.owner as any)?.scene as Scene3D | undefined;
        const sceneProbe = scene && ((scene as any).sceneReflectionProb || (scene as any)._sceneReflectionProb);
        if (sceneProbe) {
            (this as any).probReflection = sceneProbe;
            // sceneReflectionProb.applyRenderData 走"非 SolidColor 也没 iblTex/SH"第 3 分支时既不 set
            // u_AmbientColor 也不 enable GI_IBL define → shader fallback diffuseIrradiance =
            // u_AmbientColor * u_AmbientIntensity = vec3(0) → 蜡烛全黑. 这里直接给 probe shaderData
            // 灌 scene.ambientColor 让 fallback 路径有 ambient 真值. 不动 scene 全局 ambient mode 避免
            // 影响普通 mesh.
            const ambient = (scene as any)?.ambientColor;
            const probeShaderData = sceneProbe.shaderData;
            if (ambient && probeShaderData) {
                const ambColorID = (ReflectionProbe as any).AMBIENTCOLOR;
                const ambIntensityID = (ReflectionProbe as any).AMBIENTINTENSITY;
                const refIntensityID = (ReflectionProbe as any).REFLECTIONINTENSITY;
                if (ambColorID != null) {
                    probeShaderData.setColor(ambColorID, new Color(ambient.r, ambient.g, ambient.b, 1.0));
                }
                if (ambIntensityID != null) probeShaderData.setNumber(ambIntensityID, 1.0);
                if (refIntensityID != null) probeShaderData.setNumber(refIntensityID, 1.0);
                probeShaderData.update?.((ReflectionProbe as any).BlockName);
            }
        }
    }

    protected _createBaseRenderNode(): IBaseRenderNode {
        return Laya3DRender.Render3DModuleDataFactory.createMeshRenderNode();
    }

    protected _getcommonUniformMap(): Array<string> {
        return ["Sprite3D"]
    }

    private _createRenderElement(geometry: GeometryElement): RenderElement {
        const element = new RenderElement();
        element.setGeometry(geometry);
        element.setTransform(this._transform);
        element.render = this;
        element._renderElementOBJ.canDynamicBatch = false;
        return element;
    }

    private _rebuildRenderElements(): void {
        this._renderElements.forEach(element => {
            element.destroy();
        });
        this._renderElements.length = 0;

        const supportedCompute = LayaGL.renderEngine.getCapable(RenderCapable.ComputeShader);
        if (!supportedCompute)
            return;

        // ⭐不再把各 mesh 的能力 define 并集到【节点级】shaderData（原 addMeshDefines）：
        // 多 mesh 能力不同时（实心 mesh 有色/切线 + 内置 quad 无），节点级并集会让无色/无切线
        // 元素的 shader 变体强制引用缺失顶点槽 → WebGPU CreateRenderPipeline 失败（Detonation 根因）。
        // mesh define 现由 _syncMeshAttrDefines 按【系统材质实例】精确管理（onAwake 预同步+每帧幂等）。
        for (const geo of this._geometries) {
            if (geo instanceof VFXGeometry) {
                // 跑 mesh smooth: 让相邻 face 共享 vertex normal → 消除 fragment shading 跳变三角形
                // alternating; vc smooth 让区域边界 baseColor 过渡柔和.
                VFXRenderer.smoothMeshNormals(geo.mesh);
                VFXRenderer.smoothMeshVertexColors(geo.mesh, 8, 0.5);
            }
        }

        for (const geometry of this._geometries) {
            const element = this._createRenderElement(geometry);
            this._renderElements.push(element);
        }

        this._setRenderElements();
    }

    protected _onWorldMatNeedChange(flag: number): void {
        super._onWorldMatNeedChange(flag);
        const isMoved = this._baseRenderNode.ismoved;
        isMoved.setValue(Stat.loopCount, LayaGL.renderEngine._framePassCount);
        this._baseRenderNode.ismoved = isMoved;
    }


    _renderUpdate(context3D: IRenderContext3D): void {
        // 同步世界矩阵到 shader data（替代 WebMeshRenderNode 默认回调）
        const renderNode = this._baseRenderNode;
        const trans = renderNode.transform;
        renderNode.shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, trans.worldMatrix);
        (renderNode as any)._worldParams.x = trans.getFrontFaceValue();
        renderNode.shaderData.setVector(Sprite3D.WORLDINVERTFRONT, (renderNode as any)._worldParams);

        // 普通 mesh 走 WebMeshRenderNode._renderUpdate 会调 _applyReflection/_applyLightProb 把 IBL 数据
        // bind 给 shader. VFXRenderer 重写了 _renderUpdate 没继承这一步, 蓝图 PBR shader 拿到 u_IBLTex/
        // u_AmbientColor 都是 0 → SurfaceShading PBRGI 算 fallback 也是 0 → 金属表面全黑/锯齿不融合.
        // 这里手动调这两个让 reflection probe + light probe 数据真 push 到 shader data.
        (renderNode as any)._applyReflection?.();
        (renderNode as any)._applyLightProb?.();

        if (!this.visualEffect)
            return;
        // 逐相机执行 Output 阶段
        this.visualEffect.outputVFX(context3D);
    }

    renderUpdate(context: RenderContext3D): void {

        this._updateMergedBounds();

        const meshMaterial = this.sharedMaterials[0] ?? this.sharedMaterial;

        this._renderElements.forEach((element, index) => {
            const geometry = element._geometry;
            element._renderElementOBJ.isRender = geometry._prepareRender(context);
            geometry._updateRenderParams(context);

            const outType = (geometry as any).outputType || "outputMesh";
            // Strip / Point / Line geometry 都用 VFXStrip shader 材质
            // （顶点布局 a_Position/a_Color/a_Texcoord0/a_Normal，无实例属性）
            if (geometry instanceof VFXStripGeometry || outType === "outputPoint" || outType === "outputLine" || outType === "outputLineStrip") {
                const mode = (geometry as any).blendMode || "Alpha";
                const stripCustomShader = (geometry as any).customShaderName || "";
                if (!(this as any)._stripLogOnce) {
                    (this as any)._stripLogOnce = true;
                    console.log(`[VFX Renderer] Strip path: isStripGeo=${geometry instanceof VFXStripGeometry}, outType=${outType}, mode=${mode}, customShader=${stripCustomShader}, isRender=${element._renderElementOBJ.isRender}`);
                }
                if (!(this as any)._stripDebug2) {
                    (this as any)._stripDebug2 = true;
                    console.log(`[VFX Strip Debug] meshMaterial=${meshMaterial ? (meshMaterial as any)._shader?.name : 'NULL'}, stripCustomShader='${stripCustomShader}'`);
                }
                if (stripCustomShader && stripCustomShader !== "VFXStrip") {
                    element.material = VFXRenderer.getCustomShaderMaterial(stripCustomShader, mode, "strip");
                } else {
                    const stripMainTex = ((geometry as any).mainTexture as string) || "";
                    const stripColorMapping = ((geometry as any).stripColorMapping as string) || "Default";
                    const stripUvScale = (geometry as any).stripUvScale as { x: number, y: number } | undefined;
                    const stripUvBias = (geometry as any).stripUvBias as { x: number, y: number } | undefined;
                    const stripGradientStops = (geometry as any).stripGradientStops as { t: number, color: [number, number, number, number] }[] | undefined;
                    const stripTilingMode = ((geometry as any).stripTilingMode as string) || "Stretch";
                    // RepeatPerSegment 时 ppsc-1 个 segments (相邻 particle 间一个 segment)，tile texture per segment
                    const stripPpsc = Number((geometry as any).stripPpsc ?? 0);
                    const stripTilingSegments = stripPpsc > 1 ? stripPpsc - 1 : 1;
                    const strip = VFXRenderer.getStripMaterial(mode, stripMainTex, stripColorMapping, stripUvScale, stripUvBias, stripGradientStops, stripTilingMode, stripTilingSegments);
                    if (strip) {
                        // 每帧检查用户材质（可能异步加载），拷贝纹理到 strip 材质
                        if (!(this as any)._stripTexApplied) {
                            const mats = this.sharedMaterials;
                            const curMat = mats?.[0] ?? this.sharedMaterial;
                            if (curMat) {
                                const texPropID = Shader3D.propertyNameToID("u_AlbedoTexture");
                                const userSD = (curMat as any)._shaderValues;
                                const tex = userSD?.getTexture(texPropID);
                                if (tex) {
                                    const stripSD = (strip as any)._shaderValues;
                                    stripSD.setTexture(texPropID, tex);
                                    (this as any)._stripTexApplied = true;
                                }
                            }
                        }
                        element.material = strip;
                    }
                    // strip 为 null 时保持上次的 material（等待 shader 加载）
                }
            } else {
                const mode = (geometry as any).blendMode || "Alpha";
                const customShaderName = (geometry as any).customShaderName
                    || (outType === "outputShaderGraphQuad" ? "VFXUnlit" : "");
                // 识别 procedural billboard（VFXBillboardGeometry 带 primitive）
                const bbPrim = (geometry as any).primitive as string || "";
                const isBillboardProcedural = outType === "outputBillboard" && !!bbPrim;

                // outputShaderGraphQuad 或用户指定了自定义 shader
                if (customShaderName) {
                    const mat = VFXRenderer.getCustomShaderMaterial(customShaderName, mode);
                    // mesh 顶点能力 → define 同步：WebGPU 严格校验 shader 引用的顶点槽必须在 VertexState 里，
                    // mesh 缺 color/tangent 元素时不关 define 会 CreateRenderPipeline 失败（Detonation 根因）。
                    // ⚠依赖 per-system 材质实例（bundle 的 matInstanceKey 参数，本源尚缺需提交前补齐），
                    // 共享材质下不同 mesh 的系统会互相覆盖 define。
                    VFXRenderer._syncMeshAttrDefines(mat, geometry);
                    element.material = mat;
                    // (旧 P1 临时方案: 这里手动 mat.setColor u_AmbientColor / setFloat
                    // u_AmbientIntensity / u_ReflectionIntensity 给 fake IBL fallback 用.
                    // 现在 _onEnable + _renderUpdate 接通真 reflection probe block bind,
                    // 引擎自动 push u_IBLTex / u_AmbientColor 等真值, 不需要手动 set.)
                }
                // Cube procedural（Unity VFXBasicCubeOutput 对齐）
                else if (outType === "outputCube") {
                    const cubeMat = VFXRenderer.getCubeProceduralMaterial(mode);
                    if (cubeMat) element.material = cubeMat;
                }
                // Distortion（Unity VFXDistortion 对齐）
                else if (outType === "outputDistortion") {
                    const dMode = (geometry as any).distortionMode || "Procedural";
                    const dStrength = (geometry as any).cropFactor ?? 0.05; // 复用 cropFactor 字段传 strength
                    const dMat = VFXRenderer.getDistortionMaterial(dMode, mode, dStrength);
                    if (dMat) element.material = dMat;
                }
                // Billboard procedural（Unity VFXPlanarPrimitive 对齐）
                else if (isBillboardProcedural) {
                    const cropF = (geometry as any).cropFactor ?? 0.146;
                    // cache key 包含 mainTexture+uvMode+flipbookSize，让 multi-output 各 ctx 独立 material
                    const mainTex = (geometry as any).mainTexture as string;
                    const uvMode = (geometry as any).uvMode || "Default";
                    const fbSize = (geometry as any).flipbookSize;
                    const fbW = (fbSize && fbSize.x) || 4;
                    const fbH = (fbSize && fbSize.y) || 4;
                    // multi-output 同 system 多个 procedural billboard 时（同 prim/blend/uvMode/fbSize/mainTex）
                    // cache 命中同 material instance → Laya RenderElement 用 material 做 instanced rendering
                    // 合并多 element draw call → 第二个 element 的 indirect 被丢弃，渲染丢失。
                    // 解决：用 geometry id 作 unique discriminator 让每个 geometry 独立 material。
                    const geoUid = (geometry as any)._uid ?? ((geometry as any)._uid = (VFXRenderer._geoUidNext++));
                    const bbMat = VFXRenderer.getBillboardProceduralMaterial(bbPrim, mode, cropF, mainTex || "", uvMode, fbW, fbH, geoUid);
                    // shader 未加载完时保持旧 material，避免 null 渲染
                    if (bbMat) {
                        if (mainTex) {
                            // 每帧从本地 _atlasTextureCache 同步拿 atlas 强制 setTexture，
                            // 避免依赖 Laya.loader.load.then 异步 promise（multi-output 多 material 时回调可能漏）
                            const cached = VFXRenderer._atlasTextureCache.get(mainTex);
                            if (cached) {
                                bbMat.setTexture("u_AlbedoTexture", cached);
                            } else if (!VFXRenderer._failedTextureUrls.has(mainTex)) {
                                // 第一次：异步启动加载，加载完写本地 cache（后续帧走 cache hit 同步设）
                                VFXRenderer._tryLoadTextureOnce(mainTex, () => { /* cache 由 helper 自己写，下帧命中 */ });
                            }
                        }
                        applyFlipbook(bbMat, uvMode, fbSize);
                        const softFade = (geometry as any).softParticleFade || 0;
                        applySoftParticle(bbMat, softFade);
                        applySubpixelAA(bbMat, !!(geometry as any).subpixelAA);
                        // Alpha Clipping (Unity VFXPlanarPrimitiveOutput useAlphaClipping)
                        // atlas mask 字符用：alpha<threshold 时 fragment discard，atlas 背景方块消失
                        const useAlphaClip = !!(geometry as any).useAlphaClipping;
                        const alphaThresh = Number((geometry as any).alphaThreshold ?? 0.5);
                        const acDef = Shader3D.getDefineByName("VFX_ALPHA_CLIP");
                        if (acDef) {
                            if (useAlphaClip) bbMat.addDefine(acDef); else bbMat.removeDefine(acDef);
                        }
                        bbMat.setFloat("u_AlphaThreshold", alphaThresh);
                        element.material = bbMat;
                    }
                }
                // 用户未配置材质时使用内置默认材质
                else if (!meshMaterial && outType === "outputBillboard") {
                    element.material = VFXRenderer.getBillboardMaterial(mode);
                } else if (!meshMaterial) {
                    // outputMesh / outputStaticMesh 等：自动创建 VFXUnlit 默认材质
                    element.material = VFXRenderer.getCustomShaderMaterial("VFXUnlit", mode);
                } else {
                    if (meshMaterial) {
                        applyBlendMode(meshMaterial, mode);
                    }
                    if (meshMaterial && outType === "outputBillboard") {
                        // Atlas 模式（uvMode != Default）下用 mainTexture 设到 u_AlbedoTexture，
                        // 否则 fallback 到 default dot 让粒子至少可见
                        const mainTex = (geometry as any).mainTexture as string;
                        if (mainTex) {
                            VFXRenderer._tryLoadTextureOnce(mainTex, tex => meshMaterial.setTexture("u_AlbedoTexture", tex));
                            // mainTex 加载失败时（_failedTextureUrls 已记），下帧 helper 不再重试；
                            // 用 default dot 兜底让粒子至少可见
                            if (VFXRenderer._failedTextureUrls.has(mainTex)) {
                                const existing = meshMaterial.getTexture("u_AlbedoTexture");
                                if (!existing) meshMaterial.setTexture("u_AlbedoTexture", VFXRenderer.getDefaultDotTexture());
                            }
                        } else {
                            const existing = meshMaterial.getTexture("u_AlbedoTexture");
                            if (!existing) {
                                meshMaterial.setTexture("u_AlbedoTexture", VFXRenderer.getDefaultDotTexture());
                            }
                        }
                    }
                    // Soft Particle / Flipbook / SubpixelAA
                    const softFade = (geometry as any).softParticleFade || 0;
                    if (meshMaterial) {
                        applySoftParticle(meshMaterial, softFade);
                        const uvMode = (geometry as any).uvMode || "Default";
                        const fbSize = (geometry as any).flipbookSize;
                        applyFlipbook(meshMaterial, uvMode, fbSize);
                        applySubpixelAA(meshMaterial, !!(geometry as any).subpixelAA);
                    }
                    element.material = meshMaterial;
                }
            }
        });
    }

    /**
     * @internal
     * 合并所有 geometry 的 bounds 到 _mergedBounds
     */
    _updateMergedBounds(): void {
        if (this._geometries.length === 0) return;
        const geometryBounds = this.geometryBounds;
        geometryBounds.min.set(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        geometryBounds.max.set(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

        for (const geometry of this._geometries) {
            const bounds = (geometry as any).bounds;
            if (bounds) {
                Bounds.merge(bounds, geometryBounds, geometryBounds);
            }
        }

        this.boundsChange = true;
    }

}

/**
 * 按 blendMode 配置材质的 blend 状态（对齐 Unity VFX BlendMode 枚举）
 *   Alpha         = (SrcAlpha, OneMinusSrcAlpha)   — 普通半透明
 *   Additive      = (SrcAlpha, One)                — 发光/火花叠加
 *   Premultiplied = (One,      OneMinusSrcAlpha)   — 预乘 alpha
 *   Opaque        = 关闭 blend，开启 depthWrite
 */
/**
 * Bake gradient stops 成 256×1 RGBA8 Texture2D
 * 对齐 VFXAssetParser bakeInlineGradientTexture 的算法（独立 copy 避免跨文件耦合）
 */
function bakeGradientTexture256(stops: { t: number; color: [number, number, number, number] }[]): Texture2D {
    const sorted = [...stops].sort((a, b) => a.t - b.t);
    if (sorted.length === 0) {
        sorted.push({ t: 0, color: [1, 1, 1, 1] });
        sorted.push({ t: 1, color: [1, 1, 1, 0] });
    }
    const W = 256;
    // 用 R32G32B32A32 float 格式保留 HDR (Unity gradient 末端 r=g=b=16)
    const floats = new Float32Array(W * 4);
    for (let i = 0; i < W; i++) {
        const t = i / (W - 1);
        let i0 = 0, i1 = sorted.length - 1;
        if (t <= sorted[0].t) { i0 = i1 = 0; }
        else if (t >= sorted[sorted.length - 1].t) { i0 = i1 = sorted.length - 1; }
        else {
            for (let k = 0; k < sorted.length - 1; k++) {
                if (t >= sorted[k].t && t <= sorted[k + 1].t) { i0 = k; i1 = k + 1; break; }
            }
        }
        const a = sorted[i0], b = sorted[i1];
        const f = (a.t === b.t) ? 0 : (t - a.t) / (b.t - a.t);
        floats[i * 4 + 0] = a.color[0] + (b.color[0] - a.color[0]) * f;
        floats[i * 4 + 1] = a.color[1] + (b.color[1] - a.color[1]) * f;
        floats[i * 4 + 2] = a.color[2] + (b.color[2] - a.color[2]) * f;
        floats[i * 4 + 3] = a.color[3] + (b.color[3] - a.color[3]) * f;
    }
    const tex = new Texture2D(W, 1, TextureFormat.R32G32B32A32, false, false);
    tex.setPixelsData(new Uint8Array(floats.buffer), false, false);
    tex.filterMode = FilterMode.Bilinear;
    tex.wrapModeU = WrapMode.Clamp;
    tex.wrapModeV = WrapMode.Clamp;
    return tex;
}

function applyBlendMode(mat: Material, mode: string): void {
    const RS = RenderState;
    const opaqueDef = Shader3D.getDefineByName("VFX_OPAQUE");
    const sd = (mat as any)._shaderValues as ShaderData;
    if (mode === "Opaque") {
        mat.materialRenderMode = MaterialRenderMode.RENDERMODE_OPAQUE;
        mat.blend = RS.BLEND_DISABLE;
        mat.depthWrite = true;
        mat.depthTest = RS.DEPTHTEST_LESS;
        if (sd && opaqueDef) sd.addDefine(opaqueDef);
        return;
    }
    // AlphaClip: 对齐 Unity URP「Transparent + _ALPHATEST_ON + ZWrite On」(materialize 溶解雕像)。
    // alpha 是二值(step 0/1),shader 端 alpha test discard 掉 alpha<阈值的像素,保留像素写深度,
    // 让前后/内外面正确深度排序 → 雕像实心(非半透穿透)。仍用 alpha 混合保留 Unity 的边缘合成。
    if (mode === "AlphaClip") {
        if (sd && opaqueDef) sd.removeDefine(opaqueDef);
        mat.materialRenderMode = MaterialRenderMode.RENDERMODE_TRANSPARENT;
        mat.blend = RS.BLEND_ENABLE_ALL;
        mat.blendSrc = RS.BLENDPARAM_SRC_ALPHA;
        mat.blendDst = RS.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        mat.depthWrite = true;   // ← 关键: Unity ZWrite On
        mat.depthTest = RS.DEPTHTEST_LESS;
        return;
    }
    if (sd && opaqueDef) sd.removeDefine(opaqueDef);
    mat.materialRenderMode = MaterialRenderMode.RENDERMODE_TRANSPARENT;
    mat.blend = RS.BLEND_ENABLE_ALL;
    mat.depthWrite = false;
    mat.depthTest = RS.DEPTHTEST_LESS;
    switch (mode) {
        case "Additive":
            mat.blendSrc = RS.BLENDPARAM_SRC_ALPHA;
            mat.blendDst = RS.BLENDPARAM_ONE;
            break;
        case "Premultiplied":
            mat.blendSrc = RS.BLENDPARAM_ONE;
            mat.blendDst = RS.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            break;
        case "Alpha":
        default:
            mat.blendSrc = RS.BLENDPARAM_SRC_ALPHA;
            mat.blendDst = RS.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            break;
    }
}

/**
 * 按 softFade 值开启/关闭材质的 Soft Particle 效果
 *   softFade > 0：开启 SOFT_PARTICLE define，并设 u_SoftParticleFactor.x = softFade
 *   softFade == 0：关闭 define
 * 需要用户相机设置 depthTextureMode 包含 Depth 位（否则 u_CameraDepthTexture 未绑定）
 */
function applySoftParticle(mat: Material, softFade: number): void {
    const def = Shader3D.getDefineByName("SOFT_PARTICLE");
    const sd = (mat as any)._shaderValues as ShaderData;
    if (softFade > 0) {
        if (sd && def) sd.addDefine(def);
        mat.setVector2("u_SoftParticleFactor", new Vector2(softFade, 0));
    } else {
        if (sd && def) sd.removeDefine(def);
    }
}

/**
 * 按 uvMode 开启/关闭 Flipbook / FlipbookBlend defines，并设置 u_FlipbookSize
 * 对齐 Unity VFX Output Context UV Mode（Default / Flipbook / FlipbookBlend）
 */
function applyFlipbook(mat: Material, uvMode: string, flipbookSize: Vector2): void {
    const defFB = Shader3D.getDefineByName("FLIPBOOK");
    const defFBB = Shader3D.getDefineByName("FLIPBOOK_BLEND");
    const sd = (mat as any)._shaderValues as ShaderData;
    if (!sd) return;
    if (uvMode === "Flipbook") {
        if (defFB) sd.addDefine(defFB);
        if (defFBB) sd.removeDefine(defFBB);
    } else if (uvMode === "FlipbookBlend") {
        if (defFB) sd.removeDefine(defFB);
        if (defFBB) sd.addDefine(defFBB);
    } else {
        if (defFB) sd.removeDefine(defFB);
        if (defFBB) sd.removeDefine(defFBB);
        return;
    }
    const cols = (flipbookSize && flipbookSize.x) || 4;
    const rows = (flipbookSize && flipbookSize.y) || 4;
    mat.setVector2("u_FlipbookSize", new Vector2(cols, rows));
}

function applySubpixelAA(mat: Material, enabled: boolean): void {
    const def = Shader3D.getDefineByName("SUBPIXEL_AA");
    const sd = (mat as any)._shaderValues as ShaderData;
    if (!sd || !def) return;
    if (enabled) sd.addDefine(def);
    else sd.removeDefine(def);
}

function addMeshDefines(mesh: Mesh, definesData: ShaderData) {
    if (mesh) {
        const defs = MeshFilter._meshVerticeDefine;
        defs.length = 0;
        MeshUtil.getMeshDefine(mesh, defs);
        defs.forEach(def => {
            definesData.addDefine(def);
        });
    }
}
