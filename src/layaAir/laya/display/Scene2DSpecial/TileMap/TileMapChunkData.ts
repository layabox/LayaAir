
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector2 } from "../../../maths/Vector2";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IVertexBuffer } from "../../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { Material } from "../../../resource/Material";
import { Base64Tool } from "../../../utils/Base64Tool";
import { TileAlternativesData } from "./TileAlternativesData";
import { TileShape } from "./TileMapEnum";
import { TILELAYER_SORTMODE, TileMapLayer, TILEMAPLAYERDIRTYFLAG } from "./TileMapLayer";
import { TileMapShaderInit } from "./TileMapShader/TileMapShaderInit";
import { TileMapUtils } from "./TileMapUtils";
import { TileSetCellData } from "./TileSetCellData";
interface ITileMapRenderElement {
    renderElement: IRenderElement2D,
    maxCell: number;
    cacheData: Array<Float32Array>;
    updateFlag: Array<boolean>;
}


//用于存储格子的数据
class ChunkCellInfo {
    //单元格引用贴图的id
    cell: TileSetCellData;
    //按照X轴排序 chuckLocalindex
    chuckLocalindex: number;
    //
    yOrderValue: number;
    //单元格z序列
    zOrderValue: number;
    //单元格在chunk中的位置
    cellx: number;

    celly: number;

    _physicsDatas:any[];

    _renderElementIndex: number;//在第几个RenderElement中

    _cellPosInRenderData: number;//渲染数据中的第几个cell

    constructor(cellx: number, celly: number, chuckLocalindex: number, yOrider: number, zOrider: number = 0, cell: TileSetCellData) {
        this.chuckLocalindex = chuckLocalindex;
        this.yOrderValue = yOrider;
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

    /**
     * 帧处理cell数据更新
     * Key1 cellData GID ---- 
     * value dirtyFlag
     */
    private _cellDirtyFlag: Map<number, number>;

    /**
     * 缓存chuckCellInfo数据
     * Key1 chuckLocalIndex
     * value ChunkCellInfo
     */
    private _cellDataMap: Record<number, ChunkCellInfo> = {};

    /** @private 用于排序的列表 */
    _chuckCellList: ChunkCellInfo[] = [];

    //渲染数据
    private _renderElementArray: ITileMapRenderElement[];

    private _animatorAlterArray: Map<number, TileAlternativesData> = new Map();

    _tileLayer: TileMapLayer;

    private _oriCellIndex: Vector2;

    private _gridShape: TileShape;

    private _tileSize: Vector2;

    private _sortMode: TILELAYER_SORTMODE;

    /** @private Editor */
    _material:Material;
    
    /**
     * 渲染块 x 坐标
     */
    chunkX: number;

    /**
     * 渲染块 y 坐标
     */
    chunkY: number;

    constructor() {
        this._cellDataRefMap = [];
        this._cellDirtyFlag = new Map();
        this._tileSize = new Vector2();
        this._reCreateRenderData = true;
        this._oriCellIndex = new Vector2(0, 0);
        this._renderElementArray = [];
    }

     /** @internal */
     get cellDataRefMap(){
        return this._cellDataRefMap;
    }

    /**
     *  @internal 
     *  危险操作
     */
    set cellDataRefMap( data: number[][] ) {
        if (data) {
            this._clearCell();
            this._cellDataRefMap = data;
        }
    }

    /** @internal */
    _parseCellDataRefMap(){
        //只做初始化，有数据就不处理
        if (this._chuckCellList.length) return;
        
        let layer = this._tileLayer;
        let tileSet = layer.tileSet;
        let chunk = this._tileLayer._chunk;

        let localPos = Vector2.TempVector2;

        this._cellDataRefMap.forEach((localIndexs:number[],gid:number)=>{
            if (localIndexs){
                let cellData = tileSet.getCellDataByGid(gid);
                for (let i = 0 , len = localIndexs.length; i < len; i++) {
                    let index = localIndexs[i];
                    chunk._getCellPosByChunkPosAndIndex(0, 0, index, localPos);
                    let yorderValue = chunk._getChunkIndexByCellPos(localPos.y, localPos.x);
                    let chuckCellInfo = new ChunkCellInfo(localPos.x, localPos.y, index, yorderValue, cellData.z_index, cellData);
                    this._cellDataMap[index] = chuckCellInfo;
                    this._chuckCellList.push(chuckCellInfo);
                }
            }
        });

        this._reCreateRenderData = true;
    }


    /**
     * @internal
     * 将数据合并到二维map中
     */
    _mergeBuffer(datas: Map<number, Map<number, TileSetCellData>>, minRange: Vector2, maxRange: Vector2) {
        const tempVec2 = Vector2.TempVector2;
        let infos = this._chuckCellList;
        for (let i = 0 , len = infos.length; i < len; i++) {
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
                row =new Map<number, TileSetCellData>();
                datas.set(cellY, row);
            }
            row.set(cellX, info.cell);
        }
        
    }

    _setBuffer(datas: Map<number, Map<number, TileSetCellData>>, minRange: Vector2, maxRange: Vector2 , tileSize:number ): number {
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
                    this._setCell(index , data);
                    // haveData = true;
                    mark ++
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
            this._cellDataRefMap.forEach((value, key) => {
                this._setDirtyFlag(key, TILEMAPLAYERDIRTYFLAG.CELL_QUAD);
            });
            this._reCreateRenderData = true;
        }

        if (!Vector2.equals(this._tileSize, tileSet.tileSize)) {
            tileSet.tileSize.cloneTo(this._tileSize);
            this._cellDataRefMap.forEach((value, key) => {
                this._setDirtyFlag(key, TILEMAPLAYERDIRTYFLAG.CELL_QUAD | TILEMAPLAYERDIRTYFLAG.CELL_QUADUV);
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
                case TILELAYER_SORTMODE.YSort:
                    this._chuckCellList.sort((a, b) => { return a.yOrderValue - b.yOrderValue });
                    break;
                case TILELAYER_SORTMODE.XSort:
                    this._chuckCellList.sort((a, b) => { return a.chuckLocalindex - b.chuckLocalindex });
                    break;
                case TILELAYER_SORTMODE.ZINDEXSORT:
                    this._chuckCellList.sort((a, b) => {
                        if (a.zOrderValue == b.zOrderValue) { return a.chuckLocalindex - b.chuckLocalindex }
                        else { return a.zOrderValue - b.zOrderValue }
                    });
                    break;
            }
            let lastCell;
            let tempCellIndexArray: ChunkCellInfo[] = [];
            for (var i = 0; i < this._chuckCellList.length; i++) {
                // let cellIndex = this._softList[i].xOrider;
                let chuckCellInfoData = this._chuckCellList[i];
                let cellData = chuckCellInfoData.cell;
                if (!cellData)
                    continue;

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
        } else if (this._cellDirtyFlag.size > 0) {
            this._cellDirtyFlag.forEach((value, key) => {
                //cell posOri extends  
                let pos: Vector2 = Vector2.TempVector2;
                let cellDataUseArray = this._cellDataRefMap[key];

                cellDataUseArray.forEach(element => {
                    let chuckCellinfo = this._cellDataMap[element];
                    let cellData = chuckCellinfo.cell;
                    let nativesData = cellData.cellowner;
                    let tilemapRenderElementInfo = this._renderElementArray[chuckCellinfo._renderElementIndex];
                    if (value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE || (value & TILEMAPLAYERDIRTYFLAG.CELL_QUAD)) {
                        let data = tilemapRenderElementInfo.cacheData[TileMapChunkData.instanceposScalBufferIndex];
                        tilemapRenderElementInfo.updateFlag[TileMapChunkData.instanceposScalBufferIndex] = true;
                        this._getCellPos(chuckCellinfo, pos);
                        let posOffset = cellData.texture_origin;
                        let dataoffset = chuckCellinfo._cellPosInRenderData * 4;
                        data[dataoffset] = pos.x + posOffset.x;
                        data[dataoffset + 1] = pos.y + posOffset.y;
                        let uvSize = nativesData._getTextureUVSize();
                        data[dataoffset + 2] = uvSize.x;
                        data[dataoffset + 3] = uvSize.y;

                    }
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_QUADUV)) {
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
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_COLOR)) {
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
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN)) {
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

                value &= ~(TILEMAPLAYERDIRTYFLAG.CELL_QUAD|TILEMAPLAYERDIRTYFLAG.CELL_QUADUV|TILEMAPLAYERDIRTYFLAG.CELL_COLOR|TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN);
                if (value) this._cellDirtyFlag.set(key,value);
                else this._cellDirtyFlag.delete(key);
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
        }
    }

    private _updatePhysicsData() {
        if (!this._tileLayer.physicsEnable || !this._cellDirtyFlag.size) return;
        let physicsLayers = this._tileLayer.tileSet.physicsLayers;
        let physics = this._tileLayer.tileMapPhysics;
        let layerCount = physicsLayers.length;
        let chunk = this._tileLayer._chunk;
        let matrix = this._tileLayer._globalTramsfrom();
        let pos: Vector2 = Vector2.TempVector2;

        this._cellDirtyFlag.forEach((value, key) => {
            //cell posOri extends  
            let cellDataUseArray = this._cellDataRefMap[key];

            cellDataUseArray.forEach(element => {
                let chunkCellInfo = this._cellDataMap[element];
                let cellData = chunkCellInfo.cell;

                //TODO Layer变更时需要删除
                if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) ||(value & TILEMAPLAYERDIRTYFLAG.CELL_PHYSICS)) {
                    chunk._getPixelByChunkPosAndIndex(this.chunkX , this.chunkY , chunkCellInfo.chuckLocalindex , pos);

                    let ofx = pos.x;
                    let ofy = pos.y;

                    let cellDatas = cellData.physicsDatas;

                    let datas = chunkCellInfo._physicsDatas;
                    if (!datas) {
                        datas = [];
                        chunkCellInfo._physicsDatas = datas;
                    }

                    for (let i = 0; i < layerCount; i++) {
                        let physicslayer = physicsLayers[i];
                        let pIndex = physicslayer.index;
                        let data = datas[pIndex];
                        if (data) {
                            physics._destroyFixture(data);
                        }
                        let shape = cellDatas[pIndex].shape;
                        let shapeLength = shape.length;
                        let nShape: Array<number> = new Array(shapeLength);

                        for (let j = 0; j < shapeLength; j++) {
                            let x = shape[j];
                            let y = shape[j + 1];
                            TileMapUtils.transfromPointByValue(matrix, x + ofx, y + ofy, pos);
                            nShape[j] = pos.x;
                            nShape[j + 1] = pos.y;
                        }

                        data = physics._createFixture(physicslayer , nShape);
                    }

                }
            });

            value &= ~(TILEMAPLAYERDIRTYFLAG.CELL_PHYSICS | TILEMAPLAYERDIRTYFLAG.LAYER_PHYSICS);
            if (value) this._cellDirtyFlag.set(key,value);
            else this._cellDirtyFlag.delete(key);
        });
    }

    private _updateLightShadowData() {
        //TODO
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
        }

        if (mat == null) {
            mat = this._tileLayer.getDefalutMaterial(texture);
        }

        //init data
        let element = TileChunkPool._getTileRenderElement(cellNum);
        
        //init Buffer
        let renderElement = element.renderElement;
        let cachDatas = element.cacheData;
        let instanceColor = cachDatas[TileMapChunkData.instanceColorBufferIndex];
        let instanceposScal = cachDatas[TileMapChunkData.instanceposScalBufferIndex];
        let instanceuvOriScal = cachDatas[TileMapChunkData.instanceuvOriScalBufferIndex];
        let instanceuvTrans = cachDatas[TileMapChunkData.instanceuvTransBufferIndex];
        let pos: Vector2 = Vector2.TempVector2;
        
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
            instanceposScal[dataOffset] = pos.x + posOffset.x;
            instanceposScal[dataOffset + 1] = pos.y + posOffset.y;
            let uvSize = curNative._getTextureUVSize();
            instanceposScal[dataOffset + 2] = uvSize.x;
            instanceposScal[dataOffset + 3] = uvSize.y;
            let uvOri = curNative._getTextureUVOri();
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
        let instanceColorBuffer = TileChunkPool._getVertexBuffer(TileMapShaderInit._tileMapCellColorInstanceDec , instanceColor );
   
        let instanceposScalBuffer = TileChunkPool._getVertexBuffer(TileMapShaderInit._tileMapCellPosScaleDec , instanceposScal );

        let instanceuvOriScalBuffer = TileChunkPool._getVertexBuffer(TileMapShaderInit._tileMapCellUVOriScaleDec , instanceuvOriScal );

        let instanceuvTransBuffer = TileChunkPool._getVertexBuffer(TileMapShaderInit._tileMapCellUVTrans , instanceuvTrans );

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
    _setRenderData(datas:{
        x:number;
        y:number;
        length:number;
        tiles:number[];
     }) {
        let maxCount = this._tileLayer._chunk.maxCell;
        if (datas.length > maxCount) { console.error("setRenderData error"); return; }
        this._updateChunkData(datas.x, datas.y);
        let tileSet = this._tileLayer.tileSet;
        let tiles = datas.tiles;
        let temp:Record<number , TileSetCellData> = {}
        for (let i = 0 , len = tiles.length; i < len; i += 2) {
            let gid = tiles[i + 1];
            let celldata = temp[gid];
            if (!celldata) {
                celldata = tileSet.getCellDataByGid(gid);
                temp[gid] = celldata;
            }
            this._setCell(tiles[i] , celldata);            
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
    }

    _clearChunkCellInfo(){
        for (let i = 0 , len = this._chuckCellList.length; i < len; i++) {
            let physicsDatas = this._chuckCellList[i]._physicsDatas;
            if (physicsDatas) {
                for (let i = 0 , len = physicsDatas.length; i < len; i++)
                    this._tileLayer.tileMapPhysics._destroyFixture(physicsDatas[i]);
            }
        }
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
        this._cellDirtyFlag.clear();
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
        if (gid <= 0)
            return;

        if (!this._cellDataRefMap[gid]) {
            this._cellDataRefMap[gid] = [];
            if (cellData.cellowner._hasAni())
                this._animatorAlterArray.set(cellData.cellowner.nativeId, cellData.cellowner);
            cellData._addNoticeRenderTile(this);
        }

        let chuckCellInfo = this._cellDataMap[index];
        if (chuckCellInfo == null) {//create one ChunkCellInfo
            let chunk = this._tileLayer._chunk;
            let localPos = Vector2.TempVector2;
            let xorderValue = index;
            chunk._getCellPosByChunkPosAndIndex(0, 0, index, localPos);
            let yorderValue = this._tileLayer._chunk._getChunkIndexByCellPos(localPos.y, localPos.x);
            let chuckCellInfo = new ChunkCellInfo(localPos.x, localPos.y, xorderValue, yorderValue, cellData.z_index, cellData);
            this._cellDataRefMap[gid].push(xorderValue);
            this._cellDataMap[index] = chuckCellInfo;
            this._reCreateRenderData = true;
            this._chuckCellList.push(chuckCellInfo);
        } else if (chuckCellInfo.cell != cellData) {//change one ChunkCellInfo
            let oldcell = chuckCellInfo.cell;
            let oldGid = oldcell.gid;
            let localIndexArray = this._cellDataRefMap[oldGid];
            localIndexArray.splice(localIndexArray.indexOf(chuckCellInfo.chuckLocalindex), 1);
            if (localIndexArray.length == 0) {
                delete this._cellDataRefMap[oldGid];
                oldcell._removeNoticeRenderTile(this);
            }
            chuckCellInfo.cell = cellData;
            localIndexArray = this._cellDataRefMap[gid];
            localIndexArray.push(chuckCellInfo.chuckLocalindex);
            this._setDirtyFlag(gid, TILEMAPLAYERDIRTYFLAG.CELL_CHANGE);//这里需要改一下
        }

    }

    /**
     * @internal
     */
    _removeCell(index: number) {
        let chunkCellInfo = this._cellDataMap[index];
        if (!chunkCellInfo)
            return;

        let physicsDatas = chunkCellInfo._physicsDatas;
        if (physicsDatas) {
            for (let i = 0 , len = physicsDatas.length; i < len; i++)
                this._tileLayer.tileMapPhysics._destroyFixture(physicsDatas[i]);
        }

        let sotIndex = this._chuckCellList.indexOf(chunkCellInfo);
        this._chuckCellList.splice(sotIndex, 1);
        delete this._cellDataMap[chunkCellInfo.chuckLocalindex];

        let gid = chunkCellInfo.cell.gid;
        let localIndexArray = this._cellDataRefMap[gid];
        localIndexArray.slice(localIndexArray.indexOf(index));
        if (localIndexArray.length == 0) {
            delete this._cellDataRefMap[gid];
            chunkCellInfo.cell._removeNoticeRenderTile(this);
        }

        this._reCreateRenderData = true;
    }

    /**
     * tileSetCellData 删除或者无效
     * @internal
     */
    _clearOneCell(cell: TileSetCellData) {
        let gid = cell.gid;
        let listArray = this._cellDataRefMap[gid];
        if (listArray)
            listArray.forEach(element =>this._removeCell(element));

        cell._removeNoticeRenderTile(this);
        delete this._cellDataRefMap[gid];
        this._reCreateRenderData = true;
        this._cellDirtyFlag.delete(gid);
    }

    /**
     * @internal
     */
    _setDirtyFlag(gid: number, flag: TILEMAPLAYERDIRTYFLAG) {
        if (this._cellDirtyFlag.has(gid)) {
            let newFlag = this._cellDirtyFlag.get(gid) | flag;
            this._cellDirtyFlag.set(gid, newFlag);
        } else {
            this._cellDirtyFlag.set(gid, flag);
        }
    }

    /**
     * @internal
     */
    _clearCell() {
        this._clearChunkCellInfo();
        this._clearnRefTileCellData();
        this._cellDirtyFlag.clear();
        this._reCreateRenderData = true;
    }

    /**
     * @internal
     */
    _destroy() {
        this._clearCell();
        this._clearRenderElement();
        this._cellDataRefMap = null;
        this._cellDirtyFlag = null;

    }


}

class TileChunkPool{

    static _instanceBufferPool:IVertexBuffer[] = [];
    static _renderElementPool:ITileMapRenderElement[] = [];

    static _getVertexBuffer(dec:VertexDeclaration , vertices:Float32Array){
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

    static _recoverVertexBuffer(buffer:IVertexBuffer){
        this._instanceBufferPool.push(buffer);
        
    }

    static _getTileRenderElement(cellNum : number):ITileMapRenderElement{
        let element = TileChunkPool._renderElementPool.pop();
        if(!element){
            let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementInstance);
            let renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            renderElement.geometry = geometry;
            geometry.bufferState = LayaGL.renderDeviceFactory.createBufferState();
            geometry.indexFormat = IndexFormat.UInt16
            renderElement.renderStateIsBySprite = false;
            renderElement.nodeCommonMap = ["BaseRender2D"];

            element = {
                renderElement,
                cacheData:null,
                updateFlag:[false, false, false, false],
                maxCell:0
            }
        }
        element.cacheData =  [new Float32Array(cellNum * 4), new Float32Array(cellNum * 4), new Float32Array(cellNum * 4), new Float32Array(cellNum * 4)];
        return element;
    }

    static _recoverTileRenderElement(element:ITileMapRenderElement){
        element.cacheData = null;
        let renderElement = element.renderElement;
        renderElement.materialShaderData = null;
        renderElement.value2DShaderData = null;
        renderElement.subShader = null;

        let geometry = renderElement.geometry;
        for (let j = 2, jn = geometry.bufferState._vertexBuffers.length; j < jn; j++) 
            TileChunkPool._recoverVertexBuffer(geometry.bufferState._vertexBuffers[j]);

        let updateFlag = element.updateFlag;
        for (let i = 0 ; i < 4; i++) updateFlag[i] = false;

        TileChunkPool._renderElementPool.push(element);
    }
}