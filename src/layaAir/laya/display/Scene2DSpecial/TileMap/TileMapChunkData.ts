import { LayaGL } from "../../../layagl/LayaGL";
import { Vector2 } from "../../../maths/Vector2";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Material } from "../../../resource/Material";
import { Base64Tool } from "../../../utils/Base64Tool";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { TileAlternativesData } from "./TileAlternativesData";
import { TileShape } from "./TileMapEnum";
import { TILELAYER_SORTMODE, TileMapLayer, TILEMAPLAYERDIRTYFLAG } from "./TileMapLayer";
import { TileMapShaderInit } from "./TileMapShader/TileMapShaderInit";
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
    //是否重新组织渲染
    private _reCreateRenderData: boolean;

    /**
     * Key1 cellData GID
     * Value chuckLocalIndex[],同时计算引用
     */
    private _cellDataRefMap: Map<number, number[]>;

    /**
     * 帧处理cell数据更新
     * Key1 cellData GID
     * value dirtyFlag
     */
    private _cellDirtyFlag: Map<number, number>;

    /**
     * 缓存chuckCellInfo数据
     * Key1 chuckLocalIndex GID
     * value ChunkCellInfo
     */
    private _cellDataMap: Record<number, ChunkCellInfo> = {};

    //用于排序的列表
    private _chuckCellList: ChunkCellInfo[] = [];

    private _physisDelayCreate: Set<number>;

    //渲染数据
    private _renderElementArray: ITileMapRenderElement[];

    private _animatorAlterArray: Map<number, TileAlternativesData> = new Map();

    private _tileLayer: TileMapLayer;

    private _oriCellIndex: Vector2;

    private _gridShape: TileShape;

    private _tileSize: Vector2;

    private _sortMode: TILELAYER_SORTMODE;

    private _materail: Material;

    /**
     * @internal
     * 渲染块 x 坐标
     */
    _chunkx: number;

    /**
     * @internal
     * 渲染块 y 坐标
     */
    _chunky: number;


    constructor(layer: TileMapLayer, chunkx: number, chunky: number, materail: Material = null) {
        this._materail = materail;
        this._cellDataRefMap = new Map();
        this._cellDirtyFlag = new Map();
        this._tileSize = new Vector2();
        this._tileLayer = layer;
        this._reCreateRenderData = true;
        this._oriCellIndex = new Vector2(0, 0);
        this._renderElementArray = [];
        this._physisDelayCreate = new Set();
        this._updateChunkData(chunkx, chunky);
    }



    // /**
    //  * @internal
    //  * 将数据合并到二维map中
    //  */
    // _mergeBuffer(datas: Map<number, Map<number, number>>, minRange: Vector2, maxRange: Vector2) {
    //     const tempVec2 = Vector2.TempVector2;
    //     this._sheetCellMaps.forEach((cell, index) => {
    //         this._tileLayer._chunk._getCellPosByChunkPosAndIndex(0, 0, index, tempVec2);
    //         tempVec2.x += this._oriCellIndex.x;
    //         tempVec2.y += this._oriCellIndex.y;
    //         minRange.x = Math.min(minRange.x, tempVec2.x);
    //         minRange.y = Math.min(minRange.y, tempVec2.y);
    //         maxRange.x = Math.max(maxRange.x, tempVec2.x);
    //         maxRange.y = Math.max(maxRange.y, tempVec2.y);
    //         if (!datas.has(tempVec2.y)) {
    //             datas.set(tempVec2.y, new Map<number, number>());
    //         }
    //         datas.get(tempVec2.y).set(tempVec2.x, cell.gid);
    //     })
    // }

    // _setBuffer(datas: Map<number, Map<number, number>>, minRange: Vector2, maxRange: Vector2): boolean {
    //     this._clearRenderData();
    //     const chunk = this._tileLayer._chunk;
    //     let starx = Math.max(minRange.x, this._oriCellIndex.x);
    //     let stary = Math.max(minRange.y, this._oriCellIndex.y);
    //     let endx = Math.min(maxRange.x, this._oriCellIndex.x + this._tileLayer.renderTileSize - 1);
    //     let endy = Math.min(maxRange.y, this._oriCellIndex.y + this._tileLayer.renderTileSize - 1);
    //     let haveData = false;
    //     for (var j = stary; j <= endy; j++) {
    //         if (!datas.has(j)) continue;
    //         let row = datas.get(j);
    //         for (var i = starx; i <= endx; i++) {
    //             if (row.has(i)) {
    //                 const index = chunk._getChunkIndexByCellPos(i - this._oriCellIndex.x, j - this._oriCellIndex.y);
    //                 this._updateCellGid(index, row.get(i));
    //                 haveData = true;
    //             }
    //         }
    //     }
    //     this._reCreateRenderData = true;
    //     return haveData;
    // }


    // /**
    //  * @internal
    //  * 清理渲染节点数据
    //  */
    // _clearRenderData() {
    //     //清理格子的数据
    //     this._sheetCellMaps.clear();
    //     //清理渲染引用数据
    //     this._cellDataRefMap.clear();
    //     this._clearnRefTileCellData();
    //     this._needCheckGids.clear();
    //     this._cellDirtyFlag.clear();
    //     //清理渲染数据
    //     this._clearRenderElement2D();
    // }

    private _updateChunkData(chunkx: number, chunky: number) {
        this._chunkx = chunkx;
        this._chunky = chunky;
        this._tileLayer._chunk._getCellPosByChunkPosAndIndex(chunkx, chunky, 0, this._oriCellIndex);
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
            this._clearRenderElement2D();//清除渲染数据
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
            let instanceColorBufferIndex = 0;//提成静态TODO
            let instanceposScalBufferIndex = 1;
            let instanceuvOriScalBufferIndex = 2;
            let instanceuvTransBufferIndex = 3;

            this._cellDirtyFlag.forEach((value, key) => {
                //cell posOri extends  
                let pos: Vector2 = Vector2.TempVector2;
                let cellDataUseArray = this._cellDataRefMap.get(key);

                cellDataUseArray.forEach(element => {
                    let chuckCellinfo = this._cellDataMap[element];
                    let cellData = chuckCellinfo.cell;
                    let tilemapRenderElementInfo = this._renderElementArray[chuckCellinfo._renderElementIndex];
                    if (value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE || (value & TILEMAPLAYERDIRTYFLAG.CELL_QUAD)) {
                        let data = tilemapRenderElementInfo.cacheData[instanceposScalBufferIndex];
                        tilemapRenderElementInfo.updateFlag[instanceposScalBufferIndex] = true;
                        this._getCellPos(chuckCellinfo, pos);
                        let posOffset = cellData.texture_origin;
                        let dataoffset = chuckCellinfo._cellPosInRenderData * 4;
                        data[dataoffset] = pos.x + posOffset.x;
                        data[dataoffset + 1] = pos.y + posOffset.y;
                        let uvSize = cellData.cellowner._getTextureUVSize();
                        data[dataoffset + 2] = uvSize.x;
                        data[dataoffset + 3] = uvSize.y;
                    }
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_QUADUV)) {
                        //cell uv /Animation
                        let data = tilemapRenderElementInfo.cacheData[instanceuvOriScalBufferIndex];
                        tilemapRenderElementInfo.updateFlag[instanceuvOriScalBufferIndex] = true;
                        let dataoffset = chuckCellinfo._cellPosInRenderData * 4;
                        let uvOri = cellData.cellowner._getTextureUVOri();
                        let uvextend = cellData.cellowner._getTextureUVExtends();
                        data[dataoffset] = uvOri.x;
                        data[dataoffset + 1] = uvOri.y;
                        data[dataoffset + 2] = uvextend.x;
                        data[dataoffset + 3] = uvextend.y;
                    }
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_COLOR)) {
                        //cellColor
                        let data = tilemapRenderElementInfo.cacheData[instanceColorBufferIndex];
                        tilemapRenderElementInfo.updateFlag[instanceColorBufferIndex] = true;
                        let dataoffset = chuckCellinfo._cellPosInRenderData * 4;
                        let color = cellData.colorModulate;
                        data[dataoffset] = color.r;
                        data[dataoffset + 1] = color.g;
                        data[dataoffset + 2] = color.b;
                        data[dataoffset + 3] = color.a;

                    }
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN)) {
                        let data = tilemapRenderElementInfo.cacheData[instanceuvTransBufferIndex];
                        tilemapRenderElementInfo.updateFlag[instanceuvTransBufferIndex] = true;
                        let dataoffset = chuckCellinfo._cellPosInRenderData * 4;
                        let transData = cellData._transData;
                        data[dataoffset] = transData.x;
                        data[dataoffset + 1] = transData.y;
                        data[dataoffset + 2] = transData.z;
                        data[dataoffset + 3] = transData.w;
                    }
                });
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
        //TODO
        if (!this._tileLayer.physicsEnable) { return; }
        let chunk = this._tileLayer._chunk;
        let temp = Vector2.TempVector2;
        this._physisDelayCreate.forEach((value) => {
            chunk._getCellPosByChunkPosAndIndex(this._chunkx, this._chunky, value, temp);
            let x = temp.x;
            let y = temp.y;
            this._tileLayer.tileMapPhysis.removePhysisShape(x, y);

            let chuckData = this._cellDataMap[value];
            if (chuckData) {
                this._tileLayer.tileMapPhysis.addPhysisShape(x, y, chuckData.cell);
            }
        });
        this._physisDelayCreate.clear();
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
        if (mat == null) {
            mat = this._materail;
        }
        let texture = cellData.cellowner.owner.atlas;
        if (mat == null) {
            mat = this._tileLayer.tileSet.getDefalutMaterial(texture.url);
        }

        mat.setTexture("u_render2DTexture", texture);

        if (texture.gammaCorrection != 1) {//预乘纹理特殊处理
            mat.addDefine(ShaderDefines2D.GAMMATEXTURE);
        } else {
            mat.removeDefine(ShaderDefines2D.GAMMATEXTURE);
        }


        //init data
        let renderElement = this._createRenderElement2D();

        //init Buffer
        let cachDatas = [new Float32Array(cellNum * 4), new Float32Array(cellNum * 4), new Float32Array(cellNum * 4), new Float32Array(cellNum * 4)];
        let updateFlags = [false, false, false, false];
        let instanceColor = cachDatas[0];
        let instanceposScal = cachDatas[1];
        let instanceuvOriScal = cachDatas[2];
        let instanceuvTrans = cachDatas[3];
        let pos: Vector2 = Vector2.TempVector2;
        let element: ITileMapRenderElement = {
            renderElement: renderElement,
            maxCell: cellNum,
            cacheData: cachDatas,
            updateFlag: updateFlags
        }
        element.renderElement.materialShaderData = mat.shaderData;
        element.renderElement.subShader = mat.shader.getSubShaderAt(0);
        let renderElementLength = this._renderElementArray.length;
        //fill Data
        for (var i = 0; i < cellNum; i++) {
            let chuckcellInfo = chuckCellList[i];
            let celldata = chuckcellInfo.cell;

            this._cellDataRefMap.get(celldata.getGid()).push(chuckcellInfo.chuckLocalindex);
            chuckcellInfo._cellPosInRenderData = i;
            chuckcellInfo._renderElementIndex = renderElementLength;
            this._getCellPos(chuckcellInfo, pos);

            let color = celldata.colorModulate;

            let dataOffset = i * 4;
            instanceColor[dataOffset] = color.r;
            instanceColor[dataOffset + 1] = color.g;
            instanceColor[dataOffset + 2] = color.b;
            instanceColor[dataOffset + 3] = color.a;
            let posOffset = celldata.texture_origin;
            instanceposScal[dataOffset] = pos.x + posOffset.x;
            instanceposScal[dataOffset + 1] = pos.y + posOffset.y;
            let uvSize = celldata.cellowner._getTextureUVSize();
            instanceposScal[dataOffset + 2] = uvSize.x;
            instanceposScal[dataOffset + 3] = uvSize.y;
            let uvOri = celldata.cellowner._getTextureUVOri();
            let uvextend = celldata.cellowner._getTextureUVExtends();
            instanceuvOriScal[dataOffset] = uvOri.x;
            instanceuvOriScal[dataOffset + 1] = uvOri.y;
            instanceuvOriScal[dataOffset + 2] = uvextend.x;
            instanceuvOriScal[dataOffset + 3] = uvextend.y;
            const transData = celldata._transData;
            instanceuvTrans[dataOffset] = transData.x;
            instanceuvTrans[dataOffset + 1] = transData.y;
            instanceuvTrans[dataOffset + 2] = transData.z;
            instanceuvTrans[dataOffset + 3] = transData.w;
        }
        //set VertexData
        let instanceColorBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        instanceColorBuffer.instanceBuffer = true;
        instanceColorBuffer.setDataLength(instanceColor.byteLength);
        instanceColorBuffer.setData(instanceColor.buffer, 0, 0, instanceColor.byteLength);
        instanceColorBuffer.vertexDeclaration = TileMapShaderInit._tileMapCellColorInstanceDec;

        let instanceposScalBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        instanceposScalBuffer.instanceBuffer = true;
        instanceposScalBuffer.setDataLength(instanceposScal.byteLength);
        instanceposScalBuffer.setData(instanceposScal.buffer, 0, 0, instanceposScal.byteLength);
        instanceposScalBuffer.vertexDeclaration = TileMapShaderInit._tileMapCellPosScaleDec;

        let instanceuvOriScalBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        instanceuvOriScalBuffer.instanceBuffer = true;
        instanceuvOriScalBuffer.setDataLength(instanceuvOriScal.byteLength);
        instanceuvOriScalBuffer.setData(instanceuvOriScal.buffer, 0, 0, instanceuvOriScal.byteLength);
        instanceuvOriScalBuffer.vertexDeclaration = TileMapShaderInit._tileMapCellUVOriScaleDec;

        let instanceuvTransBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        instanceuvTransBuffer.instanceBuffer = true;
        instanceuvTransBuffer.setDataLength(instanceuvTrans.byteLength);
        instanceuvTransBuffer.setData(instanceuvTrans.buffer, 0, 0, instanceuvTrans.byteLength);
        instanceuvTransBuffer.vertexDeclaration = TileMapShaderInit._tileMapCellUVTrans;

        let binVertexBuffers = [this._tileLayer._grid._getBaseVertexBuffer(), instanceColorBuffer, instanceposScalBuffer, instanceuvOriScalBuffer, instanceuvTransBuffer];
        let indexBuffer = this._tileLayer._grid._getBaseIndexBuffer();
        element.renderElement.geometry.bufferState.applyState(binVertexBuffers, indexBuffer);
        element.renderElement.geometry.instanceCount = cellNum;
        chuckCellList.length = 0;
        this._renderElementArray.push(element);
    }

    private _createRenderElement2D(): IRenderElement2D {
        let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementInstance);
        let renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        renderElement.geometry = geometry;
        geometry.bufferState = LayaGL.renderDeviceFactory.createBufferState();
        geometry.setDrawElemenParams(this._tileLayer._grid._getBaseIndexCount(), 0);
        geometry.indexFormat = IndexFormat.UInt16
        renderElement.renderStateIsBySprite = false;
        renderElement.value2DShaderData = this._tileLayer._spriteShaderData;
        renderElement.nodeCommonMap = ["BaseRender2D"];
        return renderElement;
    }

    private _clearRenderElement2D() {
        for (var i = 0, n = this._renderElementArray.length; i < n; i++) {
            let elementInfo = this._renderElementArray[i];
            elementInfo.cacheData = null;
            let geometry = elementInfo.renderElement.geometry;
            for (let j = 2, jn = geometry.bufferState._vertexBuffers.length; j < jn; j++) {
                geometry.bufferState._vertexBuffers[j].destroy();
            }
            geometry.bufferState.destroy();
            geometry.destroy();
            elementInfo.renderElement.destroy();
        }
        this._renderElementArray = [];
    }

    /**
     * @internal
     * @param datas 渲染数据
     */
    _setRenderData(datas: string) {
        let buffer = Base64Tool.decode(datas);
        let maxCount = this._tileLayer._chunk.maxCell;
        let tileSet = this._tileLayer.tileSet;
        let bufferData = new Float32Array(buffer);
        if (bufferData.length != maxCount + 2) { console.error("setRenderData error"); return; }
        this._updateChunkData(bufferData[0], bufferData[1]);
        let renderTileSize = this._tileLayer.renderTileSize;
        let index = 2;
        for (var j = 0; j < renderTileSize; j++) {
            for (var i = 0; i < renderTileSize; i++) {
                this._setCell(index - 2, tileSet.getCellDataByGid(bufferData[index++]));
            }
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
        this._cellDataRefMap.clear();
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
        let gid = cellData.getGid();
        if (gid <= 0)
            return;

        if (!this._cellDataRefMap.has(gid)) {
            this._cellDataRefMap.set(gid, []);
            if (cellData.cellowner._hasAni())
                this._animatorAlterArray.set(cellData.cellowner.getId(), cellData.cellowner);
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
            this._cellDataRefMap.get(gid).push(xorderValue);
            this._cellDataMap[index] = chuckCellInfo;
            this._reCreateRenderData = true;
            this._chuckCellList.push(chuckCellInfo);
        } else if (chuckCellInfo.cell != cellData) {//change one ChunkCellInfo
            let oldcell = chuckCellInfo.cell;
            let localIndexArray = this._cellDataRefMap.get(oldcell.getGid());
            localIndexArray.splice(localIndexArray.indexOf(chuckCellInfo.chuckLocalindex), 1);
            if (localIndexArray.length == 0) {
                this._cellDataRefMap.delete(oldcell.getGid());
                oldcell._removeNoticeRenderTile(this);
            }
            chuckCellInfo.cell = cellData;
            localIndexArray = this._cellDataRefMap.get(cellData.getGid());
            localIndexArray.push(chuckCellInfo.chuckLocalindex);
            this._setDirtyFlag(cellData.getGid(), TILEMAPLAYERDIRTYFLAG.CELL_CHANGE);//这里需要改一下
        }

        //物理TODO
        this._physisDelayCreate.add(index);
    }

    /**
     * @internal
     */
    _removeCell(index: number) {
        let chunkCellInfo = this._cellDataMap[index];
        if (!chunkCellInfo)
            return;

        let localIndexArray = this._cellDataRefMap.get(chunkCellInfo.cell.getGid());
        localIndexArray.slice(localIndexArray.indexOf(index))
        if (localIndexArray.length == 0) {
            this._cellDataRefMap.delete(chunkCellInfo.cell.getGid());
            chunkCellInfo.cell._removeNoticeRenderTile(this);
        }

        let sotIndex = this._chuckCellList.indexOf(chunkCellInfo);
        this._chuckCellList.splice(sotIndex, 1);

        delete this._cellDataMap[index];
        this._reCreateRenderData = true;
    }

    /**
     * tileSetCellData 删除或者无效
     * @internal
     */
    _clearOneCell(cell: TileSetCellData) {
        let gid = cell.getGid();
        let listArray = this._cellDataRefMap.get(gid);
        if (listArray)
            listArray.forEach(element => {
                let chunkCellInfo = this._cellDataMap[element];
                let sotIndex = this._chuckCellList.indexOf(chunkCellInfo);
                this._chuckCellList.splice(sotIndex, 1);
                delete this._cellDataMap[element];
            });
        this._cellDataRefMap.delete(gid);
        this._reCreateRenderData = true;
        this._cellDirtyFlag.delete(gid);
    }

    /**
     * @internal
     */
    _setDirtyFlag(gid: number, flag: number) {
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
        this._chuckCellList = [];
        this._cellDataMap = [];
        this._cellDataRefMap.clear();
        this._cellDirtyFlag.clear();
        this._reCreateRenderData = true;
    }

    /**
     * @internal
     */
    _destroy() {
        this._clearCell();
        this._clearRenderElement2D();
        this._cellDataRefMap = null;
        this._cellDirtyFlag = null;

    }


}

