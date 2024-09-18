import { LayaGL } from "../../../layagl/LayaGL";
import { Vector2 } from "../../../maths/Vector2";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { TILELAYER_SORTMODE, TileMapLayer, TILEMAPLAYERDIRTYFLAG } from "./TileMapLayer";
import { TileSetCellData } from "./TileSetCellData";
interface ITileMapRenderElement {
    renderElement: IRenderElement2D,
    maxCell: number;
    cacheData: Array<Float32Array>;
    updateFlag: Array<boolean>;
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
        TileMapLayerRenderTile._tileMapPositionUVColorDec = new VertexDeclaration(32, [
            new VertexElement(0, VertexElementFormat.Vector4, 0),//vec4 a_position uv
            new VertexElement(1, VertexElementFormat.Vector4, 1),//vec4 a_color
        ]);

        TileMapLayerRenderTile._tileMapCellColorInstanceDec = new VertexDeclaration(32, [
            new VertexElement(0, VertexElementFormat.Vector4, 2),//vec4 a_cellColor
        ]);

        TileMapLayerRenderTile._tileMapCellPosScaleDec = new VertexDeclaration(32, [
            new VertexElement(0, VertexElementFormat.Vector4, 3),//vec4 a_cellPosScale
        ]);

        TileMapLayerRenderTile._tileMapCellUVOriScaleDec = new VertexDeclaration(32, [
            new VertexElement(0, VertexElementFormat.Vector4, 4),//vec4 a_cellUVOriScale
        ]);

        TileMapLayerRenderTile._tileMapCellUVTrans = new VertexDeclaration(32, [
            new VertexElement(0, VertexElementFormat.Vector4, 5),//vec4 a_uvTrans
        ]);
    }
    //是否重新组织渲染
    private _reCreateRenderData: boolean;
    //vector2 表示渲染数据的第几个renderElement的第几个cell
    private _cellDataRefMap: Map<TileSetCellData, Map<number, Vector2>>;
    //每个TileSetCellData的脏数据标记
    private _cellDirtyFlag: Map<TileSetCellData, number>;
    //记录tile中的cell
    private _cells: Map<number, TileSetCellData>;

    private _tileSize: number;//unit cell

    private _renderElementArray: ITileMapRenderElement[];

    private _tileLayer: TileMapLayer;

    private _oriPixelPos: Vector2;

    constructor(layer: TileMapLayer, oriPixel: Vector2) {
        if (!TileMapLayerRenderTile._tileMapPositionUVColorDec) {
            TileMapLayerRenderTile._initDeclaration_();
        }
        this._cellDataRefMap = new Map();
        this._cellDirtyFlag = new Map();
        this._cells = new Map();
        this._tileLayer = layer;
        this._tileSize = layer.renderTileSize;
        this._reCreateRenderData = true;
        this._oriPixelPos = oriPixel.clone();
    }

    /**
     * @internal 更新渲染数据
     */
    private _updateRenderData() {
        if (this._reCreateRenderData) {
            this.clearRenderElement2D();//清除渲染数据
            this._reCreateRenderData = false;
            if (this._cells.size == 0)
                return;
            let lastCell;
            let tempCellIndexArray: number[] = [];
            switch (this._tileLayer.sortMode) {
                case TILELAYER_SORTMODE.YSort:
                    //TODO
                    break;
                case TILELAYER_SORTMODE.XSort:
                    for (var x = 0; x < this._tileSize; x++) {
                        for (var y = 0; y < this._tileSize; y++) {
                            let cellIndex = this._getcellIndex(x, y);
                            let cellData = this._cells.get(cellIndex);
                            if (!cellData)
                                return;
                            if (this._breakBatch(lastCell, cellData)) {
                                this._renderElementArray.push(this._createRenderElement(tempCellIndexArray));
                                tempCellIndexArray = [];
                            } else {
                                tempCellIndexArray.push(cellIndex);
                                this._cellDataRefMap.get(cellData).set(cellIndex, new Vector2(this._renderElementArray.length, tempCellIndexArray.length - 1));
                            }
                        }
                    }
                    this._renderElementArray.push(this._createRenderElement(tempCellIndexArray));
                    tempCellIndexArray = [];
                    break;
                case TILELAYER_SORTMODE.ZINDEXSORT:
                    //TODO
                    break;
            }
        } else if (this._cellDirtyFlag.size > 0) {
            let instanceColorBufferIndex = 0;//提成静态TODO
            let instanceposScalBufferIndex = 1;
            let instanceuvOriScalBufferIndex = 2;
            let instanceuvTransBufferIndex = 3;
            this._cellDirtyFlag.forEach((value, key) => {
                //cell posOri extends  
                let pos: Vector2 = Vector2.TempVector2;
                let cellDataUseArray = this._cellDataRefMap.get(key);
                cellDataUseArray.forEach((cellvalue, cellKey) => {
                    if (value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE || (value & TILEMAPLAYERDIRTYFLAG.CELL_QUAD)) {
                        this._getLocalPos(cellKey, pos);
                        let data = this._renderElementArray[cellvalue.x].cacheData[instanceposScalBufferIndex];
                        this._renderElementArray[cellvalue.x].updateFlag[instanceposScalBufferIndex] = true;
                        let dataoffset = cellvalue.y * 4;
                        data[dataoffset] = this._oriPixelPos.x + pos.x;
                        data[dataoffset + 1] = this._oriPixelPos.y + pos.y;
                        data[dataoffset + 2] = key.cellowner.sizeByAtlas.x / 2;
                        data[dataoffset + 3] = key.cellowner.sizeByAtlas.y / 2;
                    }
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_QUADUV)) {
                        //cell uv /Animation
                        let data = this._renderElementArray[cellvalue.x].cacheData[instanceuvOriScalBufferIndex];
                        this._renderElementArray[cellvalue.x].updateFlag[instanceuvOriScalBufferIndex] = true;
                        let dataoffset = cellvalue.y * 4;
                        let uvOri = key.cellowner._getTextureUVOri();
                        let uvextend = key.cellowner._getTextureUVExtends();
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
                        let color = key.colorModulate;
                        data[dataoffset] = color.r;
                        data[dataoffset + 1] = color.g;
                        data[dataoffset + 2] = color.b;

                    }
                    if ((value & TILEMAPLAYERDIRTYFLAG.CELL_CHANGE) || (value & TILEMAPLAYERDIRTYFLAG.CELL_UVTRAN)) {
                        let data = this._renderElementArray[cellvalue.x].cacheData[instanceuvTransBufferIndex];
                        this._renderElementArray[cellvalue.x].updateFlag[instanceuvTransBufferIndex] = true;
                        let dataoffset = cellvalue.y * 4;
                        //cell uv trans
                        data[dataoffset] = key.flip_h ? 1 : 0;
                        data[dataoffset + 1] = key.flip_v ? 1 : 0;
                        data[dataoffset + 2] = key.transpose ? 1 : 0;
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
    }

    private _updateLightShadowData() {
        //TODO
    }

    private _updateNavigationData() {
        //TODO
    }

    _updateTile() {
        this._updateRenderData();
        this._updatePhysicsData();
        this._updateLightShadowData();
        this._updateNavigationData();
        this._cellDirtyFlag.clear();
    }

    private _breakBatch(lastCell: TileSetCellData, curCell: TileSetCellData) {
        return lastCell.material != curCell.material;
    }

    /**
     * @internal
     */
    _getcellIndex(localX: number, localY: number) {
        return localX * this._tileSize + localY;
    }

    /**
     * @internal
     */
    _getLocalPos(index: number, out: Vector2) {
        let x = (index / this._tileSize) | 0;
        out.setValue(x, index - x);
    }


    private _createRenderElement(cellIndexArray: number[]) {
        let cellNum = cellIndexArray.length;
        let mat = this._cells.get(cellIndexArray[0]).material;
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
        //fill Data
        for (var i = 0; i < cellNum; i++) {
            let indexvalue = cellIndexArray[i];
            let celldata = this._cells.get(indexvalue);
            this._getLocalPos(cellIndexArray[i], pos);
            let color = celldata.colorModulate;

            let dataOffset = i * 4;
            instanceColor[dataOffset] = color.r;
            instanceColor[dataOffset + 1] = color.g;
            instanceColor[dataOffset + 2] = color.b;
            let posOffset = celldata._getPosOffset();
            instanceposScal[dataOffset] = this._oriPixelPos.x + pos.x + posOffset.x;
            instanceposScal[dataOffset + 1] = this._oriPixelPos.y + pos.y + posOffset.y;
            instanceposScal[dataOffset + 2] = celldata.cellowner.sizeByAtlas.x / 2;
            instanceposScal[dataOffset + 3] = celldata.cellowner.sizeByAtlas.y / 2;
            let uvOri = celldata.cellowner._getTextureUVOri();
            let uvextend = celldata.cellowner._getTextureUVExtends();
            instanceuvOriScal[dataOffset] = uvOri.x;
            instanceuvOriScal[dataOffset + 1] = uvOri.y;
            instanceuvOriScal[dataOffset + 2] = uvextend.x;
            instanceuvOriScal[dataOffset + 3] = uvextend.y;
            instanceuvTrans[dataOffset] = celldata.flip_h ? 1 : 0;
            instanceuvTrans[dataOffset + 1] = celldata.flip_v ? 1 : 0;
            instanceuvTrans[dataOffset + 2] = celldata.transpose ? 1 : 0;
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
        return element;
    }

    /**
     * @internal
     */
    _addCell(index: number, cell: TileSetCellData) {
        //增加cell的时候 先查找是否有，没有直接增加，有直接change

        if (!this._cellDataRefMap.get(cell)) {
            this._cellDataRefMap.set(cell, new Map<number, Vector2>());
            cell._addNoticeRenderTile(this);
        }
        let oldcell = this._cells.get(index)
        if (!oldcell) {
            this._cells.set(index, cell);
            this._reCreateRenderData = true;
        } else {
            if (this._breakBatch(oldcell, cell)) {
                this._reCreateRenderData = true;
            } else {
                this._setDirtyFlag(cell, TILEMAPLAYERDIRTYFLAG.CELL_CHANGE);
                let oldCellRefMap = this._cellDataRefMap.get(oldcell);
                let cacheData = oldCellRefMap.get(index);//因为渲染数据不打断，所以不需要重新创建数据，只需要替换数据
                oldCellRefMap.delete(index);
                if (oldCellRefMap.size == 0) {
                    oldcell._removeNoticeRenderTile(this);
                }
                this._cellDataRefMap.get(cell).set(index, cacheData);
            }
        }
    }

    /**
     * @internal
     */
    _removeCell(index: number) {
        let oldCell = this._cells.get(index);
        if (!oldCell)
            return;
        this._cells.delete(index);
        this._reCreateRenderData = true;
        if (this._cellDataRefMap.get(oldCell).size - 1 == 0) {//最后一个 要删除cell信息改变的通知
            oldCell._removeNoticeRenderTile(this);
        }
    }

    /**
     * @internal
     */
    _clearOneCell(cell: TileSetCellData) {
        let posMap = this._cellDataRefMap.get(cell);
        if (posMap && posMap.size > 0) {
            posMap.forEach((value, key) => {
                this._cells.delete(key);
            });
            cell._removeNoticeRenderTile(this);
        }
    }

    /**
     * @internal
     */
    _setDirtyFlag(cell: TileSetCellData, flag: TILEMAPLAYERDIRTYFLAG) {
        if (this._cellDirtyFlag.has(cell)) {
            let newFlag = this._cellDirtyFlag.get(cell) | flag;
            this._cellDirtyFlag.set(cell, newFlag);
        } else {
            this._cellDirtyFlag.set(cell, flag);
        }
    }

    /**
     * @internal
     */
    _clearCell() {
        this._cells.clear();
        this._reCreateRenderData = true;
        this._cellDataRefMap.forEach((value, key) => {
            key._removeNoticeRenderTile(this);
        });
        this._cellDataRefMap.clear();
        this._cellDirtyFlag.clear();

    }

    /**
     * @internal
     */
    _destroy() {
        this._clearCell();
        this.clearRenderElement2D();
        this._cellDataRefMap = null;
        this._cellDirtyFlag = null;
        this._cells = null;

    }

    private _createRenderElement2D(): IRenderElement2D {
        let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        renderElement.geometry = geometry;
        geometry.bufferState = LayaGL.renderDeviceFactory.createBufferState();
        renderElement.renderStateIsBySprite = false;
        renderElement.value2DShaderData = this._tileLayer._spriteShaderData;
        renderElement.nodeCommonMap = ["BaseRender2D"];
        return renderElement;
    }

    private clearRenderElement2D() {
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

