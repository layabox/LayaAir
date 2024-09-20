import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { Texture2D } from "../../../resource/Texture2D";
import { TileAlternativesData } from "./TileAlternativeData";
import { TileSet } from "./TileSet";
import { TileSetCellData } from "./TileSetCellData";

//cell资源管理器
export class TileSetCellGroup {

    private _owner: TileSet;

    private _atlas: Texture2D;

    private _atlasSize: Vector2;

    private _indexOfTileSet: number;

    private _name: string;

    private _separation: Vector2;//cell separation,unin:pixel

    private _offset: Vector2;//offset off atlas unin:pixel

    private _textureRegionSize: Vector2;//cell size

    private _render_uvOffset = new Vector2();

    private _render_uvCellExtend = new Vector2();

    private _render_uvSeparation = new Vector2();

    private _tiles: Map<number, Map<number, TileAlternativesData>>;//tile data map

    public get atlas(): Texture2D {
        return this._atlas;
    }

    public set atlas(value: Texture2D) {
        this._atlas = value;
        this._atlasSize.setValue(value.width, value.height);
        //TODO
        this._recaculateUVOriProperty(true);
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get offset(): Vector2 {
        return this._offset;
    }

    public set offset(value: Vector2) {
        value.cloneTo(this._offset);
        //TODO
        this._recaculateUVOriProperty(true);
    }

    public get separation(): Vector2 {
        return this._separation;
    }

    public set separation(value: Vector2) {
        value.cloneTo(this._separation);
        //TODO
        this._recaculateUVOriProperty(true);
    }

    public get textureRegionSize(): Vector2 {
        return this._textureRegionSize;
    }

    public set textureRegionSize(value: Vector2) {
        value.cloneTo(this._textureRegionSize);
        //TODO
        this._recaculateUVOriProperty(true);
    }

    constructor(owner: TileSet, indexInTileSet: number, name: string) {
        this._owner = owner;
        this._indexOfTileSet = indexInTileSet;
        this._tiles = new Map();
        this.name = name;
    }

    private _recaculateUVOriProperty(needNotiveCell: boolean) {
        //uvoffset
        this._render_uvOffset.setValue(this._offset.x / this._atlasSize.x, this._offset.y / this._atlasSize.y);
        //uvcellExtend
        this._render_uvCellExtend.setValue(this._textureRegionSize.x / this._atlasSize.x, this._textureRegionSize.y / this._atlasSize.y);
        //uvseparation
        this._render_uvSeparation.setValue(this._separation.x / this._atlasSize.x, this._separation.y / this._atlasSize.y);
        //if(needNotiveCell)
        //通知所有tilesetnative，
    }

    _getTileUVOri(localPos: Vector2) {
        let uvX = localPos.x * (this._render_uvCellExtend.x + this._render_uvSeparation.x) + this._render_uvOffset.x;
        let uvY = localPos.y * (this._render_uvCellExtend.y + this._render_uvSeparation.y) + this._render_uvOffset.y;
        Vector2.TempVector2.setValue(uvX, uvY);
        return Vector2.TempVector2;
    }

    _getTileUVExtends(size: Vector2) {
        let u = (size.x - 1) * this._render_uvSeparation.x + this._render_uvCellExtend.x * size.x;
        let v = (size.y - 1) * this._render_uvSeparation.y + this._render_uvCellExtend.y * size.y;
        Vector2.TempVector2.setValue(u / 2, v / 2);
        return Vector2.TempVector2;
    }

    //根据像素获得localPos
    getLocalPos(pixel: Vector2): Vector2 {
        return null;
    }

    //创建一个alternative组
    createAlternative(localPos: Vector2, size: Vector2): TileAlternativesData {
        //_tiles
        return null
    }

    //获得一个alternative组
    getAlternative(localPos: Vector2): TileAlternativesData {
        //_tiles
        return null;
    }

    //移除一个alternative组
    removeAlternaltive(localPos: Vector2): void {
        //_tiles
    }

    //创建一个alternative组
    createNewCellData(localPos: Vector2): TileSetCellData {
        return null
    }

    //获得一个alternative组
    getCellData(localPos: Vector2, index: number): TileSetCellData {
        return null;
    }

    //移除一个alternative组
    removeCellData(localPos: Vector2, index: number): TileSetCellData {
        return null;
    }

    removeTile(localPos: Vector2, index: number) {
        
    }

    release() {
        //删除 TODO
    }
}