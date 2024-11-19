import { LayaGL } from "../../../../layagl/LayaGL";
import { Color } from "../../../../maths/Color";
import { Vector2 } from "../../../../maths/Vector2";
import { IIndexBuffer } from "../../../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { TileShape } from "../TileMapEnum";
import { TileMapLayer } from "../TileMapLayer";
import { TileMapChunkData } from "../TileMapChunkData";
import { TileMapShaderInit } from "../TileMapShaderInit";
import { BaseSheet } from "./BaseSheet";
import { HalfOffSquareSheet } from "./HalfOffSquareSheet";
import { HeixSheet } from "./HeixSheet";
import { IsometricSheet } from "./IsometricSheet";
import { RectSheet } from "./RectSheet";


/**
 * @internal
 * 生成渲染网格的顶点数据
 * 实现像素和格子系统之间的转换
 */
export class Grid {
    /**
     * @internal
     */
    _sheet: BaseSheet;
    private _tileShape: TileShape;
    private _offset: Vector2 = new Vector2();
    private _color: Color = new Color(0,0,0,0);

    private _vbs: IVertexBuffer;
    private _ibs: IIndexBuffer;
    private _vbLength: number = 0;

    constructor() {
        let vertex = this._vbs = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vertex.vertexDeclaration = TileMapShaderInit._tileMapPositionUVColorDec;
        vertex.instanceBuffer = false;
        this._ibs = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        this._updateTileShape(TileShape.TILE_SHAPE_SQUARE);
    }

    _updateConfig(layer:TileMapLayer){
        let sameShape = this._updateTileShape(layer.tileSet.tileShape);
        let sameColor = this._updateColor(layer.layerColor);
        if(sameShape|| sameColor){
            this._updateBufferData();
        }
        let size = layer.tileSet.tileSize;
        this.setTileSize(size.x,size.y);
    }

    private _updateTileShape(tileShape: TileShape){
        if(this._tileShape == tileShape) return false;
        this._tileShape = tileShape;
        switch (this._tileShape) {
            case TileShape.TILE_SHAPE_SQUARE:
                this._sheet = new RectSheet();
                this._offset.setValue(0, 0);
                break;
            case TileShape.TILE_SHAPE_HALF_OFFSET_SQUARE:
                this._sheet = new HalfOffSquareSheet();
                this._offset.setValue(0, -1);
                break;
            case TileShape.TILE_SHAPE_HEXAGON:
                this._sheet = new HeixSheet();
                this._offset.setValue(1, -1);
                break;
            case TileShape.TILE_SHAPE_ISOMETRIC:
                this._sheet = new IsometricSheet();
                this._offset.setValue(0, 0);
                break;
            default:
                throw Error("unknow the type .");
                break;
        }
        return true;
    }

    private _updateColor(color:Color){
        if(color.equal(this._color)) return false;
        color.cloneTo(this._color);
        return true;
    }
    

    private _updateBufferData() {
        let vbs = this._sheet.getvbs();
        let step = 8;
        let vbCount = vbs.length / 2;
        var buffer: Float32Array = new Float32Array(vbCount * step);
        for (var i = 0; i < vbCount; i++) {
            let index = i * step;
            var vbIndex = i * 2;
            let x = vbs[vbIndex];
            let y = vbs[vbIndex + 1];
            buffer[index] = buffer[index + 2] = x - 0.5;
            buffer[index + 1] = buffer[index + 3] = y - 0.5;
            buffer[index + 4] = this._color.r;
            buffer[index + 5] = this._color.g;
            buffer[index + 6] = this._color.b;
            buffer[index + 7] = this._color.a;
        }

        this._vbs.setDataLength(buffer.byteLength);
        this._vbs.setData(buffer.buffer, 0, 0, buffer.buffer.byteLength);

        let ib = new Uint8Array(this._sheet.getibs());
        let indexBuffer =this._ibs;
        indexBuffer._setIndexDataLength(ib.buffer.byteLength);
        indexBuffer._setIndexData(ib, 0);
        this._vbLength = ib.length;

    }

   
    /**
     * 设置单元格像素大小
     * @param x 
     * @param y 
     */
    setTileSize(x: number, y: number) {
        this._sheet.setTileSize(x, y);
    }

    /**
    * 像素系统转格子系统
    */
    pixelToGrid(pixelX: number, pixelY: number, out: Vector2) {
        this._sheet.pixelToGrid(pixelX, pixelY, out);
    }

    /**
     * 格子系统转像素系统
     */
    gridToPixel(row: number, col: number, out: Vector2) {
        this._sheet.gridToPiex(row, col, out);
    }

    /**
     * 获得网格渲染VbBuffer
     */
    getBaseVertexBuffer(): IVertexBuffer { return this._vbs; }

    /**
     * 获得网格渲染VbBuffer
     */
    getBaseIndexBuffer(): IIndexBuffer { return this._ibs; }

    getBaseIndexCount(): number { return this._vbLength; }

    getBaseIndexFormat(): number { return IndexFormat.UInt8; }

}