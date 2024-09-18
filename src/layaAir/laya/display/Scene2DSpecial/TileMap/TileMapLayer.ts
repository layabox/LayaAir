import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IIndexBuffer } from "../../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { TileMapLayerRenderTile } from "./TileMapLayerRenderTile";
import { TileSet } from "./TileSet";
import { TileSetCellData } from "./TileSetCellData";
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



export class TileMapLayer extends BaseRenderNode2D {

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

    private _renderTileSize: number;
    public get renderTileSize(): number {
        return this._renderTileSize;
    }
    public set renderTileSize(value: number) {
        this._renderTileSize = value;
    }

    private _renderTile: TileMapLayerRenderTile[];//数据结构需要改成好裁剪的方式TODO


    _getBaseVertexBuffer(): IVertexBuffer {
        return null;//attribute pos  attribute color
    }

    _getBaseIndexBuffer(): IIndexBuffer {
        return null;
    }

    /**
     * 帧更新，可以放一些顶点更新，数据计算等
     * @protected
     * @param context 
     */
    preRenderUpdate(context: IRenderContext2D): void {
        //根据摄像机和设置做裁剪
        //获得所有需要渲染的
        //调用TileMapLayerRenderTile _updateTile
        //将生成的所有的renderelement2D添加到组件的renderElement
    }

    //add TODO注释
    setCellData(pos: Vector2, cellData: TileSetCellData) {
        //根据位置生成TileMapLayerRenderTile
        //调用TileMapLayerRenderTile _updateTile
        //将生成的所有的renderelement2D添加到组件的renderElement
    }

    setCellDataByTileSet(pos: Vector2, sourceID: number, sourceLocalPos: number, cellDataIndex: number) {

    }

    //remove TODO 注释
    removeCell(pos: Vector2) {

    }
}