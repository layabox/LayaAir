
import { Color } from "../../../maths/Color";
import { Point } from "../../../maths/Point";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IIndexBuffer } from "../../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Context } from "../../../renders/Context";
import { Material } from "../../../resource/Material";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { Sprite } from "../../Sprite";
import { Grid } from "./Grid/Grid";
import { TileMapChunk } from "./TileMapChunk";
import { TileMapLayerRenderTile } from "./TileMapLayerRenderTile";
import { TileMapShaderInit } from "./TileMapShader/TileMapShaderInit";
import { TileSet } from "./TileSet";
import { TileMapPhysis } from "./TileMapPhysis";
import { TileSetCellData } from "./TileSetCellData";
import { Matrix } from "../../../maths/Matrix";
import { TileMapUtils } from "./TileMapUtils";
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



const TempVector2: Vector2  = new Vector2();
const TempVector21: Vector2  = new Vector2();
const TempRectange: Rectangle  = new Rectangle();
const TempMatrix: Matrix = new Matrix();
export class TileMapLayer extends BaseRenderNode2D {

    static _inited = false;

    static __init__(): void {
        if (TileMapLayer._inited) return;
        this._inited = true;
        TileMapLayerRenderTile._initDeclaration_();
        TileMapShaderInit.__init__();
        TileMapPhysis.__init__();
    }



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

    private _layerColor: Color;


    public get layerColor(): Color {
        return this._layerColor;
    }
    public set layerColor(value: Color) {
        this._layerColor = value;
    }
    private _sortMode: TILELAYER_SORTMODE;
    public get sortMode(): TILELAYER_SORTMODE {
        return this._sortMode;
    }
    public set sortMode(value: TILELAYER_SORTMODE) {
        this._sortMode = value;
    }

    private _navigationEnable: boolean;
    public get navigationEnable(): boolean {
        return this._navigationEnable;
    }
    public set navigationEnable(value: boolean) {
        this._navigationEnable = value;
    }
    private _physicsEnable: boolean;
    public get physicsEnable(): boolean {
        return this._physicsEnable;
    }
    public set physicsEnable(value: boolean) {
        this._physicsEnable = value;
    }
    private _lightEnable: boolean;
    public get lightEnable(): boolean {
        return this._lightEnable;
    }
    public set lightEnable(value: boolean) {
        this._lightEnable = value;
    }
    private _tileSet: TileSet;
    public get tileSet(): TileSet {
        return this._tileSet;
    }
    public set tileSet(value: TileSet) {
        this._tileSet = value;
    }

    private _renderTileSize: number = 32;
    public get renderTileSize(): number {
        return this._renderTileSize;
    }
    public set renderTileSize(value: number) {
        if (this._renderTileSize === value) return;
        this._renderTileSize = value;
        this._updateChunkData();
    }

    private _tileMapDatas: string[] = [];

    public get tileMapDatas(): string[] {
        return this._tileMapDatas;
    }

    public set tileMapDatas(value: string[]) {
        this._tileMapDatas = value;
    }

    private _renderTile: Map<number, Map<number, TileMapLayerRenderTile>>;//数据结构需要改成好裁剪的方式TODO

    /**
     * @internal
     * 物理模块
     */
    private _tileMapPhysis: TileMapPhysis;
    constructor() {
        super();
        this._layerColor = new Color(1, 1, 1, 1);
        this._renderTile = new Map<number, Map<number, TileMapLayerRenderTile>>();
        this._grid = new Grid();
        this._chunk = new TileMapChunk(this._grid);
        this._chunk.setChunkSize(this._renderTileSize, this._renderTileSize);
        this._tileMapPhysis = new TileMapPhysis(this);
        this._cliper = new RectClipper();
        this._renderElements = [];
        this._materials = [];
    }


    get tileMapPhysis(): TileMapPhysis {
        return this._tileMapPhysis;
    }


    /**
     * @private
     * 修改renderTileSize 会触发此函数
     * 将所有的TileMapLayerRenderTile合并到一个二维表格中；同时计算所有格子的范围
     * 根据范围重新生成TileMapLayerRenderTile
     */
    private _updateChunkData() {
        const minVec = TempVector2;
        minVec.setValue(Number.MAX_VALUE, Number.MAX_VALUE);
        const maxVec = TempVector21;
        maxVec.setValue(-Number.MIN_VALUE, -Number.MIN_VALUE);
        let mergeDatas = new Map<number, Map<number, number>>();
        let allRenders = []
        this._renderTile.forEach((value, key) => {
            value.forEach((renderTile, key1) => {
                renderTile._mergeBuffer(mergeDatas, minVec, maxVec);
                allRenders.push(renderTile);
            });
        });
        this._chunk.setChunkSize(this._renderTileSize, this._renderTileSize);
        if (minVec.x > maxVec.x || minVec.y > maxVec.y) { return; }
        this._renderTile.clear();
        const tempVec3 = Vector3._tempVector3;
        this._chunk.getChunkPosByPiexl(minVec.x, minVec.y, tempVec3);
        let startRow = tempVec3.x;
        let startCol = tempVec3.y;
        this._chunk.getChunkPosByPiexl(maxVec.x, maxVec.y, tempVec3);
        let endRow = tempVec3.x;
        let endCol = tempVec3.y;

        let renderIndex = 0;
        for (var j = startCol; j <= endCol; j++) {
            for (var i = startRow; i <= endRow; i++) {

                if (renderIndex >= allRenders.length) {
                    allRenders.push(new TileMapLayerRenderTile(this, 0, 0));
                }
                let renderTile = allRenders[renderIndex];
                renderTile.updateRenderTileSize(i, j);
                if (renderTile._setBuffer(mergeDatas, minVec, maxVec)) {
                    this._setLayerRenderTileByPos(renderTile);
                    renderIndex++;
                }
            }
        }

    }

    /**
     * @internal
     */
    _updateMapDatas() {
        if (this._tileMapDatas == null || this._tileMapDatas.length == 0) { return; }
        let length = this._tileMapDatas.length;
        for (var i = 0; i < length; i++) {
            let tile = new TileMapLayerRenderTile(this, 0, 0);
            tile._setRenderData(this._tileMapDatas[i]);
            this._setLayerRenderTileByPos(tile);
        }
    }

    /**
     * @internal
     * @param tile 
     */
    _setLayerRenderTileByPos(tile: TileMapLayerRenderTile) {
        const chunkX = tile._chunkx;
        const chunkY = tile._chunky;
        if (!this._renderTile.has(chunkY)) {
            this._renderTile.set(chunkY, new Map<number, TileMapLayerRenderTile>());
        }
        this._renderTile.get(chunkY).set(chunkX, tile);
    }


    /**
     * @internal
     */
    _getLayerRenderTileByPos(chunkX: number, chunkY: number): TileMapLayerRenderTile {
        if (!this._renderTile.has(chunkY)) {
            this._renderTile.set(chunkY, new Map<number, TileMapLayerRenderTile>());
        }
        let rowData = this._renderTile.get(chunkY);
        if (!rowData.has(chunkX)) {
            rowData.set(chunkX, new TileMapLayerRenderTile(this, chunkX, chunkY));
        }
        return rowData.get(chunkX);
    }

    /**
     * @internal
     */
    _getBaseVertexBuffer(): IVertexBuffer {
        return this._grid.getBaseVertexBuffer();
    }

    /**
     * @internal
     */
    _getBaseIndexBuffer(): IIndexBuffer {
        return this._grid.getBaseIndexBuffer();
    }

    /**
     * @internal
     */
    _getBaseIndexCount(): number {
        return this._grid.getBaseIndexCount();
    }

    /**
     * @internal
     */
    _getBaseIndexFormat(): number {
        return this._grid.getBaseIndexFormat();
    }


    onEnable(): void {
        super.onEnable();
        (<Sprite>this.owner).cacheGlobal = true;
        this._updateMapDatas();
        this._tileMapPhysis._createPhysics();
    }

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
        this._grid._updateConfig(this);
        //更新TileSet 动画节点数据
        this._tileSet._updateAnimaterionDatas();
        //根据相机位置和大小计算出需要渲染的区域
        const tempMat = TempMatrix;
        const tempRect = TempRectange;
        let mat = this._globalTramsfrom();

        let scene = (<Sprite>this.owner).scene;
        let camera = scene._specialManager._mainCamera;
        if (camera == null) {
            tempRect.setTo(0, 0, Laya.stage.width, Laya.stage.height);
            mat.copyTo(tempMat);
        } else {
            let rect = camera._rect;
            tempRect.setTo(rect.x, rect.y, rect.w - rect.x, rect.w - rect.y);
            let cameraMat = camera._getCameraTransform();
            var e: Float32Array = cameraMat.elements;
            tempMat.a = e[0];
            tempMat.b = e[1];
            tempMat.c = e[3];
            tempMat.d = e[4];
            tempMat.tx = e[6];
            tempMat.ty = e[7];
            Matrix.mul(mat, tempMat, tempMat);
        }
        let tempVec = Vector2.TempVector2;
        this._chunk.getChunkSize(tempVec);

        this._cliper.setClipper(tempRect, tempVec, tempMat, 0);
        this._renderElements.length = 0;

        let ploygRect = this._cliper.getploygRect();

        let tileSize = this.tileSet.tileSize;
        let tempVec3 = Vector3._tempVector3;
        this._chunk.getChunkPosByPiexl(ploygRect.x - tileSize.x, ploygRect.y - tileSize.y, tempVec3);
        let startRow = tempVec3.x;
        let startCol = tempVec3.y;
        this._chunk.getChunkPosByPiexl(ploygRect.z + tileSize.x, ploygRect.w + tileSize.y, tempVec3);
        let endRow = tempVec3.x;
        let endCol = tempVec3.y;

        for (var j = startCol; j <= endCol; j++) {
            if (!this._renderTile.has(j)) { continue; }
            let rowData = this._renderTile.get(j);
            for (var i = startRow; i <= endRow; i++) {
                if (!rowData.has(i)) { continue; }
                this._chunk.getChunkLeftTop(i, j, tempVec);
                if (!this._cliper.isClipper(tempVec.x, tempVec.y)) {
                    let renderTile = rowData.get(i);
                    renderTile._mergeToElement(this._renderElements);
                }
            }
        }
    }

    /**
     * 添加一个格子
     * @param x 横向坐标
     * @param y 纵向坐标
     * @param cellData 格子数据
     * @param ispixel 是否是像素坐标 true: 像素坐标 false: 格子坐标
     */
    setCellData(x: number, y: number, cellData: TileSetCellData, ispixel: boolean = true) {
        //根据位置生成TileMapLayerRenderTile
        //调用TileMapLayerRenderTile _updateTile
        //将生成的所有的renderelement2D添加到组件的renderElement
        if (cellData == null) return;
        let tempVec3 = Vector3._tempVector3;
        if (ispixel) {
            this._chunk.getChunkPosByPiexl(x, y, tempVec3);
        } else {
            this._chunk.getChunkPosByCell(x, y, tempVec3);
        }

        let renderTile = this._getLayerRenderTileByPos(tempVec3.x, tempVec3.y);
        renderTile._updateCellGid(tempVec3.z, cellData.getGid());
    }

    /**
     * 移除一个格子 
     * @param x 横向坐标
     * @param y 纵向坐标
     * @param ispixel 是否是像素坐标 true: 像素坐标 false: 格子坐标
     */
    removeCell(x: number, y: number, ispixel: boolean = true) {
        let tempVec3 = Vector3._tempVector3;
        if (ispixel) {
            this._chunk.getChunkPosByPiexl(x, y, tempVec3);
        } else {
            this._chunk.getChunkPosByCell(x, y, tempVec3);
        }

        let renderTile = this._getLayerRenderTileByPos(tempVec3.x, tempVec3.y);
        renderTile._removeCell(tempVec3.z);
    }

    /**
    * 像素系统转格子系统
    */
    piexToGrid(pixelX: number, pixelY: number, out: Vector2) {
        this._grid.piexToGrid(pixelX, pixelY, out);
    }

    /**
     * 格子系统转像素系统
     */
    gridToPiex(cellRow: number, cellCol: number, out: Vector2) {
        this._grid.gridToPiex(cellRow, cellCol, out);
    }

   
    getDefalutMaterial(atlas: string): Material {
        return this.tileSet.getDefalutMaterial(atlas);
    }

}