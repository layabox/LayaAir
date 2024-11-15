import { LayaGL } from "../../../layagl/LayaGL";
import { Vector2 } from "../../../maths/Vector2";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { Material } from "../../../resource/Material";
import { Base64Tool } from "../../../utils/Base64Tool";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { TileShape } from "./TileMapEnum";
import { TILELAYER_SORTMODE, TileMapLayer, TILEMAPLAYERDIRTYFLAG } from "./TileMapLayer";
import { TileSetCellData } from "./TileSetCellData";
interface ITileMapRenderElement {
    renderElement: IRenderElement2D,
    maxCell: number;
    cacheData: Array<Float32Array>;
    updateFlag: Array<boolean>;
}

//用于存储格子的数据
class SheetCellIndex {
    //单元格引用贴图的id
    public gid: number;
    //单元格横向序列
    public xOrider: number;
    //单元格纵向序列
    public yOrider: number;
    //单元格z序列
    public zOrider: number;
    //单元格在chunk中的位置
    public cellx: number;
    public celly: number;
    
    constructor(xOrider: number, yOrider: number, zOrider: number = 0, cellx:number, celly:number) {
        this.xOrider = xOrider;
        this.yOrider = yOrider;
        this.zOrider = zOrider;
        this.cellx = cellx;
        this.celly = celly;
    }
}



/**
 * 用来产生渲染数据
* @internal
*/
export class TileMapLayerRenderTile {
    /**
     * @internal
     */
    static _tileMapPositionUVColorDec: VertexDeclaration;

    /**
     * @internal
     */
    static _tileMapCellColorInstanceDec: VertexDeclaration;
    /**
     * @internal
     */
    static _tileMapCellPosScaleDec: VertexDeclaration;

    /**
     * @internal
     */
    static _tileMapCellUVOriScaleDec: VertexDeclaration;
    /**
     * @internal
     */
    static _tileMapCellUVTrans: VertexDeclaration;

    /**
     * @internal 初始化顶点格式
     */
    static _initDeclaration_() {
        if (TileMapLayerRenderTile._tileMapPositionUVColorDec) return;
        TileMapLayerRenderTile._tileMapPositionUVColorDec = new VertexDeclaration(32, [
            new VertexElement(0, VertexElementFormat.Vector4, 0),//vec4 a_position uv
            new VertexElement(16, VertexElementFormat.Vector4, 1),//vec4 a_color
        ]);

        TileMapLayerRenderTile._tileMapCellColorInstanceDec = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 2),//vec4 a_cellColor
        ]);

        TileMapLayerRenderTile._tileMapCellPosScaleDec = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 3),//vec4 a_cellPosScale
        ]);

        TileMapLayerRenderTile._tileMapCellUVOriScaleDec = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 4),//vec4 a_cellUVOriScale
        ]);

        TileMapLayerRenderTile._tileMapCellUVTrans = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 5),//vec4 a_uvTrans
        ]);
    }

    //是否重新组织渲染
    private _reCreateRenderData: boolean;
    //vector2 表示渲染数据的第几个renderElement的第几个cell
    private _cellDataRefMap: Map<number, Map<number, Vector2>>;

    //未添加到渲染列表的gid 临时使用
    private _needCheckGids: Set<number>;

    _cellDatasMap: Map<number, TileSetCellData>;
    //每个TileSetCellData的脏数据标记
    private _cellDirtyFlag: Map<number, number>;
    //每个cell 的 序列id 对应的 gid
    private _sheetCellMaps: Map<number, SheetCellIndex>;

    //用于排序的列表
    private _softList: SheetCellIndex[];

    private _physisDelayCreate:Set<number>;

    //渲染数据
    private _renderElementArray: ITileMapRenderElement[];

    private _tileLayer: TileMapLayer;
    private _oriCellIndex: Vector2;

    private _gridShape: TileShape;
    private _tileSize: Vector2;
    private _sortMode: TILELAYER_SORTMODE;


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
    private _materail: Material;

    constructor(layer: TileMapLayer, chunkx: number, chunky: number, materail: Material = null) {
        this._materail = materail;
        this._cellDataRefMap = new Map();
        this._cellDirtyFlag = new Map();
        this._cellDatasMap = new Map();
        this._sheetCellMaps = new Map();
        this._tileSize = new Vector2();
        this._tileLayer = layer;
        this._reCreateRenderData = true;
        this._oriCellIndex = new Vector2(0, 0);
        this._renderElementArray = [];
        this._softList = [];
        this._needCheckGids = new Set();
        this._physisDelayCreate = new Set();
        this.updateRenderTileSize(chunkx, chunky);
    }

    public updateRenderTileSize(chunkx: number, chunky: number) {
        this._chunkx = chunkx;
        this._chunky = chunky;
        this._tileLayer._chunk.getCellPosByChunkPosAndIndex(chunkx, chunky, 0, this._oriCellIndex);
    }

    /**
     * @internal
    * @param datas 渲染数据
    */
    _setRenderData(datas: string) {
        let buffer = Base64Tool.decode(datas);
        let maxCount = this._tileLayer._chunk.maxCell;
        let bufferData = new Float32Array(buffer);
        if (bufferData.length != maxCount + 2) { console.error("setRenderData error"); return; }
        this.updateRenderTileSize(bufferData[0], bufferData[1]);
        let renderTileSize = this._tileLayer.renderTileSize;
        let index = 2;
        for (var j = 0; j < renderTileSize; j++) {
            for (var i = 0; i < renderTileSize; i++) {
                this._updateCellGid(index-2, bufferData[index++]);
            }
        }
    }


    /**
     * @internal
     * 将数据合并到二维map中
     */
    _mergeBuffer(datas: Map<number, Map<number, number>>, minRange: Vector2, maxRange: Vector2) {
        const tempVec2 = Vector2.TempVector2;
        this._sheetCellMaps.forEach((cell, index) => {
            this._tileLayer._chunk.getCellPosByChunkPosAndIndex(0,0, index, tempVec2);
            tempVec2.x += this._oriCellIndex.x;
            tempVec2.y += this._oriCellIndex.y;
            minRange.x = Math.min(minRange.x, tempVec2.x);
            minRange.y = Math.min(minRange.y, tempVec2.y);
            maxRange.x = Math.max(maxRange.x, tempVec2.x);
            maxRange.y = Math.max(maxRange.y, tempVec2.y);
            if (!datas.has(tempVec2.y)) {
                datas.set(tempVec2.y, new Map<number, number>());
            }
            datas.get(tempVec2.y).set(tempVec2.x, cell.gid);
        })
    }

    _setBuffer(datas: Map<number, Map<number, number>>, minRange: Vector2, maxRange: Vector2):boolean {
        this._clearRenderData();
        const chunk = this._tileLayer._chunk;
        let starx = Math.max(minRange.x, this._oriCellIndex.x);
        let stary = Math.max(minRange.y, this._oriCellIndex.y);
        let endx = Math.min(maxRange.x, this._oriCellIndex.x + this._tileLayer.renderTileSize-1);
        let endy = Math.min(maxRange.y, this._oriCellIndex.y + this._tileLayer.renderTileSize-1);
        let haveData = false;
        for (var j = stary; j <= endy; j++) {
            if(!datas.has(j)) continue;
            let row = datas.get(j);
            for (var i = starx; i <= endx; i++) {
                if (row.has(i)) {
                    const index= chunk.getChunkIndexByCellPos(i - this._oriCellIndex.x, j - this._oriCellIndex.y);
                    this._updateCellGid(index, row.get(i));
                    haveData = true;
                } 
            }
        }
        this._reCreateRenderData = true;
        return haveData;
    }

    
    /**
     * @internal
     * 清理引用格子的数据
     */
    _clearnRefTileCellData() {
        this._cellDatasMap.forEach((value, key) => {
            value._removeNoticeRenderTile(this);
            this._needCheckGids.add(key);
        });
        this._cellDataRefMap.clear();
    }

    /**
     * @internal
     * 清理渲染节点数据
     */
    _clearRenderData() {
        //清理格子的数据
        this._sheetCellMaps.clear();
        //清理渲染引用数据
        this._cellDataRefMap.clear();
        this._clearnRefTileCellData();
        this._needCheckGids.clear();
        this._cellDirtyFlag.clear();
        //清理渲染数据
        this._clearRenderElement2D();
    }


    /**
     * @internal
     * 同步TileSet 到本地文件；需要修改的是TileSetCellData
     */
    private _upeateGridData() {
        if (this._sortMode != this._tileLayer.sortMode) {
            this._sortMode = this._tileLayer.sortMode;
            this._reCreateRenderData = true;
        }
        let tileSet = this._tileLayer.tileSet;
        //同步引用格子数据
        if (this._needCheckGids.size > 0) {
            this._needCheckGids.forEach((value) => {
                this._cellDataRefMap.set(value, new Map<number, Vector2>());
                let data = tileSet.getCellDataByGid(value);
                if(data != null){
                    data._addNoticeRenderTile(this);
                }
                this._cellDatasMap.set(value, data);

                this._reCreateRenderData = true;
            });
            this._needCheckGids.clear();
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

    /**
     * @internal 更新渲染数据
     */
    private _updateRenderData() {
        if (this._reCreateRenderData) {
            this._reCreateRenderData = false;
            this._clearRenderElement2D();//清除渲染数据
            if (this._sheetCellMaps.size == 0)
                return;
            switch (this._tileLayer.sortMode) {
                case TILELAYER_SORTMODE.YSort:
                    this._softList.sort((a, b) => { return a.yOrider - b.yOrider });
                    break;
                case TILELAYER_SORTMODE.XSort:
                    this._softList.sort((a, b) => { return a.xOrider - b.xOrider });
                    break;
                case TILELAYER_SORTMODE.ZINDEXSORT:
                    this._softList.sort((a, b) => {
                        if (a.zOrider == b.zOrider) { return a.xOrider - b.xOrider }
                        else { return a.zOrider - b.zOrider }
                    });
                    break;
            }
            let lastCell;
            let tempCellIndexArray: SheetCellIndex[] = [];
            for (var i = 0; i < this._softList.length; i++) {
                // let cellIndex = this._softList[i].xOrider;
                let sortData = this._softList[i];
                let cellData = this._getCellDataByCellIndex(sortData);
                if (!cellData)
                    continue;

                if (!lastCell) {
                    lastCell = cellData;
                    tempCellIndexArray.push(sortData);
                    continue;
                }
                if (this._breakBatch(lastCell, cellData)) {
                    lastCell = cellData;
                    this._createRenderElement(tempCellIndexArray)
                }
                tempCellIndexArray.push(sortData);
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
                let cellData = this._cellDatasMap.get(key);
                cellDataUseArray.forEach((cellvalue, xOrider) => {
                    if (value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE || (value & TILEMAPLAYERDIRTYFLAG.CELL_QUAD)) {

                        let data = this._renderElementArray[cellvalue.x].cacheData[instanceposScalBufferIndex];
                        this._renderElementArray[cellvalue.x].updateFlag[instanceposScalBufferIndex] = true;
                        this._getCellPos(this._sheetCellMaps.get(xOrider), pos);
                        let posOffset = cellData.texture_origin;
                        let dataoffset = cellvalue.y * 4;
                        data[dataoffset] = pos.x + posOffset.x;
                        data[dataoffset + 1] = pos.y + posOffset.y;
                        let uvSize = cellData.cellowner._getTextureUVSize();
                        data[dataoffset + 2] = uvSize.x;
                        data[dataoffset + 3] = uvSize.y;
                    }
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_QUADUV)) {
                        //cell uv /Animation
                        let data = this._renderElementArray[cellvalue.x].cacheData[instanceuvOriScalBufferIndex];
                        this._renderElementArray[cellvalue.x].updateFlag[instanceuvOriScalBufferIndex] = true;
                        let dataoffset = cellvalue.y * 4;
                        let uvOri = cellData.cellowner._getTextureUVOri();
                        let uvextend = cellData.cellowner._getTextureUVExtends();
                        data[dataoffset] = uvOri.x;
                        data[dataoffset + 1] = uvOri.y;
                        data[dataoffset + 2] = uvextend.x;
                        data[dataoffset + 3] = uvextend.y;
                    }
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_COLOR)) {
                        //cellColor
                        let data = this._renderElementArray[cellvalue.x].cacheData[instanceColorBufferIndex];
                        this._renderElementArray[cellvalue.x].updateFlag[instanceColorBufferIndex] = true;
                        let dataoffset = cellvalue.y * 4;
                        let color = cellData.colorModulate;
                        data[dataoffset] = color.r;
                        data[dataoffset + 1] = color.g;
                        data[dataoffset + 2] = color.b;
                        data[dataoffset + 3] = color.a;

                    }
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN)) {
                        let data = this._renderElementArray[cellvalue.x].cacheData[instanceuvTransBufferIndex];
                        this._renderElementArray[cellvalue.x].updateFlag[instanceuvTransBufferIndex] = true;
                        let dataoffset = cellvalue.y * 4;
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
        if(!this._tileLayer.physicsEnable){ return; }
        let chunk = this._tileLayer._chunk;
        let temp = Vector2.TempVector2;
        this._physisDelayCreate.forEach((value) => {
            chunk.getCellPosByChunkPosAndIndex(this._chunkx,this._chunky,value, temp);
            let x = temp.x;
            let y = temp.y;
            this._tileLayer.tileMapPhysis.removePhysisShape(x, y);

            let cell = this._getCellDataByCellIndex(this._sheetCellMaps.get(value));
            if(cell){
                this._tileLayer.tileMapPhysis.addPhysisShape(x, y, cell);
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

    _updateTile() {
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
    private _breakBatch(lastCell: TileSetCellData, curCell: TileSetCellData) {
        if(lastCell == null && curCell == null) return true;
        if(lastCell.material == null && curCell.material == null) return true;
        return lastCell.material != curCell.material;
    }

    /**
     * @internal
     */
    _getCellPos(sheetCell:SheetCellIndex, out: Vector2) {
        out.x = this._oriCellIndex.x + sheetCell.cellx;
        out.y = this._oriCellIndex.y + sheetCell.celly;
        this._tileLayer._grid.gridToPiex(out.x, out.y, out);
    }


    /**
     * @internal
     */
    private _getCellDataByCellIndex(sheetCell:SheetCellIndex): TileSetCellData {
        return this._cellDatasMap.get(sheetCell.gid);
    }

    /**
     * @internal
     * 合并到渲染列表
     */
    _mergeToElement(renderElements: IRenderElement2D[]){
        this._updateTile();
        this._renderElementArray.forEach(element => {
            renderElements.push(element.renderElement);
        });
    }

    /**
     * @internal
     * 更新一个格子
     */
    _updateCellGid(index:number, gid: number):boolean{
        //增加cell的时候 先查找是否有，没有直接增加，有直接change
        if (gid <= 0) { return false; }

        if (!this._cellDataRefMap.has(gid)) {
            this._needCheckGids.add(gid);
        }
        let cellData = this._sheetCellMaps.get(index);
        if (cellData == null) {
            let chunk = this._tileLayer._chunk;
            let temp = Vector2.TempVector2;
            chunk.getCellPosByChunkPosAndIndex(0,0,index, temp);
            let x = temp.x;
            let y = temp.y;
            let yOrider = this._tileLayer._chunk.getChunkIndexByCellPos(y, x);
            cellData = new SheetCellIndex(index, yOrider,0,x,y);
            this._sheetCellMaps.set(index,cellData);
            this._softList.push(cellData);
        }else{
            let oldId = cellData.gid;
            if(this._cellDataRefMap.has(oldId)){
                let refData = this._cellDataRefMap.get(oldId);
                refData.delete(index);
                if(refData.size == 0){
                    this._cellDataRefMap.delete(oldId);
                }
            }
        }

        this._physisDelayCreate.add(index);
        
        cellData.gid = gid;
        this._reCreateRenderData = true;
        return true;
    }

    /**
     * @internal
     */
    _removeCell(index: number) {
        let cellData = this._sheetCellMaps.get(index);
        if (!cellData)
            return;
        this._sheetCellMaps.delete(index);
        this._reCreateRenderData = true;

        let refData = this._cellDataRefMap.get(cellData.gid);
        refData.delete(index);
        let sotIndex = this._softList.findIndex((value, index, obj) => {return value.xOrider == index});
        this._softList.splice(sotIndex, 1);
        
    }

    /**
     * @internal
     */
    _clearOneCell(cell: TileSetCellData) {
        // let posMap = this._cellDataRefMap.get(cell);
        // if (posMap && posMap.size > 0) {
        //     posMap.forEach((value, key) => {
        //         this._cells.delete(key);
        //     });
        //     cell._removeNoticeRenderTile(this);
        // }
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
        this._sheetCellMaps.clear();
        this._reCreateRenderData = true;
        // this._cellDataRefMap.forEach((value, key) => {
        //     key._removeNoticeRenderTile(this);
        // });
        this._cellDataRefMap.clear();
        this._cellDirtyFlag.clear();

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

    /**
     * @internal
     * 创建一个渲染批次的数据
     */
    private _createRenderElement(sheetCells: SheetCellIndex[]){
        if(sheetCells.length == 0) return;
        let cellNum = sheetCells.length;
        let cellData = this._getCellDataByCellIndex(sheetCells[0]);
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
        let renderElement = this._createRenderElement2D();
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
            let sheetCell = sheetCells[i];
            let celldata = this._getCellDataByCellIndex(sheetCell);

            this._cellDataRefMap.get(sheetCell.gid).set(sheetCell.xOrider, new Vector2(renderElementLength, i));
            this._getCellPos(sheetCell, pos);
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
        instanceColorBuffer.vertexDeclaration = TileMapLayerRenderTile._tileMapCellColorInstanceDec;

        let instanceposScalBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        instanceposScalBuffer.instanceBuffer = true;
        instanceposScalBuffer.setDataLength(instanceposScal.byteLength);
        instanceposScalBuffer.setData(instanceposScal.buffer, 0, 0, instanceposScal.byteLength);
        instanceposScalBuffer.vertexDeclaration = TileMapLayerRenderTile._tileMapCellPosScaleDec;

        let instanceuvOriScalBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        instanceuvOriScalBuffer.instanceBuffer = true;
        instanceuvOriScalBuffer.setDataLength(instanceuvOriScal.byteLength);
        instanceuvOriScalBuffer.setData(instanceuvOriScal.buffer, 0, 0, instanceuvOriScal.byteLength);
        instanceuvOriScalBuffer.vertexDeclaration = TileMapLayerRenderTile._tileMapCellUVOriScaleDec;

        let instanceuvTransBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        instanceuvTransBuffer.instanceBuffer = true;
        instanceuvTransBuffer.setDataLength(instanceuvTrans.byteLength);
        instanceuvTransBuffer.setData(instanceuvTrans.buffer, 0, 0, instanceuvTrans.byteLength);
        instanceuvTransBuffer.vertexDeclaration = TileMapLayerRenderTile._tileMapCellUVTrans;

        let binVertexBuffers = [this._tileLayer._getBaseVertexBuffer(), instanceColorBuffer, instanceposScalBuffer, instanceuvOriScalBuffer, instanceuvTransBuffer];
        let indexBuffer = this._tileLayer._getBaseIndexBuffer();
        element.renderElement.geometry.bufferState.applyState(binVertexBuffers, indexBuffer);
        element.renderElement.geometry.instanceCount = cellNum;
        sheetCells.length = 0;
        this._renderElementArray.push(element);
    }

    private _createRenderElement2D(): IRenderElement2D {
        let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementInstance);
        let renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        renderElement.geometry = geometry;
        geometry.bufferState = LayaGL.renderDeviceFactory.createBufferState();
        geometry.setDrawElemenParams(this._tileLayer._getBaseIndexCount(), 0);
        geometry.indexFormat = this._tileLayer._getBaseIndexFormat();
        renderElement.renderStateIsBySprite = false;
        renderElement.value2DShaderData = this._tileLayer._spriteShaderData;
        renderElement.nodeCommonMap = ["BaseRender2D"];
        return renderElement;
    }


    private _clearRenderElement2D() {
        for (var i = 0, n = this._renderElementArray.length; i < n; i++) {
            let elementInfo = this._renderElementArray[i];
            elementInfo.cacheData = null;
            let geoemtry = elementInfo.renderElement.geometry;
            for (let j = 2, jn = geoemtry.bufferState._vertexBuffers.length; j < jn; j++) {
                geoemtry.bufferState._vertexBuffers[j].destroy();
            }
            geoemtry.bufferState.destroy();
            geoemtry.destroy();
            elementInfo.renderElement.destroy();
        }
        this._renderElementArray = [];
    }
}

