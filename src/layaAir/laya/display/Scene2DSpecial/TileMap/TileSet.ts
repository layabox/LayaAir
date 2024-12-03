import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { TileShape, TillMap_TerrainMode } from "./TileMapEnum";
import { TileMapUtils } from "./TileMapUtils";
import { TileSetCellData } from "./TileSetCellData";
import { TileSetCellGroup } from "./TileSetCellGroup";
import { Resource } from "../../../resource/Resource";
import { Material } from "../../../resource/Material";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { TileMapLayer } from "./TileMapLayer";
import { Texture2D } from "../../../resource/Texture2D";
import { TileSetPhysicsLayer } from "./layers/TileSetPhysicsLayer";
import { TileSetTerrainLayer } from "./layers/TileSetTerrainLayer";
import { TileMapNavigationLayer } from "./layers/TileSetNavigationLayer";
import { TileSetOcclusionLayer } from "./layers/TileSetOcclusionLayer";
import { TileSetCustomDataLayer } from "./layers/TileSetCustomDataLayer";


export class TileSet extends Resource {

    private _tileShape: TileShape;

    private _tileSize: Vector2;

    private _physicsLayers: Array<TileSetPhysicsLayer>;

    private _terrainBatchMode: TillMap_TerrainMode;
    private _terrains: Array<TileSetTerrainLayer>;

    private _navigationLayers: Array<TileMapNavigationLayer>;

    private _customDataLayer: Array<TileSetCustomDataLayer>;

    private _lightOcclusion: Array<TileSetOcclusionLayer>;

    private _groups: TileSetCellGroup[];
    //用于快速查询
    private _groupIds: Array<number>;

    private _defalutMaterials: Record<string, Material> = {};

    private _ownerList: TileMapLayer[] = [];

    constructor() {
        super();
        this._tileSize = new Vector2(16, 16);
        this._tileShape = TileShape.TILE_SHAPE_SQUARE;
        this._groups = [];
        this._groupIds = [];
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
        this._ownerList.forEach(element => {
            element._grid._updateTileShape(this._tileShape, this._tileSize);
            element._grid._updateBufferData();
        });
    }

    /**
     * 获取瓦片的像素大小
     */
    get tileSize() {
        return this._tileSize;
    }

    set tileSize(value: Vector2) {
        if (Vector2.equals(value, this._tileSize))
            return;
        value.cloneTo(this._tileSize);
        this._ownerList.forEach(element => {
            element._grid._setTileSize(this._tileSize.x, this._tileSize.y);
        });
    }


    protected _disposeResource(): void {
        for (const key in this._defalutMaterials) {
            this._defalutMaterials[key] && this._defalutMaterials[key].destroy();
        }
    }

    

    public getCellDataByGid(gid: number): TileSetCellData {
        if (gid <= 0) { return null; }
        const groupId = TileMapUtils.parseGroupId(gid);
        //通过查找列表快速定位group
        const group = this._groups.find(group => group.id == groupId);

        if (group) {
            const cellIndex = TileMapUtils.parseCellIndex(gid);
            const nativeIndex = TileMapUtils.parseNativeIndex(gid);
            return group.getCellDataByIndex( nativeIndex , cellIndex);
        } else {
            return null;
        }
    }


    _addOwner(tilemapLayer: TileMapLayer) {
        if (this._ownerList.indexOf(tilemapLayer) == -1)
            this._ownerList.push(tilemapLayer);
    }

    _removeOwner(tilemapLayer: TileMapLayer) {
        let index = this._ownerList.indexOf(tilemapLayer)
        if (index != -1)
            this._ownerList.splice(index, 1);
    }

    _notifyTileSetCellGroupsChange() {
        this._groupIds.length = 0;
        for (let i = 0, len = this._groups.length; i < len; i++) {
            const value = this._groups[i];
            value._recaculateUVOriProperty(false);
            this._groupIds.push(value.id);
        }
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
            this._groups.push(resource);
            this._notifyTileSetCellGroupsChange();
        }
    }

    getTileSetCellGroup(id: number): TileSetCellGroup {
        let index = this._groupIds.indexOf(id);
        return this._groups[index];
    }

    removeTileSetCellGroup(id: number): void {
        let index = this._groupIds.indexOf(id);
        this._groups.splice(index, 1);
        this._notifyTileSetCellGroupsChange();
    }

    //customLayer
    get customLayers() {
        return this._customDataLayer;
    }

    addCustormDataLayer(layer: TileSetCustomDataLayer): void {

    }

    getCustormDataLayer(layerIndex: number): TileSetCustomDataLayer {
        return null;
    }

    removeCustormDataLayer(layerIndex: number): void {
        return;
    }

    //navigation
    get navigationLayers() {
        return this._navigationLayers;
    }

    addNavigationLayers(layer: TileMapNavigationLayer): void {

    }

    getNavigationLayers(layerIndex: number): TileMapNavigationLayer {
        return null;
    }

    removeNavigationLayers(layerIndex: number): void {
        return;
    }

    //LightInfo
    get lightInfoLayers() {
        return this._lightOcclusion;
    }

    addlightInfoLayers(layer: TileSetOcclusionLayer): void {

    }

    getlightInfoLayers(layerIndex: number): TileSetOcclusionLayer {
        return null;
    }

    removelightInfoLayers(layerIndex: number): void {
        return;
    }

    //physics
    get physicsLayers() {
        return this._physicsLayers;
    }

    addPhysicsLayers(layer: TileSetPhysicsLayer): number {
        let index = this._physicsLayers.length;
        this._physicsLayers.push(layer);
        return index;
    }

    getPhysicsLayers(layerIndex: number): TileSetPhysicsLayer {
        return this._physicsLayers[layerIndex];
    }

    removePhysicsLayers() {

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

    addTileTerrain(layer: TileSetTerrainLayer): void {

    }

    getTileTerrain(layerIndex: number): TileSetTerrainLayer {
        return null;
    }

    removeTileTerrain(layerIndex: number): void {
        return;
    }

    /**
     * @param texture 对象
     * @returns 获取实例
     */
    getDefalutMaterial(texture: Texture2D): Material {
        let url = texture.url;
        let dMat = this._defalutMaterials[url];
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
            
            dMat.setTexture("u_render2DTexture", texture);
            if (texture.gammaCorrection != 1) {//预乘纹理特殊处理
                dMat.addDefine(ShaderDefines2D.GAMMATEXTURE);
            } else {
                dMat.removeDefine(ShaderDefines2D.GAMMATEXTURE);
            }
            
            this._defalutMaterials[url] = dMat;
        }
        return dMat;
    }
}