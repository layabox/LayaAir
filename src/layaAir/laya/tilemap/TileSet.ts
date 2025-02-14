import { Color } from "../maths/Color";
import { Vector2 } from "../maths/Vector2";
import { TileMapDirtyFlag, TileShape, TileMapTerrainMode } from "./TileMapEnum";
import { TileMapUtils } from "./TileMapUtils";
import { TileSetCellData } from "./TileSetCellData";
import { TileSetCellGroup } from "./TileSetCellGroup";
import { Resource } from "../resource/Resource";
import { Material } from "../resource/Material";
import { RenderState } from "../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { TileMapLayer } from "./TileMapLayer";
import { Texture2D } from "../resource/Texture2D";
import { TileSetPhysicsLayer } from "./layers/TileSetPhysicsLayer";
import { TileSetTerrainSet } from "./layers/TileSetTerrainSet";
import { TileMapNavigationLayer } from "./layers/TileSetNavigationLayer";
import { TileSetOcclusionLayer } from "./layers/TileSetOcclusionLayer";
import { TileSetCustomDataLayer } from "./layers/TileSetCustomDataLayer";
import { TerrainsParams } from "./terrain/TileMapTerrain";

export class TileSet extends Resource {

    private _tileShape: TileShape;

    private _tileSize: Vector2;

    private _physicsLayers: Array<TileSetPhysicsLayer>;

    private _terrainSets: Array<TileSetTerrainSet>;

    private _navigationLayers: Array<TileMapNavigationLayer>;

    private _customDataLayers: Array<TileSetCustomDataLayer>;

    private _lightOcclusion: Array<TileSetOcclusionLayer>;

    private _groups: TileSetCellGroup[];
    //用于快速查询
    private _groupIds: Array<number>;

    private _defalutMaterials: Record<string, Material> = {};

    private _ownerList: TileMapLayer[] = [];

    private _terrainsDirty = true;

    private _paramsLists: TerrainsParams[][][] = [];

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
        if (gid < 0) { return null; }
        const groupId = TileMapUtils.parseGroupId(gid);
        //通过查找列表快速定位group
        const group = this._groups.find(group => group.id == groupId);

        if (group) {
            const cellIndex = TileMapUtils.parseCellIndex(gid);
            const nativeIndex = TileMapUtils.parseNativeIndex(gid);
            return group.getCellDataByIndex(nativeIndex, cellIndex);
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
     * TODO 改成事件？
     * @internal
     */
    private _notifyCustomDataLayerChange() {
        // this.event
    }
    /**
     * @internal
     */
    private _notifyRenderLayerChange() {

    }
    /**
     * @internal
     */
    private _notifyTerrainSetChange() {

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
        return this._customDataLayers;
    }

    set customLayers(value) {
        this._customDataLayers = value;
    }

    addCustomDataLayer(layer: TileSetCustomDataLayer): boolean {
        if (!this._customDataLayers) this._customDataLayers = [];
        let result = this._addLayer(this._customDataLayers, "name", layer);
        result && this._notifyCustomDataLayerChange();
        return result;
    }

    getCustomDataLayer(name: string): TileSetCustomDataLayer {
        let result = this._getLayer(this._customDataLayers, "name", name);
        return result
    }

    removeCustomDataLayer(name: string): TileSetCustomDataLayer {
        let result = this._removeLayer(this._customDataLayers, "name", name);
        if (result) this._notifyCustomDataLayerChange();
        return result
    }

    //navigation
    get navigationLayers() {
        return this._navigationLayers;
    }

    set navigationLayers(value) {
        this._navigationLayers = value;
    }

    addNavigationLayers(layer: TileMapNavigationLayer): void {

    }

    getNavigationLayers(id: number): TileMapNavigationLayer {
        return null;
    }

    removeNavigationLayers(id: number): void {
        return;
    }

    //LightInfo
    get lightInfoLayers() {
        return this._lightOcclusion;
    }

    set lightInfoLayers(value) {
        this._lightOcclusion = value;
    }

    addLightInfoLayer(layer: TileSetOcclusionLayer): boolean {
        if (!this._lightOcclusion) this._lightOcclusion = [];
        let result = this._addLayer(this._lightOcclusion, "id", layer);
        result && this._notifyRenderLayerChange();
        return result;
    }

    getLightInfoLayer(id: number): TileSetOcclusionLayer {
        let result = this._getLayer(this._lightOcclusion, "id", id);
        return result
    }

    removeLightInfoLayer(id: number): TileSetOcclusionLayer {
        let result = this._removeLayer(this._lightOcclusion, "id", id);
        result && this._notifyRenderLayerChange();
        return result;
    }

    //physics
    get physicsLayers() {
        return this._physicsLayers;
    }

    set physicsLayers(value) {
        this._physicsLayers = value;
    }

    addPhysicsLayer(layer: TileSetPhysicsLayer): boolean {
        if (!this._physicsLayers) this._physicsLayers = [];
        let result = this._addLayer(this._physicsLayers, "id", layer);
        result && this._notifyPhysicsLayerChange();
        return result;
    }

    getPhysicsLayer(id: number): TileSetPhysicsLayer {
        let result = this._getLayer(this._physicsLayers, "id", id);
        return result;
    }

    removePhysicsLayer(id: number): TileSetPhysicsLayer {
        let result = this._removeLayer(this._physicsLayers, "id", id);
        result && this._notifyPhysicsLayerChange();
        return result;
    }

    private _addLayer<T extends { id?: number, name?: string }>(layers: T[], key: "id" | "name", layer: T) {
        for (let i = 0, len = layers.length; i < len; i++) {
            if (layer[key] == layers[i][key]) {
                return false;
            }
        }
        layers.push(layer);
        return true;
    }

    private _getLayer<T extends { id?: number, name?: string }>(layers: T[], key: "id" | "name", value: number | string): T {
        if (!layers || !layers.length) return null
        for (let i = 0, len = layers.length; i < len; i++) {
            if (value == layers[i][key]) {
                return layers[i];
            }
        }
        return null;
    }

    private _removeLayer<T extends { id?: number, name?: string }>(layers: T[], key: "id" | "name", value: number | string): T {
        if (!layers || !layers.length) return null
        for (let i = 0, len = layers.length; i < len; i++) {
            if (value == layers[i][key]) {
                return layers.splice(i, 1)[0];
            }
        }
        return null;
    }

    get terrainSets() {
        return this._terrainSets;
    }

    set terrainSets(value) {
        if (value) {
            for (let i = 0, len = value.length; i < len; i++) {
                value[i] && value[i].updateShape(this._tileShape);
            }
        }
        this._terrainSets = value;
    }

    addTerrainSet(set: TileSetTerrainSet): void {
        if (!this._physicsLayers) this._terrainSets = [];
        let result = this._addLayer(this._terrainSets, "id", set);
        set.updateShape(this._tileShape);
        result && this._notifyPhysicsLayerChange();
    }

    getTerrainSet(id: number): TileSetTerrainSet {
        let result = this._getLayer(this._terrainSets, "id", id);
        result && this._notifyTerrainSetChange();
        return result;
    }

    removeTerrainSet(id: number): TileSetTerrainSet {
        let result = this._removeLayer(this._terrainSets, "id", id);
        result && this._notifyPhysicsLayerChange();
        return result;
    }

    updateTerrains() {
        if (this._terrainsDirty) {

            this._clearTerrainParams();

            this._terrainsDirty = false;
            this._groups.forEach(group => {
                let tiles = group.tiles;
                for (let y in tiles) {
                    let yTiles = tiles[y]
                    for (let x in yTiles) {
                        let nativeData = yTiles[x];
                        for (let n in nativeData._tileDatas) {

                            let celldata = nativeData._tileDatas[n];
                            let terrainSetId = celldata.terrainSet
                            if (terrainSetId > -1) {
                                let terrainSet = this.getTerrainSet(terrainSetId);
                                if (celldata.terrain > -1) {
                                    this.addTerrainParams(celldata);
                                }
                                // else{
                                let neighbors = terrainSet._neighbors;
                                for (let i = 0, len = neighbors.length; i < len; i++) {
                                    let neighbor = neighbors[i];
                                    if (celldata.get_terrainPeeringBit(neighbor) > -1) {
                                        this.addTerrainParams(celldata);
                                    }
                                }
                                // }
                            }
                        }
                    }
                }
            });

            for (let i = 0, len = this._terrainSets.length; i < len; i++) {
                let empty = this._addEmptyParams(this._terrainSets[i]);


            }
        }
    }

    public _getParamsList(terrainSet:number){
        this.updateTerrains();
        return this._paramsLists[terrainSet];
    }

    private _clearTerrainParams() {
        let paramsLists = this._paramsLists;
        for (let i = 0, ilen = paramsLists.length; i < ilen; i++) {
            let paramsList = paramsLists[i];
            if (!paramsList) continue
            for (let j = 0, jlen = paramsList.length; j < jlen; j++) {
                let params = paramsList[j];
                if (!params) continue
                for (let k = 0, klen = params.length; k < klen; k++)
                    params[k] && params[k].clearLinks();
            }
        }
    }

    private addTerrainParams(cellData: TileSetCellData) {
        let params: TerrainsParams;

        let list = this._paramsLists[cellData.terrainSet] ? (this._paramsLists[cellData.terrainSet][cellData.terrain] ? this._paramsLists[cellData.terrainSet][cellData.terrain] : null) : null;
        if (list) {
            let bits = cellData._getTerrainPeeringBits();
            let terrainSet = this.getTerrainSet(cellData.terrainSet);
            let neighbors = terrainSet._neighbors
            let nLen = neighbors.length;

            for (let i = 0, ilen = list.length; i < ilen; i++) {
                let oParams = list[i];
                let same = true;
                for (let j = 0; j < nLen; j++) {
                    let neighbor = neighbors[j];

                    if (oParams.terrain_peering_bits[neighbor] != bits[neighbor]) {
                        same = false;
                        break;
                    }
                }

                if (same) {
                    params = oParams;
                    break
                }
            }
        } else {
            params = this._addTerrainParams(cellData);
        }

        if (!params) {
            params = cellData.getTerrainsParams();
            list.push(params);
        }

        params.link(cellData);
        return params;
    }

    private _addTerrainParams(cellData: TileSetCellData) {
        let tlists = this._paramsLists[cellData.terrainSet];
        if (!tlists) {
            tlists = this._paramsLists[cellData.terrainSet] = [];
        }

        let list = tlists[cellData.terrain];
        if (!list) {
            list = tlists[cellData.terrain] = [];
        }

        let params = cellData.getTerrainsParams();
        list.push(params);
        return params;
    }

    private _addEmptyParams(terrainSet: TileSetTerrainSet) {
        let list = this._paramsLists[terrainSet.id] ? (this._paramsLists[terrainSet.id][-1] ? this._paramsLists[terrainSet.id][-1] : null) : null;
        let params: TerrainsParams;
        if (list) {
            let neighbors = terrainSet._neighbors;
            let nLen = neighbors.length;
            for (let i = 0, ilen = list.length; i < ilen; i++) {
                let oParams = list[i];
                let same = true;
                for (let j = 0; j < nLen; j++) {
                    let neighbor = neighbors[j];

                    if (oParams.terrain_peering_bits[neighbor] != -1) {
                        same = false;
                        break;
                    }
                }

                if (same) {
                    params = oParams;
                    break
                }
            }
        } else {
            let tlists = this._paramsLists[terrainSet.id] = this._paramsLists[terrainSet.id] || [];
            list = tlists[-1] = tlists[-1] || [];
        }

        if (!params) {
            params = new TerrainsParams;
            params.terrainSet = terrainSet.id;
            list.push(params);
        }
        
        return params;
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