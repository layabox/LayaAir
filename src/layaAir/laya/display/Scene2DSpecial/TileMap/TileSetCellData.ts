//@~AXIE:2.2
import { TileMapUtils } from "./TileMapUtils";
import { TileAlternativesData } from "./TileAlternativesData";
import { TillMap_CellNeighbor } from "./TileMapEnum";
import { TILEMAPLAYERDIRTYFLAG } from "./TileMapLayer";
import { TileMapChunkData } from "./TileMapChunkData";
import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { Material } from "../../../resource/Material";
import { TileSetCell_CustomDataInfo, TileSetCell_LightInfo, TileSetCell_NavigationInfo, TileSetCell_PhysicsInfo } from "./TileSetInfos";

/**
 * TileMap中一个Cell的数据结构
 */

export class TileSetCellData {

    private _index: number = 0;
    private _cellowner: TileAlternativesData;

    private _flip_h: boolean = false;

    private _flip_v: boolean = false;

    private _transpose: boolean = false;

    private _rotateCount: number = 0;

    private _texture_origin: Vector2;//单位像素

    private _material: Material;

    private _colorModulate: Color;

    private _z_index: number;

    private _y_sort_origin: number;

    ////////多级数据
    private _lightOccluderDatas: TileSetCell_LightInfo[];

    private _navigationDatas:TileSetCell_NavigationInfo[];

    private _physicsDatas: TileSetCell_PhysicsInfo[];

    private _customDatas: TileSetCell_CustomDataInfo[];

    //是否有地形
    private _terrain_set: boolean;

    private _terrain_peering_bits: Uint16Array = new Uint16Array([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);

    private _notiveRenderTile: TileMapChunkData[];

    //贴图旋转矩阵
    _transData: Vector4 = new Vector4();

    //随机值
    private _probability: number = 1;

    /**
     * 原始顶点图块的引用
     */
    public get cellowner(): TileAlternativesData {
        return this._cellowner;
    }

    public set cellowner(value: TileAlternativesData) {
        this._cellowner = value;
    }

    /**
     *  是否垂直翻转
     */
    public get flip_h(): boolean {
        return this._flip_h;
    }

    public set flip_h(value: boolean) {
        this._flip_h = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN);
    }

    /**
     * 是否水平翻转
     */
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

    /**
     * 是否转置
     */
    public set transpose(value: boolean) {
        this._transpose = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN);
    }

    /**
     * 旋转次数
     */
    public get rotateCount(): number {
        return this._rotateCount;
    }

    public set rotateCount(value: number) {
        this._rotateCount = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN);
    }

    /**
     * 贴图原点
     */
    public get texture_origin(): Vector2 {
        return this._texture_origin;
    }

    public set texture_origin(value: Vector2) {
        value.cloneTo(this._texture_origin);
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_QUAD);
    }

    /**
     * 材质
     */
    public get material(): Material {
        return this._material;
    }

    public set material(value: Material) {
        this._material = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_CHANGE);
    }

    /**
     * 颜色
     */
    public get colorModulate(): Color {
        return this._colorModulate;
    }

    public set colorModulate(value: Color) {
        this._colorModulate = value;
        this._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_COLOR);
    }

    /**
     * 生成地形时概率
     */
    public get probability(): number {
        return this._probability;
    }
    public set probability(value: number) {
        this._probability = value;
    }

    /**
     * z_index
     */
    public get z_index(): number {
        return this._z_index;
    }

    public set z_index(value: number) {
        this._z_index = value;
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

    public get physicsDatas() {
        return this._physicsDatas;
    }

    public get lightOccluderDatas() {
        return this._lightOccluderDatas;
    }

    public get customDatas() {
        return this._customDatas;  
    }

    public get navigationDatas() {
        return this._navigationDatas;
    }

    //custom module
    constructor() {
        this._notiveRenderTile = [];
        this._flip_h = false;
        this._flip_v = false;
        this._transpose = false;
        this._rotateCount = 0;
        this._texture_origin = new Vector2();
        this._colorModulate = new Color(1, 1, 1, 1);
        this._z_index = 0;
        this._y_sort_origin = 0;
        this._terrain_set = false;
    }
 
    /**
     * 初始化引用数据
     * @param owner 
     * @param index 
     */
    __init(owner: TileAlternativesData, index: number) {
        this._index = index;
        this._cellowner = owner;
    }
 
    public getGid(): number {
        return TileMapUtils.getGid(this._index, this._cellowner.getId());
    }
 
    _notifyDataChange(data: number) {
        if (!this.cellowner) return;
        let tileshape = this.cellowner.owner._owner.tileShape;
        let out = TileMapUtils.getUvRotate(tileshape, this._flip_v, this._flip_h, this._transpose, this._rotateCount);
        out.cloneTo(this._transData);
        this._notiveRenderTile.forEach(element => {
            element._setDirtyFlag(this.getGid(), data);
        });
    }

    _removeNoticeRenderTile(layerRenderTile: TileMapChunkData) {
        let index = this._notiveRenderTile.indexOf(layerRenderTile);
        if (index != -1)
            this._notiveRenderTile.splice(index, 1);
    }

    _addNoticeRenderTile(layerRenderTile: TileMapChunkData) {
        if (this._notiveRenderTile.indexOf(layerRenderTile) == -1) {
            this._notiveRenderTile.push(layerRenderTile);
        }
    }

    set_lightOccluder(layerIndex: number, data: TileSetCell_LightInfo) {
        //TODO
        this._lightOccluderDatas[layerIndex] = data;
    }

    get_lightOccluder(layerIndex:number):TileSetCell_LightInfo{
        return this._lightOccluderDatas[layerIndex];
    }

    set_terrainPeeringBit(index: TillMap_CellNeighbor, terrainIndex: number) {
        this._terrain_peering_bits[index] = terrainIndex;
    }

    get_terrainPeeringBit(index: TillMap_CellNeighbor) {
        return this._terrain_peering_bits[index];
    }

    set_physicsData(layerIndex:number , data:TileSetCell_PhysicsInfo){
        this._physicsDatas[layerIndex] = data;
    }

    get_physicsData(layerIndex:number):TileSetCell_PhysicsInfo{
        return this._physicsDatas[layerIndex];
    }

    /**
     * @internal
     */
    _getterrainPeeringBits() {
        return this._terrain_peering_bits;
    }

    set_navigationData(layerIndex: number, data: TileSetCell_NavigationInfo) {
        this._navigationDatas[layerIndex] = data;
    }

    get_navigationData(layerIndex:number):TileSetCell_NavigationInfo{
        return this._navigationDatas[layerIndex];
    }

    //注释TODO
    set_customData(name: string, value: any) {
        //TODO
        //根据TileSet得到string的index，将Value赋值
    }

    //注释TODO
    get_customData(name: string) {
        //TODO
        //根据TileSet得到string的index，拿Value
    }

    //注释TODO
    set_customDatabyid(id: number, value: any) {
        //TODO        
    }

    //注释TODO
    get_customDatabyid(id: number) {
        //TODO
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