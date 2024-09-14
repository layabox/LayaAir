import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { Material } from "../../../resource/Material";
import { TileAlternativesData } from "./TileAlternativeData";
import { TileMap_CustomDataVariant, TillMap_CellNeighbor } from "./TileMapEnum";
import { TILEMAPLAYERDIRTYFLAG } from "./TileMapLayer";
import { TileMapLayerRenderTile } from "./TileMapLayerRenderTile";
import { TileSet } from "./TileSet";


class TileSetCellData_Light {
    //根据light功能定义
}

class TileSetCellData_PhysicsInfo {
    //根据想实现的物理功能定义 
}

class TileSetCellData_NavigationInfo {
    //根据想实现的Navigation定义
}

class TileSetCellData_CustomData {
    type: TileMap_CustomDataVariant;
    value: number | boolean | string | Object;
}

/**
 * TileMap中一个Cell的数据结构
 */
export class TileSetCellData {

    private _cellowner: TileAlternativesData;

    private _flip_h: boolean = false;

    private _flip_v: boolean = false;

    private _transpose: boolean = false;

    private _texture_origin: Vector2;//单位像素

    private _material: Material;

    private _colorModulate: Color;

    private _z_index: number;

    private _y_sort_origin: number;

    private _lightOccluders: TileSetCellData_Light[];

    private _physics: TileSetCellData_PhysicsInfo[];

    private _customDatas: TileSetCellData_CustomData[];
    //是否有地形
    private _terrain_set: boolean;

    private _terrain_peering_bits: Uint16Array = new Uint16Array([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);

    private _notiveRenderTile: TileMapLayerRenderTile[];

    //随机值
    private _probability: number;

    public get cellowner(): TileAlternativesData {
        return this._cellowner;
    }

    public set cellowner(value: TileAlternativesData) {
        this._cellowner = value;
    }

    public get flip_h(): boolean {
        return this._flip_h;
    }

    public set flip_h(value: boolean) {
        this._flip_h = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN);
        TILEMAPLAYERDIRTYFLAG.CELL_QUADUV
    }

    public get flip_v(): boolean {
        return this._flip_v;
    }

    public set flip_v(value: boolean) {
        this._flip_v = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN);
    }

    public get transpose(): boolean {
        return this._transpose;
    }

    public set transpose(value: boolean) {
        this._transpose = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN);
    }

    public get texture_origin(): Vector2 {
        return this._texture_origin;
    }

    public set texture_origin(value: Vector2) {
        value.cloneTo(this._texture_origin);
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_QUAD);
    }

    public get material(): Material {
        return this._material;
    }

    public set material(value: Material) {
        this._material = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_CHANGE);
    }

    public get colorModulate(): Color {
        return this._colorModulate;
    }

    public set colorModulate(value: Color) {
        this._colorModulate = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_COLOR);
    }

    public get z_index(): number {
        return this._z_index;
    }

    public set z_index(value: number) {
        this._z_index = value;
        //TODO Flag Dirty
    }

    public get y_sort_origin(): number {
        return this._y_sort_origin;
    }

    public set y_sort_origin(value: number) {
        this._y_sort_origin = value;
        //TODO Flag dirty
    }

    public get terrain_set(): boolean {
        return this._terrain_set;
    }

    public set terrain_set(value: boolean) {
        this._terrain_set = value;
    }

    public get probability(): number {
        return this._probability;
    }
    public set probability(value: number) {
        this._probability = value;
    }

    //custom module
    constructor(owner: TileAlternativesData, index: number) {
        this._cellowner = owner;
        this._flip_h = false;
        this._flip_v = false;
        this.transpose = false;
        this._texture_origin = new Vector2();
        this._colorModulate = new Color(1, 1, 1, 1);
        this._z_index = 0;
        this._y_sort_origin = 0;
        this._terrain_set = false;
    }

    _notifyDataChange(data: TILEMAPLAYERDIRTYFLAG) {
        this._notiveRenderTile.forEach(element => {
            element._setDirtyFlag(this, data);
        });
    }

    _getPosOffset() {
        return this._texture_origin;//unit pixel
    }

    _removeNoticeRenderTile(layerRenderTile: TileMapLayerRenderTile) {
        let index = this._notiveRenderTile.indexOf(layerRenderTile);
        if (this._notiveRenderTile.indexOf(layerRenderTile) != -1)
            this._notiveRenderTile.splice(index, 1);
    }

    _addNoticeRenderTile(layerRenderTile: TileMapLayerRenderTile) {
        if (this._notiveRenderTile.indexOf(layerRenderTile) == -1) {
            this._notiveRenderTile.push(layerRenderTile);
        }
    }

    setLightOccluders(layerIndex: number, data: TileSetCellData_Light) {
        //TODO
    }

    _remove_lightOccluders(layerIndex: number) {
        //TODO
    }

    //move_lightOccluders 

    setPhysics(layerIndex: number, data: TileSetCellData_PhysicsInfo) {
        //TODO
    }

    _remove_physics(layerIndex: number, data: TileSetCellData_PhysicsInfo) {
        //TODO
    }


    set_terrainPeeringBits(index: TillMap_CellNeighbor, terrainIndex: number) {
        //TODO
    }

    get_terrainPeeringBits(index: TillMap_CellNeighbor) {
        //TODO
    }

    /**
     * @internal
     */
    _getterrainPeeringBits() {
        return this._terrain_peering_bits;
    }

    set_navigationData(layerIndex: number, data: TileSetCellData_NavigationInfo) {
        //TODO
    }

    //注释TODO
    _remove_navigations(layerIndex: number, data: TileSetCellData_NavigationInfo) {
        //TODO
    }

    //注释TODO
    set_custom_Data(name: string, value: number | boolean | string | Object) {
        //TODO
        //根据TileSet得到string的index，将Value赋值
    }

    //注释TODO
    get_custom_data(name: string) {
        //TODO
        //根据TileSet得到string的index，拿Value
    }

    //注释TODO
    set_CustomDatabyid(id: number, value: number | boolean | string | Object) {
        //TODO        
    }

    //注释TODO
    get_CustomDatabyid(id: number) {
        //TODO
    }

    /**
     * @internal
     */
    _get_CustomData() {
        return this._customDatas;
    }

    cloneTo(dst: TileSetCellData) {

    }

    //删除
    destroy() {
        this._notiveRenderTile.forEach(element => {
            element._clearOneCell(this);
        });
        //destroy data TODO
    }
}