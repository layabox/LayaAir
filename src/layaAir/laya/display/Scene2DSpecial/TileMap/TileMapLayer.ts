
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
import { TileMapPhysis } from "./TileMapPhysis";
import { TileSetCellData } from "./TileSetCellData";
import { Matrix } from "../../../maths/Matrix";
import { Laya } from "../../../../Laya";
import { Rectangle } from "../../../maths/Rectangle";
import { RectClipper } from "./RectClipper";

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
}

const TempRectange: Rectangle = new Rectangle();
const TempMatrix: Matrix = new Matrix();
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
        TileMapPhysis.__init__();
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


    /**
     * @internal
     */
    _cliper: RectClipper;

    private _layerColor: Color = new Color();

    private _sortMode: TILELAYER_SORTMODE;

    private _renderTileSize: number = 32;

    private _navigationEnable: boolean;

    private _physicsEnable: boolean;

    private _lightEnable: boolean;

    private _tileMapDatas: string[] = [];//TODO??

    private _chunkDatas: Map<number, Map<number, TileMapChunkData>>;//数据结构需要改成好裁剪的方式TODO

    private _physisDelayCreate: Set<TileMapChunkData>;

    /**物理模块 */
    private _tileMapPhysis: TileMapPhysis;

    get layerColor(): Color {
        return this._layerColor;
    }

    set layerColor(value: Color) {
        value.cloneTo(this._layerColor);
        if (this._grid._updateColor(value) && this._tileSet) {
            this._grid._updateBufferData();
        }
    }

    get sortMode(): TILELAYER_SORTMODE {
        return this._sortMode;
    }

    set sortMode(value: TILELAYER_SORTMODE) {
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
        this._physicsEnable = value;
    }

    get lightEnable(): boolean {
        return this._lightEnable;
    }

    set lightEnable(value: boolean) {
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

    //TODO??
    get tileMapDatas(): string[] {
        return this._tileMapDatas;
    }

    set tileMapDatas(value: string[]) {
        this._tileMapDatas = value;
    }

    get tileMapPhysis(): TileMapPhysis {
        return this._tileMapPhysis;
    }

    constructor() {
        super();
        this._layerColor = new Color(1, 1, 1, 1);
        this._chunkDatas = new Map<number, Map<number, TileMapChunkData>>();
        this._grid = new Grid();
        this._chunk = new TileMapChunk(this._grid);
        this._chunk._setChunkSize(this._renderTileSize, this._renderTileSize);
        this._tileMapPhysis = new TileMapPhysis(this);
        this._cliper = new RectClipper();
        this._renderElements = [];
        this._materials = [];
        this._physisDelayCreate = new Set();
    }

    private _initialTileSet() {
        //config grid
        this._grid._updateTileShape(this._tileSet.tileShape, this._tileSet.tileSize);
        this._grid._updateColor(this._layerColor);
        this._grid._updateBufferData();

        //删除非法的数据
    }

    /**
     * @private TODO
     * 修改renderTileSize 会触发此函数
     * 将所有的 TileMapChunkData 合并到一个二维表格中；同时计算所有格子的范围
     * 根据范围重新生成 TileMapChunkData
     */
    private _updateChunkData() {
        // const minVec = TempVector2;
        // minVec.setValue(Number.MAX_VALUE, Number.MAX_VALUE);
        // const maxVec = TempVector21;
        // maxVec.setValue(-Number.MIN_VALUE, -Number.MIN_VALUE);
        // let mergeDatas = new Map<number, Map<number, number>>();
        // let allDatas = []
        // this._chunkDatas.forEach((value, key) => {
        //     value.forEach((chunkData, key1) => {
        //         chunkData._mergeBuffer(mergeDatas, minVec, maxVec);
        //         allDatas.push(chunkData);
        //     });
        // });

        // this._chunk._setChunkSize(this._renderTileSize, this._renderTileSize);
        // if (minVec.x > maxVec.x || minVec.y > maxVec.y) { return; }
        // this._chunkDatas.clear();
        // const tempVec3 = Vector3._tempVector3;
        // this._chunk._getChunkPosByPixel(minVec.x, minVec.y, tempVec3);
        // let startRow = tempVec3.x;
        // let startCol = tempVec3.y;
        // this._chunk._getChunkPosByPixel(maxVec.x, maxVec.y, tempVec3);
        // let endRow = tempVec3.x;
        // let endCol = tempVec3.y;

        // let renderIndex = 0;
        // for (var j = startCol; j <= endCol; j++) {
        //     for (var i = startRow; i <= endRow; i++) {

        //         if (renderIndex >= allDatas.length) {
        //             allDatas.push(new TileMapChunkData(this, 0, 0));
        //         }
        //         let chunkData = allDatas[renderIndex];
        //         chunkData.updateChunkData(i, j);
        //         if (chunkData._setBuffer(mergeDatas, minVec, maxVec)) {
        //             this._setLayerDataByPos(chunkData);
        //             renderIndex++;
        //         }
        //     }
        // }
    }

    /**
     * @internal
     */
    _updateMapDatas() {
        if (this._tileMapDatas == null || this._tileMapDatas.length == 0) { return; }
        let length = this._tileMapDatas.length;
        for (var i = 0; i < length; i++) {
            let data = new TileMapChunkData(this, 0, 0);
            data._setRenderData(this._tileMapDatas[i]);
            this._setLayerDataByPos(data);
        }
    }

    /**
     * @internal
     * @param tile 
     */
    _setLayerDataByPos(tile: TileMapChunkData) {
        const chunkX = tile._chunkx;
        const chunkY = tile._chunky;
        if (!this._chunkDatas.has(chunkY)) {
            this._chunkDatas.set(chunkY, new Map<number, TileMapChunkData>());
        }
        this._chunkDatas.get(chunkY).set(chunkX, tile);
    }


    /**
     * @internal
     */
    _getLayerDataTileByPos(chunkX: number, chunkY: number): TileMapChunkData {
        if (!this._chunkDatas.has(chunkY)) {
            this._chunkDatas.set(chunkY, new Map<number, TileMapChunkData>());
        }
        let rowData = this._chunkDatas.get(chunkY);
        if (!rowData.has(chunkX)) {
            rowData.set(chunkX, new TileMapChunkData(this, chunkX, chunkY));
        }
        return rowData.get(chunkX);
    }


    onEnable(): void {
        super.onEnable();
        (<Sprite>this.owner).cacheGlobal = true;
        this._updateMapDatas();
        this._tileMapPhysis._createPhysics();
    }

    /**
     * @internal
     * @returns 
     */
    _globalTramsfrom(): Matrix {
        return (<Sprite>this.owner).getGlobalMatrix();
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
        let mat = this._globalTramsfrom();
        let vec3 = Vector3._tempVector3;
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
        let mat = this._globalTramsfrom();

        let scene = (<Sprite>this.owner).scene;
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
        let oneChuckSize = Vector2.TempVector2;
        this._chunk._getChunkSize(oneChuckSize);

        //根据实际裁切框计算chunck矩阵的裁切框大小  返回 renderRect在Tilemap空间中的转换rect
        let chuckLocalRect = this._cliper.setClipper(renderRect, oneChuckSize, clipChuckMat, 0);

        this._renderElements.length = 0;

        let tileSize = this.tileSet.tileSize;

        let tempVec3 = Vector3._tempVector3;
        this._chunk._getChunkPosByPixel(chuckLocalRect.x - tileSize.x, chuckLocalRect.y - tileSize.y, tempVec3);
        let chuckstartRow = tempVec3.x;
        let chuckstartCol = tempVec3.y;
        this._chunk._getChunkPosByPixel(chuckLocalRect.z + tileSize.x, chuckLocalRect.w + tileSize.y, tempVec3);
        let chuckendRow = tempVec3.x;
        let chuckendCol = tempVec3.y;

        let checkPoint = Vector2.TempVector2;
        for (var j = chuckstartCol; j <= chuckendCol; j++) {
            if (!this._chunkDatas.has(j)) { continue; }
            let rowData = this._chunkDatas.get(j);
            for (var i = chuckstartRow; i <= chuckendRow; i++) {
                if (!rowData.has(i)) { continue; }
                this._chunk._getChunkLeftTop(i, j, checkPoint);
                if (!this._cliper.isClipper(checkPoint.x, checkPoint.y)) {
                    let chunkData = rowData.get(i);
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
        let tempVec3 = Vector3._tempVector3;
        if (isPixel) {
            this._chunk._getChunkPosByPixel(x, y, tempVec3);
        } else {
            this._chunk._getChunkPosByCell(x, y, tempVec3);
        }

        let chunkData = this._getLayerDataTileByPos(tempVec3.x, tempVec3.y);
        chunkData._setCell(tempVec3.z, cellData);
    }

    /**
     * 移除一个格子 
     * @param x 横向坐标
     * @param y 纵向坐标
     * @param isPixel 是否是像素坐标 true: 像素坐标 false: 格子坐标
     */
    removeCell(x: number, y: number, isPixel: boolean = true) {
        let tempVec3 = Vector3._tempVector3;
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
    piexToGrid(pixelX: number, pixelY: number, out: Vector2) {
        this._grid._pixelToGrid(pixelX, pixelY, out);
    }

    /**
     * 格子系统转像素系统
     */
    gridToPixel(cellRow: number, cellCol: number, out: Vector2) {
        this._grid._gridToPixel(cellRow, cellCol, out);
    }


    getDefalutMaterial(atlas: string): Material {
        return this.tileSet.getDefalutMaterial(atlas);
    }

}

Laya.addInitCallback(() => TileMapLayer.__init__());