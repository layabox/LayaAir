
import { Bounds } from "../d3/math/Bounds";
import { Vector3 } from "../maths/Vector3";
import { TextResource } from "../resource/TextResource";
import { Byte } from "../utils/Byte";
import { NavigationUtils } from "./NavigationUtils";


/**
 * 从buffer读取NavTileCache数据
 * @param byte 
 * @param navData 
 */
const readNavTileCache = function (byte: Byte, navData: NavTileData) {
    navData._dirtyFlag = byte.getFloat32();
    const min: Vector3 = navData._boundBox.min;
    min.x = byte.getFloat32();
    min.y = byte.getFloat32();
    min.z = byte.getFloat32();
    const max: Vector3 = navData._boundBox.max;
    max.x = byte.getFloat32();
    max.y = byte.getFloat32();
    max.z = byte.getFloat32();
    let navCount: number = byte.readUint16();
    for (var i = 0; i < navCount; i++) {
        let nav = navData._oriTiles[i] = new NavTileCache();
        const bound = nav._bound;
        const min = bound.min;
        min.x = byte.getFloat32();
        min.y = byte.getFloat32();
        min.z = byte.getFloat32();
        const max = bound.max
        max.x = byte.getFloat32();
        max.y = byte.getFloat32();
        max.z = byte.getFloat32();

        nav.x = byte.readUint16();
        nav.y = byte.readUint16();
        let vertStart = byte.readUint32();
        let vertCount = byte.readUint32();
        let indexStart = byte.readUint32();
        let indexCount = byte.readUint32();
        let flagStart = byte.readUint32();
        let flagCount = byte.readUint32();
        byte.pos = vertStart;
        nav.triVertex = new Float32Array(byte.readArrayBuffer(vertCount));
        byte.pos = indexStart;
        nav.triIndex = new Uint32Array(byte.readArrayBuffer(indexCount))
        byte.pos = flagStart;
        nav.triFlag = new Uint8Array(byte.readArrayBuffer(flagCount));
    }
}

export class NavTileCache {
    /**
     * @internal
     */
    _bindData: any;
    /**
     * @internal
     */
    _triVertex: Float32Array;
    /**
     * @internal
     */
    _triIndex: Uint32Array;
    /**
     * @internal
     */
    _triFlag: Uint8Array;

    /** @internal tile bounds */
    _bound: Bounds;
    /** tile offset */
    x: number;
    y: number;


    constructor() {
        this._bindData = NavigationUtils.createdtNavTileData();
        this._bound = new Bounds(new Vector3(), new Vector3());
        this.x = this.y = 0;
    }

    /**三角形顶点 */
    set triVertex(data: Float32Array) {
        this._triVertex = data;
        this._bindData.setTriVertex(data);
    }

    get triVertex(): Float32Array {
        return this._triVertex;
    }

    /**三角形索引 */
    set triIndex(data: Uint32Array) {
        this._triIndex = data;
        this._bindData.setTriIndex(data);
    }

    get triIndex(): Uint32Array {
        return this._triIndex;
    }

    /**三角形标记 */
    set triFlag(data: Uint8Array) {
        this._triFlag = data;
        this._bindData.setTriFlag(data);
    }

    get triFlag(): Uint8Array {
        return this._triFlag;
    }


    /**
     * 包围盒大小
     */
    get bound(): Bounds {
        return this._bound;
    }

    /**
     * 绑定数据
     * @returns any
     */
    get bindData(): any {
        return this._bindData;
    }

    destroy(): void {
        if (this._bindData) {
            NavigationUtils.free(this._bindData);
            this._bindData = null;
        }
    }

}

export class NavTileData {
    /**@internal load*/
    _dirtyFlag: number = 0;
    /**@internal load*/
    _oriTiles: Array<NavTileCache>;
    /**@internal load*/
    _res: TextResource;
    /**@internal load*/
    _boundBox: Bounds;
    constructor(res: TextResource) {
        this._boundBox = new Bounds(new Vector3(), new Vector3());
        this._res = res;
        this._oriTiles = [];
        this._parse();
    }
    /**@internal load*/
    _parse() {
        var readData: Byte = new Byte(this._res.data);
        readData.pos = 0;
        var version: string = readData.readUTFString();
        switch (version) {
            case "LAYANAV:0101":
                readNavTileCache(readData, this);
                break;
        }
    }

    get dirtyFlag(): number {
        return this._dirtyFlag;
    }
    public getNavData(index: number): NavTileCache {
        return this._oriTiles[index];
    }

    public get length(): number {
        return this._oriTiles.length;
    }
}