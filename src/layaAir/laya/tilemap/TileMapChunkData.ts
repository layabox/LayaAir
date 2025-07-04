import { LayaGL } from "../layagl/LayaGL";
import { Vector2 } from "../maths/Vector2";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IVertexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Material } from "../resource/Material";
import { Sprite } from "../display/Sprite";
import { TileMapOccluder } from "./light/TileMapOccluder";
import { TileAlternativesData } from "./TileAlternativesData";
import { DIRTY_TYPES, DirtyFlagType, TileLayerSortMode, TileMapDirtyFlag, TileShape } from "./TileMapEnum";
import { TileMapLayer } from "./TileMapLayer";
import { TileMapShaderInit } from "./shader/TileMapShaderInit";
import { TileMapUtils } from "./TileMapUtils";
import { TileSetCellData } from "./TileSetCellData";
import { PolygonPoint2D } from "../Light2D/PolygonPoint2D";

interface ITileMapRenderElement {
    renderElement: IRenderElement2D,
    maxCell: number;
    cacheData: Array<Float32Array>;
    updateFlag: Array<boolean>;
}


//用于存储格子的数据
export class ChunkCellInfo {
    //单元格引用贴图的id
    cell: TileSetCellData;
    //按照X轴排序 chuckLocalindex
    chuckLocalindex: number;
    //
    // yOrderValue: number;
    //单元格z序列
    zOrderValue: number;
    //单元格在chunk中的位置
    cellx: number;

    celly: number;

    _physicsDatas: any[];

    _occluderDatas: TileMapOccluder[];

    _renderElementIndex: number;//在第几个RenderElement中

    _cellPosInRenderData: number;//渲染数据中的第几个cell

    constructor(cellx: number, celly: number, chuckLocalindex: number, zOrider: number = 0, cell: TileSetCellData) {
        this.chuckLocalindex = chuckLocalindex;
        // this.yOrderValue = yOrider;
        this.zOrderValue = zOrider;
        this.cellx = cellx;
        this.celly = celly;
        this.cell = cell;
    }
}

/**
 * 用来处理各项数据
 */
export class TileMapChunkData {
    static instanceColorBufferIndex = 0;
    static instanceposScalBufferIndex = 1;
    static instanceuvOriScalBufferIndex = 2;
    static instanceuvTransBufferIndex = 3;

    //是否重新组织渲染
    private _reCreateRenderData: boolean = true;

    /**
     * Key1 cellData GID
     * Value chuckLocalIndex[],同时计算引用
     */
    private _cellDataRefMap: number[][];

    private _refGids: number[] = [];
    /**
     * 帧处理cell数据更新
     * 0 render , 1 physics 3 light
     * Key1 cellData GID ---- 
     * value dirtyFlag
     */
    private _dirtyFlags: Map<number, number>[] = [];

    /**
     * 缓存chuckCellInfo数据
     * Key1 chuckLocalIndex
     * value ChunkCellInfo
     */
    private _cellDataMap: Record<number, ChunkCellInfo> = {};

    /** @internal 用于排序的列表 */
    _chuckCellList: ChunkCellInfo[] = [];

    //渲染数据
    private _renderElementArray: ITileMapRenderElement[];

    private _animatorAlterArray: Map<number, TileAlternativesData> = new Map();

    _tileLayer: TileMapLayer;

    private _oriCellIndex: Vector2;

    private _gridShape: TileShape;

    private _tileSize: Vector2;

    private _sortMode: TileLayerSortMode;

    /** @private Editor */
    _material: Material;

    /**
     * 渲染块 x 坐标
     */
    chunkX: number;

    /**
     * 渲染块 y 坐标
     */
    chunkY: number;

    private _rigidBody: any;

    constructor() {
        this._cellDataRefMap = [];
        this._tileSize = new Vector2();
        this._reCreateRenderData = true;
        this._oriCellIndex = new Vector2(0, 0);
        this._renderElementArray = [];
        for (let i = 0; i < DIRTY_TYPES; i++)
            this._dirtyFlags[i] = new Map;
    }

    /** @internal */
    get cellDataRefMap() {
        return this._cellDataRefMap;
    }

    /**
     * @internal 
     * @deprecated
     * 危险操作
     */
    set cellDataRefMap(data: number[][]) {
        if (!data || !Object.keys(data).length)
            return

        for (let i = 0, len = data.length; i < len; i++) {
            if (data[i]) {
                this._refGids.push(i);
            } else {
                delete data[i];
            }
        }
        this._cellDataRefMap = data;
        this._reCreateRenderData = true;
    }

    /**
     * 获取使用得压缩数据
     */
    get compressData(): Record<number, number[]> {
        let out: Record<number, number[]> = {};
        this._refGids.forEach(gid => {
            if (this._cellDataRefMap[gid]) out[gid] = this._cellDataRefMap[gid];
        })
        return out;
    }

    /**
     * 危险操作
     * @internal
     */
    set compressData(value: Record<number, number[]>) {
        if (!value || !Object.keys(value).length)
            return
        let nDdata: number[][] = [];
        for (const key in value) {
            let gid = parseInt(key);
            nDdata[gid] = value[key];
            this._refGids.push(gid);
        }
        this._cellDataRefMap = nDdata;
        this._reCreateRenderData = true;
    }

    /** @internal */
    _parseCellDataRefMap() {
        //只做初始化，有数据就不处理
        if (this._chuckCellList.length) return;

        let layer = this._tileLayer;
        let tileSet = layer.tileSet;
        if (!tileSet) return;
        let chunk = this._tileLayer._chunk;

        let localPos = Vector2.TEMP;

        for (let i = this._refGids.length - 1; i > -1; i--) {
            let gid = this._refGids[i];
            let localIndexs = this._cellDataRefMap[gid];
            if (localIndexs) {
                let cellData = tileSet.getCellDataByGid(gid);
                if (cellData) {//todo 算数据丢失
                    cellData._addNoticeRenderTile(this);
                    for (let i = 0, len = localIndexs.length; i < len; i++) {
                        let index = localIndexs[i];
                        chunk._getCellPosByChunkPosAndIndex(0, 0, index, localPos);
                        // let yorderValue = chunk._getChunkIndexByCellPos(localPos.y, localPos.x);
                        let chuckCellInfo = new ChunkCellInfo(localPos.x, localPos.y, index, cellData.z_index, cellData);
                        this._cellDataMap[index] = chuckCellInfo;
                        this._chuckCellList.push(chuckCellInfo);
                    }
                    this._setDirtyFlag(gid, TileMapDirtyFlag.CELL_CHANGE);
                } else {
                    delete this._cellDataRefMap[gid];
                    this._refGids.splice(i, 1);
                }
            }
        }

        this._reCreateRenderData = true;
    }


    /**
     * @internal
     * 将数据合并到二维map中
     */
    _mergeBuffer(datas: Map<number, Map<number, TileSetCellData>>, minRange: Vector2, maxRange: Vector2) {
        const tempVec2 = Vector2.TEMP;
        let infos = this._chuckCellList;
        for (let i = 0, len = infos.length; i < len; i++) {
            let info = infos[i];
            this._tileLayer._chunk._getCellPosByChunkPosAndIndex(0, 0, info.chuckLocalindex, tempVec2);

            let cellX = tempVec2.x + this._oriCellIndex.x;
            let cellY = tempVec2.y + this._oriCellIndex.y;

            // 更新边界  
            minRange.x = Math.min(minRange.x, cellX);
            minRange.y = Math.min(minRange.y, cellY);
            maxRange.x = Math.max(maxRange.x, cellX);
            maxRange.y = Math.max(maxRange.y, cellY);

            let row = datas.get(cellY);
            if (!row) {
                row = new Map<number, TileSetCellData>();
                datas.set(cellY, row);
            }
            row.set(cellX, info.cell);
        }

    }

    _setBuffer(datas: Map<number, Map<number, TileSetCellData>>, minRange: Vector2, maxRange: Vector2, tileSize: number): number {
        this._clearCell();
        const chunk = this._tileLayer._chunk;
        let ocix = this._oriCellIndex.x;
        let ociy = this._oriCellIndex.y;
        let starx = Math.max(minRange.x, ocix);
        let stary = Math.max(minRange.y, ociy);
        let endx = Math.min(maxRange.x, ocix + tileSize - 1);
        let endy = Math.min(maxRange.y, ociy + tileSize - 1);
        let mark = 0;
        for (var j = stary; j <= endy; j++) {
            let row = datas.get(j);
            if (!row) continue;
            for (var i = starx; i <= endx; i++) {
                let data = row.get(i);
                if (data) {
                    const index = chunk._getChunkIndexByCellPos(i - ocix, j - ociy);
                    this._setCell(index, data);
                    // haveData = true;
                    mark++
                }
            }
        }

        this._reCreateRenderData = true;
        return mark;
    }

    _updateChunkData(chunkX: number, chunkY: number) {
        this.chunkX = chunkX;
        this.chunkY = chunkY;
        this._tileLayer._chunk._getCellPosByChunkPosAndIndex(chunkX, chunkY, 0, this._oriCellIndex);
    }

    private _upeateGridData() {
        if (this._sortMode != this._tileLayer.sortMode) {
            this._sortMode = this._tileLayer.sortMode;
            this._reCreateRenderData = true;
        }
        let tileSet = this._tileLayer.tileSet;


        if (this._animatorAlterArray.size > 0) {
            this._animatorAlterArray.forEach((value, key) => {
                value._updateAnimator()
            });
        }

        let tileShape = tileSet.tileShape;
        if (this._gridShape != tileShape) {
            this._gridShape = tileShape;
            this._refGids.forEach(gid => {
                this._setDirtyFlag(gid, TileMapDirtyFlag.CELL_QUAD, DirtyFlagType.RENDER);
            });
            this._reCreateRenderData = true;
        }

        if (!Vector2.equals(this._tileSize, tileSet.tileSize)) {
            tileSet.tileSize.cloneTo(this._tileSize);
            this._refGids.forEach(gid => {
                this._setDirtyFlag(gid, TileMapDirtyFlag.CELL_QUAD | TileMapDirtyFlag.CELL_QUADUV, DirtyFlagType.RENDER);
            });
        }
    }

    private _updateRenderData() {

        if (this._reCreateRenderData) {
            this._reCreateRenderData = false;

            this._clearRenderElement();//清除渲染数据

            if (this._chuckCellList.length == 0)
                return;
            switch (this._tileLayer.sortMode) {
                case TileLayerSortMode.YSort:
                    this._chuckCellList.sort((a, b) => {
                        if (a.celly == b.celly)
                            return a.cellx - b.cellx;
                        return a.celly - b.celly;
                    });
                    break;
                case TileLayerSortMode.XSort:
                    this._chuckCellList.sort((a, b) => {
                        if (a.cellx - b.cellx) {
                            return a.celly - b.celly;
                        }
                        return a.cellx - b.cellx
                    });
                    break;
                case TileLayerSortMode.ZINDEXSORT:
                    this._chuckCellList.sort((a, b) => {
                        if (a.zOrderValue == b.zOrderValue) { return a.chuckLocalindex - b.chuckLocalindex }
                        else { return a.zOrderValue - b.zOrderValue }
                    });
                    break;
            }
            let lastCell;
            let tempCellIndexArray: ChunkCellInfo[] = [];

            this._animatorAlterArray.clear();

            for (var i = 0; i < this._chuckCellList.length; i++) {
                // let cellIndex = this._softList[i].xOrider;
                let chuckCellInfoData = this._chuckCellList[i];
                let cellData = chuckCellInfoData.cell;
                if (!cellData)
                    continue;

                if (cellData.cellowner._hasAni())
                    this._animatorAlterArray.set(cellData.cellowner.nativeId, cellData.cellowner);

                if (!lastCell) {
                    lastCell = cellData;
                    tempCellIndexArray.push(chuckCellInfoData);
                    continue;
                }
                if (this._breakBatch(lastCell, cellData)) {
                    lastCell = cellData;
                    this._createRenderElement(tempCellIndexArray)
                }

                tempCellIndexArray.push(chuckCellInfoData);
            }
            this._createRenderElement(tempCellIndexArray);
        }
        else {
            let dirtyFlag = this._dirtyFlags[DirtyFlagType.RENDER];
            if (dirtyFlag.size > 0) {

                let pos: Vector2 = Vector2.TEMP;

                dirtyFlag.forEach((value, key) => {
                    //cell posOri extends  
                    let cellDataUseArray = this._cellDataRefMap[key];
                    if (cellDataUseArray) {
                        cellDataUseArray.forEach(element => {
                            let chuckCellinfo = this._cellDataMap[element];
                            let cellData = chuckCellinfo.cell;
                            let nativesData = cellData.cellowner;
                            let tilemapRenderElementInfo = this._renderElementArray[chuckCellinfo._renderElementIndex];
                            if (value & TileMapDirtyFlag.CELL_CHANGE || (value & TileMapDirtyFlag.CELL_QUAD)) {
                                let data = tilemapRenderElementInfo.cacheData[TileMapChunkData.instanceposScalBufferIndex];
                                tilemapRenderElementInfo.updateFlag[TileMapChunkData.instanceposScalBufferIndex] = true;
                                this._getCellPos(chuckCellinfo, pos);
                                let posOffset = cellData.texture_origin;
                                let dataoffset = chuckCellinfo._cellPosInRenderData * 4;
                                data[dataoffset] = pos.x + posOffset.x;
                                data[dataoffset + 1] = pos.y + posOffset.y;
                                let uvSize = nativesData._getRegionSize();
                                data[dataoffset + 2] = uvSize.x;
                                data[dataoffset + 3] = uvSize.y;

                            }
                            if ((value & TileMapDirtyFlag.CELL_CHANGE) || (value & TileMapDirtyFlag.CELL_QUADUV)) {
                                //cell uv /Animation
                                let data = tilemapRenderElementInfo.cacheData[TileMapChunkData.instanceuvOriScalBufferIndex];
                                tilemapRenderElementInfo.updateFlag[TileMapChunkData.instanceuvOriScalBufferIndex] = true;
                                let dataoffset = chuckCellinfo._cellPosInRenderData * 4;
                                let uvOri = nativesData._getTextureUVOri();
                                let uvextend = nativesData._getTextureUVExtends();
                                data[dataoffset] = uvOri.x;
                                data[dataoffset + 1] = uvOri.y;
                                data[dataoffset + 2] = uvextend.x;
                                data[dataoffset + 3] = uvextend.y;

                            }
                            if ((value & TileMapDirtyFlag.CELL_CHANGE) || (value & TileMapDirtyFlag.CELL_COLOR)) {
                                //cellColor
                                let data = tilemapRenderElementInfo.cacheData[TileMapChunkData.instanceColorBufferIndex];
                                tilemapRenderElementInfo.updateFlag[TileMapChunkData.instanceColorBufferIndex] = true;
                                let dataoffset = chuckCellinfo._cellPosInRenderData * 4;
                                let color = cellData.colorModulate;
                                data[dataoffset] = color.r;
                                data[dataoffset + 1] = color.g;
                                data[dataoffset + 2] = color.b;
                                data[dataoffset + 3] = color.a;


                            }
                            if ((value & TileMapDirtyFlag.CELL_CHANGE) || (value & TileMapDirtyFlag.CELL_UVTRAN)) {
                                let data = tilemapRenderElementInfo.cacheData[TileMapChunkData.instanceuvTransBufferIndex];
                                tilemapRenderElementInfo.updateFlag[TileMapChunkData.instanceuvTransBufferIndex] = true;
                                let dataoffset = chuckCellinfo._cellPosInRenderData * 4;
                                let transData = cellData.transData;
                                data[dataoffset] = transData.x;
                                data[dataoffset + 1] = transData.y;
                                data[dataoffset + 2] = transData.z;
                                data[dataoffset + 3] = transData.w;

                            }
                        });
                    }
                })

                //update dirty buffer
                this._renderElementArray.forEach(element => {
                    for (var updateindex = 0, updatelength = 4; updateindex < updatelength; updateindex++) {
                        if (element.updateFlag[updateindex]) {
                            let data = element.cacheData[updateindex];
                            let verBuffer = element.renderElement.geometry.bufferState._vertexBuffers[updateindex + 1];//第一个Buffer是BaseBuffer
                            verBuffer.setData(data.buffer, 0, 0, data.byteLength);
                            element.updateFlag[updateindex] = false;
                        }
                    }
                });

                dirtyFlag.clear();
            }
        }
    }

    private _updatePhysicsData() {
        if (!this._tileLayer.tileMapPhysics.enable || !this._dirtyFlags[DirtyFlagType.PHYSICS].size) return;
        let physicsLayers = this._tileLayer.tileSet.physicsLayers;
        if (!physicsLayers || !physicsLayers.length) return;

        let physics = this._tileLayer.tileMapPhysics;
        let dirtyFlag = this._dirtyFlags[DirtyFlagType.PHYSICS];

        let rigidBody = this._rigidBody;
        if (!rigidBody) {
            rigidBody = physics.createRigidBody();
        }

        let layerCount = physicsLayers.length;
        let chunk = this._tileLayer._chunk;
        let pos: Vector2 = Vector2.TEMP;
        let scaleX = this._tileLayer.owner.scaleX;
        let scaleY = this._tileLayer.owner.scaleY;
        dirtyFlag.forEach((value, key) => {
            //cell posOri extends  
            let cellDataUseArray = this._cellDataRefMap[key];
            if (cellDataUseArray) {
                cellDataUseArray.forEach(element => {
                    let chunkCellInfo = this._cellDataMap[element];
                    let cellData = chunkCellInfo.cell;
                    let cellDatas = cellData.physicsDatas;

                    //TODO Layer变更时需要删除
                    if (cellDatas && (value & TileMapDirtyFlag.CELL_CHANGE) || (value & TileMapDirtyFlag.CELL_PHYSICS)) {

                        chunk._getPixelByChunkPosAndIndex(this.chunkX, this.chunkY, chunkCellInfo.chuckLocalindex, pos);

                        let ofx = pos.x;
                        let ofy = pos.y;
                        let datas = chunkCellInfo._physicsDatas;
                        if (!datas) {
                            datas = [];
                            chunkCellInfo._physicsDatas = datas;
                        }

                        for (let i = 0; i < layerCount; i++) {
                            let physicslayer = physicsLayers[i];
                            let pIndex = physicslayer.id;
                            if (!cellDatas[pIndex]) continue;

                            let data = datas[pIndex];
                            if (data) {
                                physics.destroyFixture(rigidBody, data);
                            }

                            let shape = cellDatas[pIndex].shape;
                            if (!shape) continue;

                            let shapeLength = shape.length;
                            let nShape: Array<number> = new Array(shapeLength);

                            for (let j = 0; j < shapeLength; j += 2) {
                                nShape[j] = (shape[j] + ofx) * scaleX;
                                nShape[j + 1] = (shape[j + 1] + ofy) * scaleY;
                            }

                            data = physics.createFixture(rigidBody, physicslayer, nShape);
                        }

                    }
                });
            }
        });

        dirtyFlag.clear();
    }

    private _updateLightShadowData() {
        if (!this._tileLayer.tileMapOccluder.enable || !this._dirtyFlags[DirtyFlagType.OCCLUSION].size) return;
        let lightInfoLayers = this._tileLayer.tileSet.lightInfoLayers;
        if (!lightInfoLayers || !lightInfoLayers.length) return;

        let agent = this._tileLayer.tileMapOccluder;
        let dirtyFlag = this._dirtyFlags[DirtyFlagType.OCCLUSION];


        let layerCount = lightInfoLayers.length;
        let chunk = this._tileLayer._chunk;
        let pos: Vector2 = Vector2.TEMP;

        dirtyFlag.forEach((value, key) => {
            let cellDataUseArray = this._cellDataRefMap[key];

            if (cellDataUseArray) {
                cellDataUseArray.forEach(element => {
                    let chunkCellInfo = this._cellDataMap[element];
                    let cellData = chunkCellInfo.cell;
                    let cellDatas = cellData.lightOccluderDatas;

                    //TODO Layer变更时需要删除
                    if (cellDatas && (value & TileMapDirtyFlag.CELL_CHANGE) || (value & TileMapDirtyFlag.CELL_LIGHTSHADOW)) {

                        chunk._getPixelByChunkPosAndIndex(this.chunkX, this.chunkY, chunkCellInfo.chuckLocalindex, pos);

                        let ofx = pos.x;
                        let ofy = pos.y;
                        let datas = chunkCellInfo._occluderDatas;
                        if (!datas) {
                            datas = [];
                            chunkCellInfo._occluderDatas = datas;
                        }

                        for (let i = 0; i < layerCount; i++) {
                            let layer = lightInfoLayers[i];
                            let pIndex = layer.id;
                            if (!cellDatas[pIndex]) continue;

                            let shape = cellDatas[pIndex].shape;
                            if (!shape) continue;

                            let shapeLength = shape.length;

                            let point: PolygonPoint2D = new PolygonPoint2D;

                            let data = datas[pIndex];
                            if (!data) {
                                data = agent.addOccluder(point, layer.layerMask);
                                datas[pIndex] = data;
                            }

                            for (let j = 0; j < shapeLength; j += 2)
                                point.addPoint(shape[j] + ofx, shape[j + 1] + ofy);

                            data.polygonPoint = point;
                        }

                    }
                });
            }
        });

        dirtyFlag.clear();
    }

    private _updateNavigationData() {
        //TODO
    }


    private _breakBatch(lastCell: TileSetCellData, curCell: TileSetCellData) {
        if (lastCell == null && curCell == null) return true;
        if (lastCell.cellowner.owner.id != curCell.cellowner.owner.id)//同一个tilesetGroup
            return true;
        if (lastCell.material == null && curCell.material == null) return false;
        return lastCell.material != curCell.material;
    }

    private _createRenderElement(chuckCellList: ChunkCellInfo[]) {
        if (chuckCellList.length == 0) return;
        let cellNum = chuckCellList.length;
        let cellData = chuckCellList[0].cell;
        let mat = cellData.material;
        let nativesData = cellData.cellowner;
        let texture = nativesData.owner.atlas;

        if (!mat) {
            mat = this._material;
        } else {
            // mat.setTexture("u_render2DTexture", texture);
        }

        if (mat == null) {
            mat = this._tileLayer.getDefalutMaterial(texture);
        }

        //init data
        let element = TileChunkPool._getTileRenderElement(cellNum);

        //init Buffer
        let renderElement = element.renderElement;
        renderElement.owner = this._tileLayer.owner._struct;
        let cachDatas = element.cacheData;
        let instanceColor = cachDatas[TileMapChunkData.instanceColorBufferIndex];
        let instanceposScal = cachDatas[TileMapChunkData.instanceposScalBufferIndex];
        let instanceuvOriScal = cachDatas[TileMapChunkData.instanceuvOriScalBufferIndex];
        let instanceuvTrans = cachDatas[TileMapChunkData.instanceuvTransBufferIndex];
        let pos: Vector2 = Vector2.TEMP;

        let renderElementLength = this._renderElementArray.length;
        //fill Data
        for (var i = 0; i < cellNum; i++) {
            let chuckcellInfo = chuckCellList[i];
            let curCell = chuckcellInfo.cell;
            let curNative = curCell.cellowner;

            // this._cellDataRefMap[curCell.gid].push(chuckcellInfo.chuckLocalindex);
            chuckcellInfo._cellPosInRenderData = i;
            chuckcellInfo._renderElementIndex = renderElementLength;
            this._getCellPos(chuckcellInfo, pos);

            let color = curCell.colorModulate;

            let dataOffset = i * 4;
            instanceColor[dataOffset] = color.r;
            instanceColor[dataOffset + 1] = color.g;
            instanceColor[dataOffset + 2] = color.b;
            instanceColor[dataOffset + 3] = color.a;
            let posOffset = curCell.texture_origin;
            //贴图的原点
            instanceposScal[dataOffset] = pos.x + posOffset.x;
            instanceposScal[dataOffset + 1] = pos.y + posOffset.y;
            let uvSize = curNative._getRegionSize();
            //实际像素范围
            instanceposScal[dataOffset + 2] = uvSize.x;
            instanceposScal[dataOffset + 3] = uvSize.y;
            //uv中心点
            let uvOri = curNative._getTextureUVOri();
            //uv范围
            let uvextend = curNative._getTextureUVExtends();
            instanceuvOriScal[dataOffset] = uvOri.x;
            instanceuvOriScal[dataOffset + 1] = uvOri.y;
            instanceuvOriScal[dataOffset + 2] = uvextend.x;
            instanceuvOriScal[dataOffset + 3] = uvextend.y;
            const transData = curCell.transData;
            instanceuvTrans[dataOffset] = transData.x;
            instanceuvTrans[dataOffset + 1] = transData.y;
            instanceuvTrans[dataOffset + 2] = transData.z;
            instanceuvTrans[dataOffset + 3] = transData.w;
        }
        //set VertexData
        let instanceColorBuffer = TileChunkPool._getVertexBuffer(TileMapShaderInit._tileMapCellColorInstanceDec, instanceColor);

        let instanceposScalBuffer = TileChunkPool._getVertexBuffer(TileMapShaderInit._tileMapCellPosScaleDec, instanceposScal);

        let instanceuvOriScalBuffer = TileChunkPool._getVertexBuffer(TileMapShaderInit._tileMapCellUVOriScaleDec, instanceuvOriScal);

        let instanceuvTransBuffer = TileChunkPool._getVertexBuffer(TileMapShaderInit._tileMapCellUVTrans, instanceuvTrans);

        let geometry = renderElement.geometry;
        geometry.setDrawElemenParams(this._tileLayer._grid._getBaseIndexCount(), 0);

        renderElement.materialShaderData = mat.shaderData;
        renderElement.subShader = mat.shader.getSubShaderAt(0);
        renderElement.value2DShaderData = this._tileLayer._spriteShaderData;

        let binVertexBuffers = [this._tileLayer._grid._getBaseVertexBuffer(), instanceColorBuffer, instanceposScalBuffer, instanceuvOriScalBuffer, instanceuvTransBuffer];
        let indexBuffer = this._tileLayer._grid._getBaseIndexBuffer();

        geometry.bufferState.applyState(binVertexBuffers, indexBuffer);
        geometry.instanceCount = cellNum;
        chuckCellList.length = 0;
        this._renderElementArray.push(element);
    }

    private _clearRenderElement() {
        for (var i = 0, n = this._renderElementArray.length; i < n; i++) {
            TileChunkPool._recoverTileRenderElement(this._renderElementArray[i]);
        }
        this._renderElementArray.length = 0;
    }

    /**
     * @internal
     * @param datas 渲染数据
     */
    _setRenderData(datas: {
        x: number;
        y: number;
        length: number;
        tiles: number[];
    }) {
        let maxCount = this._tileLayer._chunk.maxCell;
        if (datas.length > maxCount) { console.error("setRenderData error"); return; }
        this._updateChunkData(datas.x, datas.y);
        let tileSet = this._tileLayer.tileSet;
        let tiles = datas.tiles;
        let temp: Record<number, TileSetCellData> = {}
        for (let i = 0, len = tiles.length; i < len; i += 2) {
            let gid = tiles[i + 1];
            let celldata = temp[gid];
            if (!celldata) {
                celldata = tileSet.getCellDataByGid(gid);
                temp[gid] = celldata;
            }
            this._setCell(tiles[i], celldata);
        }
    }

    /**
     * @internal
     * 清理引用格子的数据
     */
    _clearnRefTileCellData() {
        let tileSet = this._tileLayer.tileSet;
        this._cellDataRefMap.forEach((value, key) => {
            let cellData = tileSet.getCellDataByGid(key)
            cellData._removeNoticeRenderTile(this);
        });
        this._cellDataRefMap = [];
        this._refGids.length = 0;
    }

    _clearAllChunkCellInfo() {
        for (let i = 0, len = this._chuckCellList.length; i < len; i++)
            this._clearChunkCellInfo(this._chuckCellList[i]);
        this._chuckCellList = [];
        this._cellDataMap = [];
    }

    /**
     * @internal
     */
    _update() {
        this._upeateGridData();
        this._updateRenderData();
        this._updatePhysicsData();
        this._updateLightShadowData();
        this._updateNavigationData();
    }



    /**
     * @internal
     */
    _getCellPos(sheetCell: ChunkCellInfo, out: Vector2) {
        out.x = this._oriCellIndex.x + sheetCell.cellx;
        out.y = this._oriCellIndex.y + sheetCell.celly;
        this._tileLayer._grid._gridToPixel(out.x, out.y, out);
    }


    /**
     * @internal
     * 合并到渲染列表
     */
    _mergeToElement(renderElements: IRenderElement2D[]) {
        this._renderElementArray.forEach(element => {
            renderElements.push(element.renderElement);
        });
    }

    /**
     * @internal
     * 更新一个格子
     * @param index local chunck index
     * @param gid cellData 
     */
    _setCell(index: number, cellData: TileSetCellData): void {
        //增加cell的时候 先查找是否有，没有直接增加，有直接change
        let gid = cellData.gid;
        if (gid < 0)
            return;

        if (!this._cellDataRefMap[gid]) {
            this._cellDataRefMap[gid] = [];
            this._refGids.push(gid);
            cellData._addNoticeRenderTile(this);
        }

        let chunkCellInfo = this._cellDataMap[index];
        if (chunkCellInfo == null) {//create one ChunkCellInfo
            let chunk = this._tileLayer._chunk;
            let localPos = Vector2.TEMP;
            chunk._getCellPosByChunkPosAndIndex(0, 0, index, localPos);
            // let xorderValue = index;
            // let yorderValue = this._tileLayer._chunk._getChunkIndexByCellPos(localPos.y, localPos.x);
            let chuckCellInfo = new ChunkCellInfo(localPos.x, localPos.y, index, cellData.z_index, cellData);
            this._cellDataRefMap[gid].push(index);
            this._cellDataMap[index] = chuckCellInfo;
            this._chuckCellList.push(chuckCellInfo);
            this._reCreateRenderData = true;
        } else if (chunkCellInfo.cell != cellData) {//change one ChunkCellInfo
            let oldcell = chunkCellInfo.cell;
            let oldGid = oldcell.gid;
            let localIndexArray = this._cellDataRefMap[oldGid];
            localIndexArray.splice(localIndexArray.indexOf(chunkCellInfo.chuckLocalindex), 1);
            if (localIndexArray.length == 0) {
                delete this._cellDataRefMap[oldGid];
                this._refGids.splice(this._refGids.indexOf(gid), 1);
                oldcell._removeNoticeRenderTile(this);
            }
            chunkCellInfo.cell = cellData;
            chunkCellInfo.zOrderValue = cellData.z_index;
            localIndexArray = this._cellDataRefMap[gid];
            localIndexArray.push(chunkCellInfo.chuckLocalindex);

            if (this._breakBatch(oldcell, cellData)) {
                this._reCreateRenderData = true;
            }
        }
        this._setDirtyFlag(gid, TileMapDirtyFlag.CELL_CHANGE);//这里需要改一下,住localIndex的标记
    }

    private _clearChunkCellInfo(cellInfo: ChunkCellInfo) {
        let physicsDatas = cellInfo._physicsDatas;
        if (physicsDatas) {
            let physics = this._tileLayer.tileMapPhysics;
            for (let i = 0, len = physicsDatas.length; i < len; i++)
                physics.destroyFixture(this._rigidBody, physicsDatas[i]);
        }

        let occluders = cellInfo._occluderDatas;
        if (occluders) {
            let occluder = this._tileLayer.tileMapOccluder;
            for (let i = 0, len = occluders.length; i < len; i++)
                occluder.removeOccluder(occluders[i]);
        }
    }

    /**
     * @internal
     */
    _removeCell(index: number) {
        let chunkCellInfo = this._cellDataMap[index];
        if (!chunkCellInfo)
            return;

        this._clearChunkCellInfo(chunkCellInfo);

        let sotIndex = this._chuckCellList.indexOf(chunkCellInfo);
        this._chuckCellList.splice(sotIndex, 1);
        delete this._cellDataMap[chunkCellInfo.chuckLocalindex];

        let gid = chunkCellInfo.cell.gid;
        let localIndexArray = this._cellDataRefMap[gid];
        localIndexArray.splice(localIndexArray.indexOf(index), 1);
        if (localIndexArray.length == 0) {
            delete this._cellDataRefMap[gid];
            this._refGids.splice(this._refGids.indexOf(gid), 1);
            chunkCellInfo.cell._removeNoticeRenderTile(this);
        }

        this._reCreateRenderData = true;
    }

    /**
     * 根据localIndex 获取CellData数据
     * @param index 
     * @returns 
     */
    getCell(index: number) {
        return this._cellDataMap[index];
    }

    /**
     * tileSetCellData 删除或者无效
     * @internal
     */
    _clearOneCell(cell: TileSetCellData) {
        let gid = cell.gid;
        let listArray = this._cellDataRefMap[gid];
        if (listArray)
            listArray.forEach(element => this._removeCell(element));

        cell._removeNoticeRenderTile(this);
        delete this._cellDataRefMap[gid];
        this._refGids.splice(this._refGids.indexOf(gid), 1);
        this._reCreateRenderData = true;
        this._dirtyFlags.forEach(flags => flags.delete(gid));
    }

    /**
     * @internal
     */
    _setDirtyFlag(gid: number, flag: TileMapDirtyFlag, type = DirtyFlagType.ALL) {
        if (type == DirtyFlagType.ALL) {
            for (let i = 0, len = DIRTY_TYPES; i < len; i++) {
                let flags = this._dirtyFlags[i];
                flags.set(gid, flags.get(gid) | flag);
            }
        } else {
            let flags = this._dirtyFlags[type];
            flags.set(gid, flags.get(gid) | flag);
        }
    }

    modifyRenderData() {
        this._reCreateRenderData = true;
    }

    /**
     * @internal
     */
    _forceUpdateDrity(flags: boolean[]) {
        this._cellDataRefMap.forEach((value, gid) => {
            for (let i = 0, len = DIRTY_TYPES; i < len; i++) {
                flags[i] && this._dirtyFlags[i].set(gid, TileMapDirtyFlag.CELL_CHANGE)
            }
        })
    }

    /**
     * @internal
     */
    _clearCell() {
        this._clearAllChunkCellInfo();
        this._clearnRefTileCellData();
        this._dirtyFlags.forEach(flags => flags.clear());
        this._reCreateRenderData = true;
    }

    /**
     * @internal
     */
    _destroy() {
        if (this._rigidBody) {
            this._tileLayer.tileMapPhysics.destroyRigidBody(this._rigidBody);
            this._rigidBody = null;
        }
        this._clearCell();
        this._clearRenderElement();
        this._cellDataRefMap = null;
        this._dirtyFlags = null;
        this._tileLayer = null;
    }

    /**
     * debug
     * @param sprite 
     * @param points 
     */
    _debugDrawLines(sprite: Sprite, points: number[]) {
        let lastx = points[0];
        let lasty = points[1];
        for (let i = 2, len = points.length; i < len; i += 2) {
            let curx = points[i];
            let cury = points[i + 1];
            sprite.graphics.drawLine(lastx, lasty, curx, cury, "#ff0000");
            lastx = curx;
            lasty = cury;
        }
    }


}

class TileChunkPool {

    static _instanceBufferPool: IVertexBuffer[] = [];
    static _renderElementPool: ITileMapRenderElement[] = [];

    static _getVertexBuffer(dec: VertexDeclaration, vertices: Float32Array) {
        let buffer = TileChunkPool._instanceBufferPool.pop();
        if (!buffer) {
            buffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
            buffer.instanceBuffer = true;
        }
        buffer.setDataLength(vertices.byteLength);
        buffer.setData(vertices.buffer, 0, 0, vertices.byteLength);
        buffer.vertexDeclaration = dec;
        return buffer;
    }

    static _recoverVertexBuffer(buffer: IVertexBuffer) {
        this._instanceBufferPool.push(buffer);

    }

    static _getTileRenderElement(cellNum: number): ITileMapRenderElement {
        let element = TileChunkPool._renderElementPool.pop();
        if (!element) {
            let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementInstance);
            let renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            renderElement.geometry = geometry;
            geometry.bufferState = LayaGL.renderDeviceFactory.createBufferState();
            geometry.indexFormat = IndexFormat.UInt16
            renderElement.renderStateIsBySprite = false;
            renderElement.nodeCommonMap = ["BaseRender2D"];

            element = {
                renderElement,
                cacheData: null,
                updateFlag: [false, false, false, false],
                maxCell: 0
            }
        }
        element.cacheData = [new Float32Array(cellNum * 4), new Float32Array(cellNum * 4), new Float32Array(cellNum * 4), new Float32Array(cellNum * 4)];
        return element;
    }

    static _recoverTileRenderElement(element: ITileMapRenderElement) {
        element.cacheData = null;
        let renderElement = element.renderElement;
        renderElement.materialShaderData = null;
        renderElement.value2DShaderData = null;
        renderElement.subShader = null;

        let geometry = renderElement.geometry;
        for (let j = 2, jn = geometry.bufferState._vertexBuffers.length; j < jn; j++)
            TileChunkPool._recoverVertexBuffer(geometry.bufferState._vertexBuffers[j]);

        let updateFlag = element.updateFlag;
        for (let i = 0; i < 4; i++) updateFlag[i] = false;

        TileChunkPool._renderElementPool.push(element);
    }
}