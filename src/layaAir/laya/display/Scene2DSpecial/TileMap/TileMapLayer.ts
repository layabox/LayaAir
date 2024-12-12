
import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { Context } from "../../../renders/Context";
import { Material } from "../../../resource/Material";
import { Sprite } from "../../Sprite";
import { Grid } from "./Grid/Grid";
import { TileMapChunk } from "./TileMapChunk";
import { TileMapChunkData } from "./TileMapChunkData";
import { TileMapShaderInit } from "./TileMapShader/TileMapShaderInit";
import { TileSet } from "./TileSet";
import { TileMapPhysics } from "./TileMapPhysics";
import { TileSetCellData } from "./TileSetCellData";
import { Matrix } from "../../../maths/Matrix";
import { Laya } from "../../../../Laya";
import { Rectangle } from "../../../maths/Rectangle";
import { RectClipper } from "./RectClipper";
import { Texture2D } from "../../../resource/Texture2D";
import { TileMapDatasParse } from "./loaders/TileSetAssetLoader";
import { NodeFlags } from "../../../Const";
import { TileLayerSortMode } from "./TileMapEnum";
import { TileMapOccluder } from "./TileMapOccluder";

export enum TILELAYER_SORTMODE {
    YSort,
    ZINDEXSORT,
    XSort
}

export enum TILEMAPLAYERDIRTYFLAG {
    CELL_CHANGE = 1 << 0,//add remove create...
    CELL_COLOR = 1 << 1,//a_color
    CELL_QUAD = 1 << 2,//a_quad xy offset,zw extend
    CELL_QUADUV = 1 << 3,//a_UV xy offset,zw extend
    CELL_UVTRAN = 1 << 4,
    CELL_PHYSICS = 1 << 5,
    CELL_TERRAIN = 1 << 6,
    CELL_LIGHTSHADOW = 1 << 7,
    CELL_NAVIGATION = 1 << 8,
    CELL_SORTCHANGE = 1 << 9,
    TILESET_SAZE = 1 << 10,
    LAYER_COLOR = 1 << 11,
    LAYER_PHYSICS = 1 << 12,
}

const TempRectange: Rectangle = new Rectangle();
const TempMatrix: Matrix = new Matrix();
const TempVector2_1: Vector2 = new Vector2();
const TempVector2_2: Vector2 = new Vector2();
export class TileMapLayer extends BaseRenderNode2D {

    private static _inited = false;

    /**
     * @internal
     * @returns 
     */
    static __init__(): void {
        if (TileMapLayer._inited) return;
        this._inited = true;
        TileMapShaderInit.__init__();
        TileMapPhysics.__init__();
    }

    private _tileSet: TileSet;

    /**
     * @internal
     * 工具类；用于计算格子所在的大块
     */
    _chunk: TileMapChunk;

    /**
     * @internal
     * 工具类；实现像素坐标和格子坐标的转换
     */
    _grid: Grid;


    declare owner: Sprite;
    /**
     * @internal
     */
    _cliper: RectClipper;

    private _layerColor: Color = new Color();

    private _sortMode: TileLayerSortMode;

    private _renderTileSize: number = 32;

    private _navigationEnable: boolean;

    private _physicsEnable: boolean;

    private _lightEnable: boolean;

    private _tileMapDatas: Uint8Array;

    private _chunkDatas: Record<number, Record<number, TileMapChunkData>>;//数据结构需要改成好裁剪的方式TODO

    /**物理模块 */
    private _tileMapPhysics: TileMapPhysics;

    private _tileMapOccluder:TileMapOccluder;

    /** @internal */
    get chunkDatas() {
        return this._chunkDatas;
    }

    set chunkDatas(datas: Record<number, Record<number, TileMapChunkData>>) {
        this._chunkDatas = datas;
        if (datas) {
            for (const col in datas) {
                let chunkDatas = datas[col];
                for (const row in chunkDatas) {
                    let chunkData = chunkDatas[row];
                    chunkData._tileLayer = this;
                    chunkData._updateChunkData(chunkData.chunkX, chunkData.chunkY);
                    chunkData._parseCellDataRefMap();
                }
            }
        }
    }

    get layerColor(): Color {
        return this._layerColor;
    }

    set layerColor(value: Color) {
        value.cloneTo(this._layerColor);
        if (this._grid._updateColor(value) && this._tileSet) {
            this._grid._updateBufferData();
        }
    }

    get sortMode(): TileLayerSortMode {
        return this._sortMode;
    }

    set sortMode(value: TileLayerSortMode) {
        this._sortMode = value;
    }

    get navigationEnable(): boolean {
        return this._navigationEnable;
    }

    set navigationEnable(value: boolean) {
        this._navigationEnable = value;
    }

    get physicsEnable(): boolean {
        return this._physicsEnable;
    }

    set physicsEnable(value: boolean) {
        this._tileMapPhysics.updateState(value);
        this._physicsEnable = value;
    }

    get lightEnable(): boolean {
        return this._lightEnable;
    }

    set lightEnable(value: boolean) {
        this._tileMapOccluder.updateState(value);
        this._lightEnable = value;
    }

    get tileSet(): TileSet {
        return this._tileSet;
    }

    set tileSet(value: TileSet) {
        if (this._tileSet == value) {
            return;
        }
        if (this._tileSet)
            this._tileSet._removeOwner(this);
        this._tileSet = value;
        if (value) {
            this.tileSet._addOwner(this);
            this._initialTileSet();
        }
    }

    get renderTileSize(): number {
        return this._renderTileSize;
    }

    set renderTileSize(value: number) {
        if (this._renderTileSize === value) return;
        this._renderTileSize = value;
        this._updateChunkData();
    }

    get tileMapDatas(): Uint8Array {
        return this._tileMapDatas;
    }

    set tileMapDatas(value: Uint8Array) {
        this._tileMapDatas = value;
    }

    get tileMapPhysics(): TileMapPhysics {
        return this._tileMapPhysics;
    }

    get tileMapOccluder(): TileMapOccluder {
        return this._tileMapOccluder;
    }

    constructor() {
        super();
        this._layerColor = new Color(1, 1, 1, 1);
        this._chunkDatas = []
        this._grid = new Grid();
        this._chunk = new TileMapChunk(this._grid);
        this._chunk._setChunkSize(this._renderTileSize, this._renderTileSize);
        this._tileMapPhysics = new TileMapPhysics(this);
        this._tileMapOccluder = new TileMapOccluder(this);
        this._cliper = new RectClipper();
        this._renderElements = [];
        this._materials = [];
    }

    private _initialTileSet() {
        //config grid
        this._grid._updateTileShape(this._tileSet.tileShape, this._tileSet.tileSize);
        this._grid._updateColor(this._layerColor);
        this._grid._updateBufferData();

        //删除非法的数据
    }

    /**
     * 修改renderTileSize 会触发此函数
     * 将所有的 TileMapChunkData 合并到一个二维表格中；同时计算所有格子的范围
     * 根据范围重新生成 TileMapChunkData
     */
    private _updateChunkData() {
        const minVec = TempVector2_1;
        minVec.setValue(Number.MAX_VALUE, Number.MAX_VALUE);
        const maxVec = TempVector2_2;
        maxVec.setValue(-Number.MIN_VALUE, -Number.MIN_VALUE);

        let mergeDatas = new Map<number, Map<number, TileSetCellData>>();
        // let orginLength = 0;
        let allDatas: TileMapChunkData[] = [];

        for (const col in this._chunkDatas) {
            let chunkDatas = this._chunkDatas[col];
            for (const row in chunkDatas) {
                let chunkData = chunkDatas[row];
                chunkData._tileLayer = this;
                chunkData._updateChunkData(chunkData.chunkX, chunkData.chunkY);
                chunkData._parseCellDataRefMap();
            }
        }

        let tileSize = this._renderTileSize;
        this._chunk._setChunkSize(tileSize, tileSize);
        if (minVec.x > maxVec.x || minVec.y > maxVec.y) { return; }

        this._chunkDatas = [];
        const tempVec3 = Vector3.TEMP;
        this._chunk._getChunkPosByCell(minVec.x, minVec.y, tempVec3);
        let startRow = tempVec3.x;
        let startCol = tempVec3.y;
        this._chunk._getChunkPosByCell(maxVec.x, maxVec.y, tempVec3);
        let endRow = tempVec3.x;
        let endCol = tempVec3.y;

        // let sum = 0;
        for (var j = startCol; j <= endCol; j++) {
            for (var i = startRow; i <= endRow; i++) {
                let chunkData = allDatas.pop() || new TileMapChunkData();
                chunkData._tileLayer = this;
                chunkData._updateChunkData(i, j);
                let mark = chunkData._setBuffer(mergeDatas, minVec, maxVec, tileSize);
                if (mark) {
                    // sum += mark;
                    this._setLayerDataByPos(chunkData);
                } else {
                    allDatas.push(chunkData);
                }
            }
        }

        allDatas.forEach(data => data._destroy());
    }

    /**
     * @internal
     */
    _updateMapDatas() {
        if (this._tileMapDatas == null || !this._tileMapDatas.length) { return; }
        let chunks = TileMapDatasParse.read(this._tileMapDatas);
        for (var i = 0, len = chunks.length; i < len; i++) {
            let data = new TileMapChunkData();
            data._tileLayer = this;
            data._setRenderData(chunks[i]);
            this._setLayerDataByPos(data);
        }
    }

    /**
     * @internal
     * @param tile 
     */
    _setLayerDataByPos(tile: TileMapChunkData) {
        const chunkX = tile.chunkX;
        const chunkY = tile.chunkY;
        let rowData = this._chunkDatas[chunkY];
        if (!rowData) {
            rowData = [];
            this._chunkDatas[chunkY] = rowData;
        }
        rowData[chunkX] = tile;
    }


    /**
     * @internal
     */
    _getLayerDataTileByPos(chunkX: number, chunkY: number): TileMapChunkData {
        let rowData = this._chunkDatas[chunkY];
        if (!rowData) {
            rowData = [];
            this._chunkDatas[chunkY] = rowData;
        }
        let data = rowData[chunkX];
        if (!data) {
            data = new TileMapChunkData();
            data._tileLayer = this;
            data._updateChunkData(chunkX, chunkY);
            rowData[chunkX] = data;
        }
        return data;
    }

    onAwake(): void {
        super.onAwake();
        this._updateMapDatas();
    }


    onEnable(): void {
        super.onEnable();
        this.owner._setBit(NodeFlags.CACHE_GLOBAL, true);
        this._tileMapPhysics._enableRigidBodys();
        this._tileMapOccluder._activeAllOccluders();
    }

    onDisable(): void {
        super.onDisable();
        this._tileMapPhysics._disableRigidBodys();
        this._tileMapOccluder._removeAllOccluders();
    }

    onDestroy(): void {
        super.onDestroy();
        this._tileMapOccluder.destroy();
    }

    /**
     * @internal
     * @returns 
     */
    _globalTransfrom(): Matrix {
        return this.owner.getGlobalMatrix();
    }

    /**
     * @internal
     * @protected
     * cmd run时调用，可以用来计算matrix等获得即时context属性
     * @param context 
     * @param px 
     * @param py 
     */
    addCMDCall(context: Context, px: number, py: number): void {
        let mat = this._globalTransfrom();
        let vec3 = Vector3.TEMP;
        vec3.setValue(mat.a, mat.c, mat.tx);
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_0, vec3);

        vec3.setValue(mat.b, mat.d, mat.ty);
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_1, vec3);

        this._setRenderSize(context.width, context.height)
        context._copyClipInfoToShaderData(this._spriteShaderData);
    }

    /**
     * 根据相机和设置做裁剪;更新所有格子的渲染数据
     * @protected
     * @param context 
     */
    preRenderUpdate(context: IRenderContext2D): void {
        let tileSet = this._tileSet;
        if (tileSet == null) return;

        //更新TileSet 动画节点数据
        //tileSet._updateAnimaterionDatas();
        //根据相机位置和大小计算出需要渲染的区域
        const clipChuckMat = TempMatrix;
        const renderRect = TempRectange;
        let mat = this._globalTransfrom();

        let scene = this.owner.scene;
        let camera = scene._specialManager._mainCamera;
        if (camera == null) {
            renderRect.setTo(0, 0, Laya.stage.width, Laya.stage.height);
            mat.copyTo(clipChuckMat);
        } else {
            let rect = camera._rect;
            renderRect.setTo(rect.x, rect.y, rect.w - rect.x, rect.w - rect.y);
            let cameraMat = camera._getCameraTransform();
            var e: Float32Array = cameraMat.elements;
            clipChuckMat.a = e[0];
            clipChuckMat.b = e[1];
            clipChuckMat.c = e[3];
            clipChuckMat.d = e[4];
            clipChuckMat.tx = e[6];
            clipChuckMat.ty = e[7];
            Matrix.mul(mat, clipChuckMat, clipChuckMat);
        }
        let oneChuckSize = Vector2.TEMP;
        this._chunk._getChunkSize(oneChuckSize);

        //根据实际裁切框计算chunck矩阵的裁切框大小  返回 renderRect在Tilemap空间中的转换rect
        let chuckLocalRect = this._cliper.setClipper(renderRect, oneChuckSize, clipChuckMat, 0);

        this._renderElements.length = 0;

        let tileSize = this.tileSet.tileSize;

        let tempVec3 = Vector3.TEMP;
        this._chunk._getChunkPosByPixel(chuckLocalRect.x - tileSize.x, chuckLocalRect.y - tileSize.y, tempVec3);
        let chuckstartRow = tempVec3.x;
        let chuckstartCol = tempVec3.y;
        this._chunk._getChunkPosByPixel(chuckLocalRect.z + tileSize.x, chuckLocalRect.w + tileSize.y, tempVec3);
        let chuckendRow = tempVec3.x;
        let chuckendCol = tempVec3.y;

        let checkPoint = Vector2.TEMP;
        for (var j = chuckstartCol; j <= chuckendCol; j++) {
            if (!this._chunkDatas[j]) { continue; }
            let rowData = this._chunkDatas[j];
            for (var i = chuckstartRow; i <= chuckendRow; i++) {
                if (!rowData[i]) { continue; }
                this._chunk._getChunkLeftTop(i, j, checkPoint);
                if (!this._cliper.isClipper(checkPoint.x, checkPoint.y)) {
                    let chunkData = rowData[i];
                    chunkData._update();//更新数据
                    chunkData._mergeToElement(this._renderElements);//更新渲染元素
                }
            }
        }
    }

    /**
     * 添加一个格子
     * @param x 横向坐标
     * @param y 纵向坐标
     * @param cellData 格子数据
     * @param isPixel 是否是像素坐标 true: 像素坐标 false: 格子坐标
     */
    setCellData(x: number, y: number, cellData: TileSetCellData, isPixel: boolean = true) {
        //根据位置生成 TileMapChunkData
        //调用 TileMapChunkData._update
        //将生成的所有的renderelement2D添加到组件的renderElement
        if (cellData == null) return;
        let tempVec3 = Vector3.TEMP;
        if (isPixel) {
            this._chunk._getChunkPosByPixel(x, y, tempVec3);
        } else {
            this._chunk._getChunkPosByCell(x, y, tempVec3);
        }

        let chunkData = this._getLayerDataTileByPos(tempVec3.x, tempVec3.y);
        chunkData._setCell(tempVec3.z, cellData);
    }

    /**
     * 获取一个CellData数据
     * @param x 
     * @param y 
     * @param isPixel 是否是像素坐标 true: 像素坐标 false: 格子坐标
     */
    getCellData(x: number, y: number, isPixel = true) {
        let tempVec3 = Vector3.TEMP;
        if (isPixel) {
            this._chunk._getChunkPosByPixel(x, y, tempVec3);
        } else {
            this._chunk._getChunkPosByCell(x, y, tempVec3);
        }

        let rowData = this._chunkDatas[tempVec3.y];
        if (!rowData) return null;
        let data = rowData[tempVec3.x];
        if (!data) return null;
        return data.getCell(tempVec3.z);
    }

    /**
     * 移除一个格子 
     * @param x 横向坐标
     * @param y 纵向坐标
     * @param isPixel 是否是像素坐标 true: 像素坐标 false: 格子坐标
     */
    removeCell(x: number, y: number, isPixel: boolean = true) {
        let tempVec3 = Vector3.TEMP;
        if (isPixel) {
            this._chunk._getChunkPosByPixel(x, y, tempVec3);
        } else {
            this._chunk._getChunkPosByCell(x, y, tempVec3);
        }

        let chunkData = this._getLayerDataTileByPos(tempVec3.x, tempVec3.y);
        chunkData._removeCell(tempVec3.z);
    }

    /**
    * 像素系统转格子系统
    */
    pixelToGrid(pixelX: number, pixelY: number, out: Vector2) {
        this._grid._pixelToGrid(pixelX, pixelY, out);
    }

    /**
     * 格子系统转像素系统
     */
    gridToPixel(cellRow: number, cellCol: number, out: Vector2) {
        this._grid._gridToPixel(cellRow, cellCol, out);
    }


    getDefalutMaterial(texture: Texture2D): Material {
        return this.tileSet.getDefalutMaterial(texture);
    }

    // _darwTestPoint(points:number[]){
    //     let gsp = new Sprite;
    //     Laya.stage.addChild(gsp);
    //     let sprite = this.owner;
    //     let lastx = points[0];
    //     let lasty = points[1];
    //     for (let i = 2 , len = points.length; i < len; i+=2) {
    //         let p1x = points[i]; 
    //         let p1y = points[i + 1];
    //         gsp.graphics.drawLine(lastx ,lasty  , p1x, p1y , "#ff0000");
    //         lastx = p1x;
    //         lasty = p1y;
    //     }
    // }
}

Laya.addInitCallback(() => TileMapLayer.__init__());