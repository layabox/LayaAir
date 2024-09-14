import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { Resource } from "../../../resource/Resource";
import { TileAlternativesData } from "./TileAlternativeData";
import { TileMap_CustomDataVariant, TileShape, TillMap_TerrainMode } from "./TileMapEnum";
import { TileSetCellData } from "./TileSetCellData";
import { TileSetCellGroup } from "./TileSetCellGroup";



export class TileSet_PhysicsLayerInfo {
    layer: number;
    mask: number;

    /**
     * @internal
     */
    _setTileSet() {

    }
}


export class TileSet_TerrainSetInfo {
    name: string;
    EditorColor: Color;

    /**
     * @internal
     */
    _setTileSet() {

    }
}

export class TileSet_LightOcclusionInfo {
    lightMask: number;

    /**
     * @internal
     */
    _setTileSet() {

    }
}

export class TileMap_NavigationInfo {
    /**
     * @internal
     */
    _setTileSet() {

    }
}

export class TileMap_CustomDataLayer {
    name: string;
    Variant: TileMap_CustomDataVariant;
    /**
     * @internal
     */
    _setTileSet() {

    }
};

export class TileSet {

    private _tileShape: TileShape;

    private _tileSize: Vector2;

    private _physicaLayers: Array<TileSet_PhysicsLayerInfo>;

    private _terrainBatchMode: TillMap_TerrainMode;
    private _terrains: Array<TileSet_TerrainSetInfo>;

    private _navigationLayers: Array<TileMap_NavigationInfo>;

    private _customDataLayer: Array<TileMap_CustomDataLayer>;

    private _lightOcclusion: Array<TileSet_LightOcclusionInfo>;

    private _baseCells: TileSetCellGroup[];

    constructor() {
        this._tileSize = new Vector2(16, 16);
        this._tileShape = TileShape.TILE_SHAPE_SQUARE;
    }

    /**
     * @internal
     */
    private _notifyTileSetCellGroupsChange() {

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

    //TileSetGroup
    get tileSetCellGroups() {
        return null;
    }

    set tileSetCellGroups(value: TileSetCellGroup[]) {

    }

    addTileSetCellGroup(id: number, resource: TileSetCellGroup): void {

    }

    getTileSetCellGroup(id: number): TileSetCellGroup {
        return null;
    }

    removeTileSetCellGroup(id: number): void {

    }

    //customLayer
    get customLayers() {
        return this._customDataLayer;
    }

    set customLayers(value: TileMap_CustomDataLayer[]) {

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
        return this._customDataLayer;
    }

    set navigationLayers(value: TileMap_NavigationInfo[]) {

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

    set lightInfoLayers(value: TileSet_LightOcclusionInfo[]) {

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

    set physicsLayers(value: TileSet_PhysicsLayerInfo[]) {

    }

    addPhysicsLayers(layer: TileSet_PhysicsLayerInfo): void {

    }

    getPhysicsLayers(layerIndex: number): TileSet_PhysicsLayerInfo {
        return null;
    }

    removePhysicsLayers(layerIndex: number): void {
        return;
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

    set tileTerrains(value: TileSet_TerrainSetInfo[]) {

    }

    addTileTerrain(layer: TileSet_TerrainSetInfo): void {

    }

    getTileTerrain(layerIndex: number): TileSet_TerrainSetInfo {
        return null;
    }

    removeTileTerrain(layerIndex: number): void {
        return;
    }





}