import { DataView, DataViewType, Mutable } from "../../ILaya";
import { Color } from "../maths/Color";
import { MathUtil } from "../maths/MathUtil";
import { Rectangle } from "../maths/Rectangle";
import { Vector2 } from "../maths/Vector2";
import { Texture } from "../resource/Texture";
import { IPool, Pool } from "./Pool";

/**
 * @en Vertex stream is a tool for appending vertices and triangles.
 * @zh 顶点流工具，用于顶点数据和三角形数据的添加。
 */
export class VertexStream {
    /**
     * @en The rectangle of the content. The origin is at the top-left corner.
     * @zh 内容的矩形区域。原点在左上角。
     */
    readonly contentRect: Rectangle;
    /**
     * @en The rectangle of the uv. The origin is at the top-left corner.
     * @zh uv 的矩形区域。原点在左上角。
     */
    readonly uvRect: Rectangle;
    /**
     * @en The default color of the vertices.
     * @zh 顶点的默认颜色。
     */
    readonly color: Color;

    /**
     * @en The main texture.
     * @zh 主贴图。
     */
    readonly mainTex: Texture;

    private _vertices: Float32Array;
    private _uvs: Float32Array;
    private _indices: Uint16Array;
    private _colors: Float32Array;
    private _vp: number = 0;
    private _ip: number = 0;
    private _vec: Vector2;

    static readonly pool: IPool<VertexStream> = Pool.createPool(VertexStream, (e: VertexStream, mainTex?: Texture) => e.init(mainTex));

    constructor() {
        this.contentRect = new Rectangle();
        this.uvRect = new Rectangle();
        this.color = new Color();

        this._vertices = this.resizeBuf(Float32Array, 20);
        this._uvs = this.resizeBuf(Float32Array, 20);
        this._colors = this.resizeBuf(Float32Array, 40);
        this._indices = this.resizeBuf(Uint16Array, 30);

        this._vec = new Vector2();
    }

    init(mainTex?: Texture) {
        (<Mutable<this>>this).mainTex = mainTex;
        if (mainTex) {
            let uv = mainTex.uvrect;
            if (mainTex.width === mainTex.sourceWidth && mainTex.height === mainTex.sourceHeight)
                this.uvRect.setTo(uv[0], uv[1], uv[2], uv[3]);
            else {
                let sx = uv[2] / mainTex.width;
                let sy = uv[3] / mainTex.height;
                this.uvRect.setTo(uv[0] - mainTex.offsetX * sx, uv[1] - mainTex.offsetY * sy, mainTex.sourceWidth * sx, mainTex.sourceHeight * sy);
            }
        }
        else
            this.uvRect.setTo(0, 0, 1, 1);

        this.color.setValue(1, 1, 1, 1);
        this._vp = 0;
        this._ip = 0;
    }

    /**
     * @en Add a vertex.
     * @param x The x coordinate of the vertex. 
     * @param y The y coordinate of the vertex. 
     * @param color The color of the vertex. If not set, the color will be the default color.
     * @param u The u of the vertex. If not set, the u will be calculated based on the contentRect and uvRect.
     * @param v The v of the vertex. If not set, the v will be calculated based on the contentRect and uvRect.
     * @zh 添加一个顶点。
     * @param x 顶点的 x 坐标。
     * @param y 顶点的 y 坐标。
     * @param color 顶点的颜色。如果不设置，颜色将会是默认颜色。
     * @param u 顶点的 u。如果不设置，u 将根据 contentRect 和 uvRect 计算。
     * @param v 顶点的 v。如果不设置，v 将根据 contentRect 和 uvRect 计算。
     */
    addVert(x: number, y: number, color?: Readonly<Color>, u?: number, v?: number): void {
        this.checkVBuf(2);

        let idx = this._vp;
        this._vp += 2;

        this._vertices[idx] = x;
        this._vertices[idx + 1] = y;

        if (u != null)
            this._uvs[idx] = u;
        else
            this._uvs[idx] = MathUtil.lerp(this.uvRect.x, this.uvRect.right, (x - this.contentRect.x) / (this.contentRect.width || 1));
        if (v != null)
            this._uvs[idx + 1] = v;
        else
            this._uvs[idx + 1] = MathUtil.lerp(this.uvRect.y, this.uvRect.bottom, (y - this.contentRect.y) / (this.contentRect.height || 1));

        (color || this.color).writeTo(this._colors, idx * 2);
    }

    /**
     * @en Add a quad. A quad is composed of four vertices.
     * @param rect The rectangle of the quad. 
     * @param color The color of the quad. If not set, the color will be the default color.
     * @param uvRect The uvs of the quad. If not set, the uv will be calculated based on the contentRect and uvRect.
     * @zh 添加一个四边形。四边形由四个顶点组成。
     * @param rect 四边形的矩形区域。
     * @param color 四边形的颜色。如果不设置，颜色将会是默认颜色。
     * @param uvRect 四边形的 uvs。如果不设置，uv 将根据 contentRect 和 uvRect 计算。
     */
    addQuad(rect: Readonly<Rectangle>, color?: Readonly<Color>, uvRect?: Readonly<Rectangle>): void {
        if (uvRect) {
            this.addVert(rect.x, rect.y, color, uvRect.x, uvRect.y);
            this.addVert(rect.right, rect.y, color, uvRect.right, uvRect.y);
            this.addVert(rect.right, rect.bottom, color, uvRect.right, uvRect.bottom);
            this.addVert(rect.x, rect.bottom, color, uvRect.x, uvRect.bottom);
        }
        else {
            this.addVert(rect.x, rect.y, color);
            this.addVert(rect.right, rect.y, color);
            this.addVert(rect.right, rect.bottom, color);
            this.addVert(rect.x, rect.bottom, color);
        }
    }

    /**
     * @en Add a triangle. A triangle is composed of three indices.
     * @param idx0 The first index of the triangle.
     * @param idx1 The second index of the triangle. 
     * @param idx2 The third index of the triangle.
     * @zh 添加一个三角形。三角形由三个索引组成。
     * @param idx0 三角形的第一个索引。
     * @param idx1 三角形的第二个索引。
     * @param idx2 三角形的第三个索引。 
     */
    addTriangle(idx0: number, idx1: number, idx2: number): void {
        this.checkIBuf(3);

        let idx = this._ip;
        this._ip += 3;

        this._indices[idx] = idx0;
        this._indices[idx + 1] = idx1;
        this._indices[idx + 2] = idx2;
    }

    /**
     * @en Add triangles. The triangles are composed of indices.
     * @param indices The indices of the triangles.
     * @zh 添加三角形。三角形由索引组成。
     * @param indices 三角形的索引。 
     */
    addTriangles(indices: ReadonlyArray<number>): void {
        this.checkIBuf(indices.length);

        let arr = this._indices;
        let idx = this._ip;
        let n = indices.length;
        this._ip += n;
        for (let i = 0; i < n; i++)
            arr[idx + i] = indices[i];
    }

    /**
     * @en Triangulate the quads.
     * @param baseIndex The index of the first vertex of the first quad. If it is negative, it will be calculated from the end.
     * @zh 将四边形分割成三角形。
     * @param baseIndex 第一个四边形的第一个顶点的索引。如果是负数，则会从末尾计算。 
     */
    triangulateQuad(baseIndex: number): void {
        let cnt = this._vp / 2;
        if (baseIndex < 0)
            baseIndex = cnt + baseIndex;

        let icnt = (cnt - baseIndex) / 4 * 6;
        this.checkIBuf(icnt);

        let arr = this._indices;
        for (let i = baseIndex, j = this._ip; i < cnt; i += 4, j += 6) {
            arr[j] = i;
            arr[j + 1] = i + 1;
            arr[j + 2] = i + 2;

            arr[j + 3] = i + 2;
            arr[j + 4] = i + 3;
            arr[j + 5] = i;
        }
        this._ip += icnt;
    }

    /**
     * @en Get the position of the vertex by index.
     * @param index The index of the vertex. If it is negative, it will be calculated from the end. 
     * @returns The position of the vertex.
     * @zh 根据索引获取顶点的位置。
     * @param index 顶点的索引。如果是负数，则会从末尾计算。
     * @returns 顶点的位置。
     */
    getPos(index: number): Readonly<Vector2> {
        if (index < 0)
            index = this._vp / 2 + index;
        index *= 2;
        this._vec.setValue(this._vertices[index], this._vertices[index + 1]);
        return this._vec;
    }

    /**
     * @en Get the number of vertices.
     * @zh 获取顶点数量。
     */
    get vertCount(): number {
        return this._vp / 2;
    }

    /**
     * @en Get the vertices typed array.
     * @returns The vertices typed array.
     * @zh 获取顶点的类型化数组。
     * @returns 顶点的类型化数组。
     */
    getVertices(): Float32Array {
        return new Float32Array(this._vertices.buffer, 0, this._vp);
    }

    /**
     * @en Get the uvs typed array.
     * @returns The uvs typed array.
     * @zh 获取uv的类型化数组。
     * @returns uv的类型化数组。
     */
    getUVs(): Float32Array {
        return new Float32Array(this._uvs.buffer, 0, this._vp);
    }

    /**
     * @en Get the colors typed array.
     * @returns The colors typed array.
     * @zh 获取颜色的类型化数组。
     * @returns 颜色的类型化数组。 
     */
    getColors(): Float32Array {
        return new Float32Array(this._colors.buffer, 0, this._vp * 2);
    }

    /**
     * @en Get the indices typed array.
     * @returns The indices typed array.
     * @zh 获取索引的类型化数组。
     * @returns 索引的类型化数组。 
     */
    getIndices(): Uint16Array {
        return new Uint16Array(this._indices.buffer, 0, this._ip);
    }

    private checkVBuf(addCount: number): void {
        if (this._vp + addCount < this._vertices.length)
            return;

        let vp = this._vp + Math.max(20, addCount);
        this._vertices = this.resizeBuf(Float32Array, vp, this._vertices);
        this._uvs = this.resizeBuf(Float32Array, vp, this._uvs);
        this._colors = this.resizeBuf(Float32Array, vp * 2, this._colors);
    }

    private checkIBuf(addCount: number): void {
        if (this._ip + addCount < this._indices.length)
            return;

        let ip = this._ip + Math.max(30, addCount);
        this._indices = this.resizeBuf(Uint16Array, ip, this._indices);
    }

    private resizeBuf<T extends DataView>(type: DataViewType, sz: number, oldData?: DataView): T {
        let newBuf = new ArrayBuffer(type.BYTES_PER_ELEMENT * sz);
        let newDataView = new type(newBuf);
        oldData && newDataView.set(oldData);
        return <T>newDataView;
    }
}