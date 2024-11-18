import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { TileAlternativesData } from "./TileAlternativesData";
import { TileShape, TillMap_TerrainMode } from "./TileMapEnum";
import { TileMapUtils } from "./TileMapUtils";
import { TileSetCellData } from "./TileSetCellData";
import { TileSetCellGroup } from "./TileSetCellGroup";
import { Laya } from "../../../../Laya";
import { Resource } from "../../../resource/Resource";
import { Material } from "../../../resource/Material";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { TileMap_CustomDataLayer, TileMap_NavigationInfo, TileSet_LightOcclusionInfo, TileSet_PhysicsLayerInfo, TileSet_TerrainSetInfo } from "./TileSetInfos";


export class TileSet extends Resource {

    private _tileShape: TileShape;

    private _tileSize: Vector2;

    private _physicaLayers: Array<TileSet_PhysicsLayerInfo>;

    private _terrainBatchMode: TillMap_TerrainMode;
    private _terrains: Array<TileSet_TerrainSetInfo>;

    private _navigationLayers: Array<TileMap_NavigationInfo>;

    private _customDataLayer: Array<TileMap_CustomDataLayer>;

    private _lightOcclusion: Array<TileSet_LightOcclusionInfo>;

    private _baseCells: TileSetCellGroup[];

    private _alternativesId: Array<number>;
    private _baseCellIds: Array<number>;

    private _defalutMats: Record<string, Material> = {};

    //动画节点数据
    protected _animaterionDatas: TileAlternativesData[];

    constructor() {
        super();
        this._tileSize = new Vector2(16, 16);
        this._tileShape = TileShape.TILE_SHAPE_SQUARE;
        this._animaterionDatas = [];
        this._baseCells = [];
        this._baseCellIds = [];
        this._alternativesId = [];
    }

    /**
     * 设置瓦片的形状
     * 
     */
    get tileShape(): TileShape {
        return this._tileShape;
    }

    set tileShape(value: TileShape) {
        if (this._tileShape === value) return;
        this._tileShape = value;
    }

    /**
     * 获取瓦片的像素大小
     */
    get tileSize() {
        return this._tileSize;
    }

    set tileSize(value: Vector2) {
        value.cloneTo(this._tileSize);
    }


    protected _disposeResource(): void {
        for (const key in this._defalutMats) {
            this._defalutMats[key] && this._defalutMats[key].destroy();
        }
    }

    /**
     * @internal
     */
    _notifyTileSetCellGroupsChange() {
        let id = 1;
        this._alternativesId.length = 0;
        this._baseCellIds.length = 0;

        for (let i = 0, len = this._baseCells.length; i < len; i++) {
            const value = this._baseCells[i];
            value._recaculateUVOriProperty(false);
            this._alternativesId.push(id);
            this._baseCellIds.push(value.id);
            value._baseAlternativesId = id;
            id += value._maxAlternativesCount;
        }
        this._alternativesId.push(id);
    }

    public getCellDataByGid(gid: number): TileSetCellData {
        if (gid <= 0) { return null; }
        const nativeId = TileMapUtils.getNativeId(gid);
        const index = TileMapUtils.quickFoundIndex(this._alternativesId, nativeId);
        if (index === -1) {
            return null;
        }
        const baseId = this._baseCellIds[index];
        const baseCell = this._baseCells.find(cell => cell.id === baseId);
        //const baseCell = this._baseCells.get(baseId);
        if (baseCell) {
            return baseCell.getCellDataByGid(gid);
        } else {
            return null;
        }
    }

    /**
     * 添加有动画的瓦片数据
     * @param data 
     * @returns 
     */
    _addAnimatrionData(data: TileAlternativesData) {
        if (data.animationFrams.length <= 0) return;
        if (this._animaterionDatas.indexOf(data) === -1) {
            this._animaterionDatas.push(data);
        }
    }


    /**
     * 跟新动画数据
     * @param data 
     */
    _updateAnimaterionDatas() {
        let dt = Laya.timer.delta * 0.001;
        this._animaterionDatas.forEach(element => {
            element._updateAnimator(dt);
        });
    }


    _refeashAlternativesId() {
        let id = 1;
        this._alternativesId.length = 0;
        this._baseCellIds.length = 0;

        for (let i = 0, len = this._baseCells.length; i < len; i++) {
            const value = this._baseCells[i];
            value._recaculateUVOriProperty(false);
            this._alternativesId.push(id);
            this._baseCellIds.push(value.id);
            value._baseAlternativesId = id;
            id += value._maxAlternativesCount;
        }
        this._alternativesId.push(id);
    }

    /**
     * @internal
     */
    private _notifyCustomDataLayerChange() {

    }
    /**
     * @internal
     */
    private _notifyRenderLayerChange() {

    }
    /**
     * @internal
     */
    private _notifyTerrainLayerChange() {

    }
    /**
     * @internal
     */
    private _notifyNavigationLayerChange() {

    }
    /**
     * @internal
     */
    private _notifyPhysicsLayerChange() {

    }

    addTileSetCellGroup(resource: TileSetCellGroup): void {
        if (resource) {
            resource._owner = this;
            this._baseCells.push(resource);
            this._notifyTileSetCellGroupsChange();
        }
    }

    getTileSetCellGroup(id: number): TileSetCellGroup {
        let index = this._baseCellIds.indexOf(id);
        return this._baseCells[index];
    }

    removeTileSetCellGroup(id: number): void {
        let index = this._baseCellIds.indexOf(id);
        this._baseCells.splice(index , 1);
        this._notifyTileSetCellGroupsChange();
    }

    //customLayer
    get customLayers() {
        return this._customDataLayer;
    }

    addCustormDataLayer(layer: TileMap_CustomDataLayer): void {

    }

    getCustormDataLayer(layerIndex: number): TileMap_CustomDataLayer {
        return null;
    }

    removeCustormDataLayer(layerIndex: number): void {
        return;
    }

    //navigation
    get navigationLayers() {
        return this._navigationLayers;
    }

    addNavigationLayers(layer: TileMap_NavigationInfo): void {

    }

    getNavigationLayers(layerIndex: number): TileMap_NavigationInfo {
        return null;
    }

    removeNavigationLayers(layerIndex: number): void {
        return;
    }

    //LightInfo
    get lightInfoLayers() {
        return this._lightOcclusion;
    }

    addlightInfoLayers(layer: TileSet_LightOcclusionInfo): void {

    }

    getlightInfoLayers(layerIndex: number): TileSet_LightOcclusionInfo {
        return null;
    }

    removelightInfoLayers(layerIndex: number): void {
        return;
    }

    //physics
    get physicsLayers() {
        return this._physicaLayers;
    }

    addPhysicsLayers(layer: TileSet_PhysicsLayerInfo): number {
        let index = this._physicaLayers.length;
        this._physicaLayers.push(layer);
        return index;
    }

    getPhysicsLayers(layerIndex: number): TileSet_PhysicsLayerInfo {
        return this._physicaLayers[layerIndex];
    }

    removePhysicsLayers(){

    }

    //Terrain  
    set terrainPatchMode(value: TillMap_TerrainMode) {

    }

    get terrainPatchMode(): TillMap_TerrainMode {
        return this._terrainBatchMode;
    }

    get tileTerrains() {
        return this._terrains;
    }

    addTileTerrain(layer: TileSet_TerrainSetInfo): void {

    }

    getTileTerrain(layerIndex: number): TileSet_TerrainSetInfo {
        return null;
    }

    removeTileTerrain(layerIndex: number): void {
        return;
    }

    /**
     * @param atlas 图集url
     * @returns 获取实例
     */
    getDefalutMaterial(atlas: string): Material {
        let dMat = this._defalutMats[atlas];
        if (!dMat) {
            dMat = new Material();
            dMat.setShaderName("TileMapLayer");
            dMat.setColor("u_Color", new Color(1, 1, 1, 1));
            dMat.setBoolByIndex(Shader3D.DEPTH_WRITE, false);
            dMat.setIntByIndex(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
            dMat.setIntByIndex(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
            dMat.setIntByIndex(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
            dMat.setIntByIndex(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
            dMat.setIntByIndex(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
            dMat.setFloatByIndex(ShaderDefines2D.UNIFORM_VERTALPHA, 1.0);
            dMat.setIntByIndex(Shader3D.CULL, RenderState.CULL_NONE);
            this._defalutMats[atlas] = dMat;
        }
        return dMat;
    }
}