import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Material } from "../../../resource/Material";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Browser } from "../../../utils/Browser";
import { Scene } from "../../Scene";
import { Sprite } from "../../Sprite";
import { Mesh2DRender } from "../Mesh2DRender";
import { BaseLight2D, Light2DType } from "./BaseLight2D";
import { ShowRenderTarget } from "./ShowRenderTarget";

/**
 * 自定义形状灯光
 */
export class FreeformLight2D extends BaseLight2D {
    static FALLOF_WIDTH: number = 100; //渐变区的宽度系数
    private _falloffRange: number = 1; //灯光衰减范围 0-10

    private _lightPolygon: Vector2[] = []; //定义灯光的多边形顶点（顺时针存储）
    private _globalPolygon: Vector2[] = []; //变换后的多边形顶点（顺时针存储）

    //用于生成灯光贴图
    private _sprite: Sprite;
    private _render: Mesh2DRender;
    private _material: Material;

    /**
     * @ignore
     */
    constructor() {
        super();
        this._type = Light2DType.Freeform;
        this._sprite = new Sprite();
        this._material = new Material();
        this._material.setShaderName('LightGen2D');
        this._material.setBoolByIndex(Shader3D.DEPTH_WRITE, false);
        this._material.setIntByIndex(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        this._material.setIntByIndex(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
        this._material.setIntByIndex(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
        this._material.setIntByIndex(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_SRC_ALPHA);
        this._material.setIntByIndex(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
        this._material.setIntByIndex(Shader3D.CULL, RenderState.CULL_NONE);
        this._render = this._sprite.addComponent(Mesh2DRender);
        this._render.sharedMaterial = this._material;
    }

    get falloffRange() {
        return this._falloffRange;
    }
    set falloffRange(value: number) {
        if (this._falloffRange !== value) {
            this._falloffRange = value;
            this.updateMark++;
            this._needUpdateLight = true;
            this._limitParam();
        }
    }

    /**
     * 添加灯光顶点
     * @param x 
     * @param y 
     * @param index 
     */
    addPoint(x: number, y: number, index: number = -1) {
        if (index < 0) {
            this._lightPolygon.push(new Vector2(x, y));
            this._globalPolygon.push(new Vector2(x, y));
        } else {
            for (let i = this._lightPolygon.length; i > index; i--) {
                this._lightPolygon[i] = this._lightPolygon[i - 1];
                this._globalPolygon[i] = this._globalPolygon[i - 1];
            }
            this._lightPolygon[index] = new Vector2(x, y);
            this._globalPolygon[index] = new Vector2(x, y);
        }
        this._needUpdateLight = true;
    }

    /**
     * 更新灯光顶点
     * @param x 
     * @param y 
     * @param index 
     */
    updatePoint(x: number, y: number, index: number) {
        if (index < this._lightPolygon.length && index >= 0) {
            this._lightPolygon[index].x = x;
            this._lightPolygon[index].y = y;
            this._needUpdateLight = true;
        }
    }

    /**
     * 删除灯光顶点
     * @param index 
     */
    removePoint(index: number) {
        if (index < this._lightPolygon.length && index >= 0) {
            this._lightPolygon.splice(index, 1);
            this._globalPolygon.splice(index, 1);
            this._needUpdateLight = true;
        }
    }

    /**
     * 获取灯光范围
     * @param screen 
     */
    getLightRange(screen?: Rectangle) {
        this._transformPoly();
        let xmin = Number.POSITIVE_INFINITY;
        let ymin = Number.POSITIVE_INFINITY;
        let xmax = Number.NEGATIVE_INFINITY;
        let ymax = Number.NEGATIVE_INFINITY;
        const polygon = this._globalPolygon;
        for (let i = polygon.length - 1; i > -1; i--) {
            const poly = polygon[i];
            if (xmin > poly.x) xmin = poly.x;
            if (xmax < poly.x) xmax = poly.x;
            if (ymin > poly.y) ymin = poly.y;
            if (ymax < poly.y) ymax = poly.y;
        }
        let x = (xmax - xmin) * Browser.pixelRatio | 0;
        let y = (ymax - ymin) * Browser.pixelRatio | 0;
        const t = this._falloffRange * FreeformLight2D.FALLOF_WIDTH * 1.5 * Browser.pixelRatio | 0;
        //const w = (this.owner as Sprite).width = x + 10 + t * 2;
        //const h = (this.owner as Sprite).height = y + 10 + t * 2;
        const w = this._range.width = x + 10 + t * 2;
        const h = this._range.height = y + 10 + t * 2;
        x = this._range.x = (xmin - 5 - t) | 0;
        y = this._range.y = (ymin - 5 - t) | 0;
        this._range.width = w;
        this._range.height = h;
        for (let i = polygon.length - 1; i > -1; i--) {
            polygon[i].x -= x;
            polygon[i].y -= y;
        }
        return this._range;
    }

    /**
     * 渲染灯光贴图
     * @param scene 
     */
    renderLightTexture(scene: Scene) {
        super.renderLightTexture(scene);
        // if (this._lastRotation !== this.globalRotation) {
        //     this._lastRotation = this.globalRotation;
        //     this.needUpdateLight = true;
        // }
        //this._needUpdateLight = true;
        if (this._needUpdateLight) {
            this._needUpdateLight = false;
            this.updateMark++;
            const range = this.getLightRange();
            if (!this._texLight || !(this._texLight instanceof RenderTexture2D)) {
                this._texLight = new RenderTexture2D(range.width, range.height, RenderTargetFormat.R8G8B8A8);
                this._texLight.wrapModeU = WrapMode.Clamp;
                this._texLight.wrapModeV = WrapMode.Clamp;
            }
            else if (this._texLight.width !== range.width || this._texLight.height !== range.height) {
                this._texLight.destroy();
                this._texLight = new RenderTexture2D(range.width, range.height, RenderTargetFormat.R8G8B8A8);
                this._texLight.wrapModeU = WrapMode.Clamp;
                this._texLight.wrapModeV = WrapMode.Clamp;
            }
            if (this._render.shareMesh)
                this._needToRecover.push(this._render.shareMesh);
            this._render.shareMesh = this._createMesh(this._falloffRange * FreeformLight2D.FALLOF_WIDTH, 8);
            scene.addChild(this._sprite);
            this._sprite.drawToTexture(0, 0, 0, 0, this._texLight as RenderTexture2D);
            scene.removeChild(this._sprite);

            if (this.showLightTexture) {
                if (!this.showRenderTarget)
                    this.showRenderTarget = new ShowRenderTarget(scene, this._texLight, 0, 0, 300, 300);
                else this.showRenderTarget.setRenderTarget(this._texLight);
            }
        }
    }

    /**
     * 限制参数范围
     */
    private _limitParam() {
        this._falloffRange = Math.max(Math.min(this._falloffRange, 10), 0);
    }

    /**
     * 变换多边形顶点
     */
    private _transformPoly() {
        const globalPoly = this._globalPolygon;
        const polygon = this._lightPolygon;
        const len = polygon.length;
        const ox = (this.owner as Sprite).globalPosX * Browser.pixelRatio;
        const oy = (this.owner as Sprite).globalPosY * Browser.pixelRatio;
        const sx = (this.owner as Sprite).globalScaleX;
        const sy = (this.owner as Sprite).globalScaleY;
        const rotation = (this.owner as Sprite).globalRotation * Math.PI / 180;
        const pivotX = (this.owner as Sprite).pivotX * Browser.pixelRatio;
        const pivotY = (this.owner as Sprite).pivotY * Browser.pixelRatio;
        const sinA = Math.sin(rotation);
        const cosA = Math.cos(rotation);
        let x = 0, y = 0;
        for (let i = 0; i < len; i++) {
            x = polygon[i].x * Browser.pixelRatio - pivotX;
            y = polygon[i].y * Browser.pixelRatio - pivotY;
            globalPoly[i].x = (x * cosA - y * sinA) * sx + pivotX + ox;
            globalPoly[i].y = (x * sinA + y * cosA) * sy + pivotY + oy;
        }
    }

    /**
     * 创建灯光多边形
     * @param expand 
     * @param arcSegments 
     */
    private _createMesh(expand: number, arcSegments: number = 8) {
        const points: Vector3[] = [];
        const inds: number[] = [];
        const poly = this._globalPolygon;
        const len = poly.length;
        const normal1 = new Vector2();
        const normal2 = new Vector2();

        //b点是否凸出
        const _isConvex = (a: Vector2, b: Vector2, c: Vector2) => {
            return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
        };

        const _getNormal = (a: Vector2, b: Vector2, n: Vector2) => {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            n.x = dy / length;
            n.y = -dx / length;
        };

        //求两线段的交点
        const _intersection = (p1: Vector3, p2: Vector3, p3: Vector3, p4: Vector3) => {
            //计算方向向量（忽略z坐标）
            const d1 = { x: p2.x - p1.x, y: p2.y - p1.y };
            const d2 = { x: p4.x - p3.x, y: p4.y - p3.y };

            //计算分母
            const denominator = d1.x * d2.y - d1.y * d2.x;

            //如果分母为0，则线段平行或共线
            if (Math.abs(denominator) < Number.EPSILON)
                return null;

            //计算线段1上的参数t和线段2上的参数u
            const t = ((p3.x - p1.x) * d2.y - (p3.y - p1.y) * d2.x) / denominator;
            const u = ((p3.x - p1.x) * d1.y - (p3.y - p1.y) * d1.x) / denominator;

            //检查t和u是否在[0,1]范围内
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                //计算交点
                return new Vector3(
                    p1.x + t * d1.x,
                    p1.y + t * d1.y,
                    p1.z //使用任意一个点的z坐标，因为它们应该是相等的
                );
            }

            return null; //线段不相交
        };

        //添加原多边形顶点
        for (let i = 0; i < len; i++)
            points.push(new Vector3(poly[i].x, poly[i].y, 1));

        //添加扩展顶点和圆弧点
        for (let i = 0; i < len; i++) {
            const prev = i - 1 >= 0 ? i - 1 : len - 1;
            const next = (i + 1) % len;
            const next2 = (i + 2) % len;

            _getNormal(poly[i], poly[next], normal1);
            _getNormal(poly[next], poly[next2], normal2);

            const start = points.length;
            const p1 = new Vector3(poly[i].x + expand * normal1.x, poly[i].y + expand * normal1.y, 0);
            const p2 = new Vector3(poly[next].x + expand * normal1.x, poly[next].y + expand * normal1.y, 0);

            if (_isConvex(poly[i], poly[next], poly[next2])) {
                const angle1 = Math.atan2(normal1.y, normal1.x);
                const angle2 = Math.atan2(normal2.y, normal2.x);
                let angleDiff = angle2 - angle1;
                if (angleDiff < 0)
                    angleDiff += Math.PI * 2;

                if (_isConvex(poly[prev], poly[i], poly[next]))
                    points.push(p1, p2);
                else {
                    _getNormal(poly[prev], poly[i], normal1);

                    const p3 = new Vector3(poly[prev].x + expand * normal1.x, poly[prev].y + expand * normal1.y, 0);
                    const p4 = new Vector3(poly[i].x + expand * normal1.x, poly[i].y + expand * normal1.y, 0);
                    let t = _intersection(p1, p2, p3, p4);
                    if (!t) t = p1;
                    points.push(t, p2);
                }

                inds.push(i, start, start + 1);
                inds.push(i, start + 1, next);

                for (let j = 1; j <= arcSegments; j++) {
                    const angle = angle1 + (angleDiff * j) / arcSegments;
                    points.push(new Vector3(
                        poly[next].x + expand * Math.cos(angle),
                        poly[next].y + expand * Math.sin(angle),
                        0));
                    inds.push(next, start + j, start + j + 1);
                }
            } else {
                const p3 = new Vector3(poly[next].x + expand * normal2.x, poly[next].y + expand * normal2.y, 0);
                const p4 = new Vector3(poly[next2].x + expand * normal2.x, poly[next2].y + expand * normal2.y, 0);
                let t = _intersection(p1, p2, p3, p4);
                if (!t) t = p2;
                points.push(p1, t, p4);
                inds.push(i, start, start + 1);
                inds.push(i, start + 1, next);
            }
        }

        //三角化多边形内部（使用耳切法）
        inds.push(...this._earCut(poly));

        return this._makeMesh(points, inds);
    }

    /**
     * 耳切法三角化凹多边形
     * @param polygon 
     */
    private _earCut(polygon: Vector2[]) {
        const vertices = polygon.map((p, i) => ({ x: p.x, y: p.y, index: i }));
        const triangles: number[] = [];
        const len = vertices.length;
        if (len < 3) return triangles;

        const indices = vertices.map((_, i) => i);
        let vertexCount = len;

        let i = 0, stop = vertexCount;
        while (vertexCount > 2) {
            stop--;
            if (i >= vertexCount) i = 0;

            const a = indices[i];
            const b = indices[(i + 1) % vertexCount];
            const c = indices[(i + 2) % vertexCount];

            if (this._isEarTip(vertices, indices, vertexCount, a, b, c)) {
                triangles.push(vertices[a].index, vertices[b].index, vertices[c].index);
                indices.splice((i + 1) % vertexCount, 1);
                vertexCount--;
                stop = vertexCount;
            } else i++;

            //防止无限循环
            if (stop <= 0) break;
        }

        return triangles;
    }

    /**
     * 是否耳尖
     * @param vertices 
     * @param indices 
     * @param vertexCount 
     * @param a 
     * @param b 
     * @param c 
     */
    private _isEarTip(vertices: { x: number, y: number, index: number }[], indices: number[], vertexCount: number, a: number, b: number, c: number) {
        const _isConvex = (a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }) => {
            return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) >= 0;
        };

        return _isConvex(vertices[a], vertices[b], vertices[c]) &&
            !this._containsAnyPoint(vertices, indices, vertexCount, vertices[a], vertices[b], vertices[c], [a, b, c]);
    }

    /**
     * 是否包含其他顶点
     * @param vertices 
     * @param indices 
     * @param vertexCount 
     * @param a 
     * @param b 
     * @param c 
     * @param exclude 
     */
    private _containsAnyPoint(vertices: { x: number, y: number }[], indices: number[], vertexCount: number, a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }, exclude: number[]) {
        const _pointInTriangle = (p: { x: number, y: number }, a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }) => {
            const _triangleArea = (a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }) => {
                return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
            };

            const area = _triangleArea(a, b, c);
            const area1 = _triangleArea(p, b, c);
            const area2 = _triangleArea(a, p, c);
            const area3 = _triangleArea(a, b, p);

            if (Math.abs(area) < Number.EPSILON) return false;

            const u = area1 / area;
            const v = area2 / area;
            const w = area3 / area;
            return u >= 0 && v >= 0 && w >= 0 && Math.abs(u + v + w - 1) < Number.EPSILON;
        };

        for (let i = 0; i < vertexCount; i++) {
            const index = indices[i];
            if (exclude.includes(index)) continue;
            if (_pointInTriangle(vertices[index], a, b, c)) return true;
        }
        return false;
    }
}