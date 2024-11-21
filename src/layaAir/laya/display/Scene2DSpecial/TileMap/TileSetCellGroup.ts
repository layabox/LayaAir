import { Matrix } from "../../../maths/Matrix";
import { Vector2 } from "../../../maths/Vector2";
import { Texture2D } from "../../../resource/Texture2D";
import { TileAlternativesData } from "./TileAlternativesData";
import { TileMapUtils } from "./TileMapUtils";
import { TileSet } from "./TileSet";
import { TileSetCellData } from "./TileSetCellData";


export class TileSetCellGroup {

    //用于记录基础的alternative id
    _baseAlternativesId: number = 0;

    //当前最大的alternative 数量
    _maxAlternativesCount: number = 0;

    private _maxCellCount: Vector2 = new Vector2();

    _owner: TileSet;

    private _atlas: Texture2D;

    private _atlasSize: Vector2;

    private _separation: Vector2;//cell separation,unin:pixel

    private _margin: Vector2;//offset off atlas unin:pixel

    private _textureRegionSize: Vector2;//cell size

    private _tiles: Record<number, Record<number, TileAlternativesData>>;

    private _tileMatrix: Matrix = new Matrix();

    id: number;

    name: string;

    get tiles(): Record<number, Record<number, TileAlternativesData>> {
        return this._tiles;
    }
    set tiles(value: Record<number, Record<number, TileAlternativesData>>) {
        if (value) {
            for (let y in value) {
                for (let x in value[y]) {
                    value[y][x].owner = this;
                }
            }
        }
        this._tiles = value;
    }

    public get atlas(): Texture2D {
        return this._atlas;
    }

    public set atlas(value: Texture2D) {
        if (this._atlas === value) return;
        value._addReference();
        this._atlas = value;
        this._atlasSize.setValue(value.width, value.height);
        this._recaculateUVOriProperty(true);
    }

    get atlasSize(): Vector2 {
        return this._atlasSize;
    }

    set atlasSize(value: Vector2) {
        value.cloneTo(this._atlasSize);
        this._recaculateUVOriProperty(true);
    }

    public get margin(): Vector2 {
        return this._margin;
    }

    public set margin(value: Vector2) {
        value.cloneTo(this._margin);
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

    constructor() {
        this._tiles = {};
        this._separation = new Vector2();
        this._margin = new Vector2();
        this._textureRegionSize = new Vector2();
        this._atlasSize = new Vector2();
    }
    get owner() {
        return this._owner;
    }

    set owner(value) {
        if (this._owner != null) console.error("owner is not null");
        this._owner = value;
        this._owner.addTileSetCellGroup(this);
    }


    _recaculateUVOriProperty(needNotiveCell: boolean) {
        this._tileMatrix.identity();
        this._tileMatrix.scale(this._textureRegionSize.x + this._separation.x, this._textureRegionSize.y + this._separation.y);
        this._tileMatrix.translate(this._margin.x, this._margin.y);
        this._tileMatrix.invert();
        let maxX = Math.floor((this._atlasSize.x - this._margin.x) / (this._textureRegionSize.x + this._separation.x));
        let maxY = Math.floor((this._atlasSize.y - this._margin.y) / (this._textureRegionSize.y + this._separation.y));
        this._maxAlternativesCount = maxX * maxY;
        this._maxCellCount.setValue(maxX, maxY);
        for (var i in this._tiles) {
            let rowTile = this._tiles[i];
            for (var j in rowTile) {
                rowTile[j]._setOriUV();
            }
        }
        if (needNotiveCell) {
            this._owner && this._owner._notifyTileSetCellGroupsChange();
        }

    }

    onAtlasSizeChange() {
        this._owner && this._owner._refeashAlternativesId();
    }

    //获得全局的alternative的id
    _getGlobalAlternativesId(x: number, y: number) {
        return y * this._maxCellCount.x + x + this._baseAlternativesId;
    }

    //全局的alternative的id转换为本地Cell 的坐标
    _getCellPosByAlternativesId(nativesId: number, out: Vector2) {
        let id = nativesId - this._baseAlternativesId;
        out.x = id % this._maxCellCount.x;
        out.y = Math.floor(id / this._maxCellCount.x);
    }

    _getTileUVOri(localPos: Vector2, out: Vector2) {
        let uvX = localPos.x * (this._textureRegionSize.x + this._separation.x) + this._margin.x;
        let uvY = localPos.y * (this._textureRegionSize.y + this._separation.y) + this._margin.y;
        out.setValue(uvX, uvY);
        return out;
    }

    _getTileUVExtends(size: Vector2, out: Vector2) {
        out.x = (size.x - 1) * this._separation.x + this._textureRegionSize.x * size.x;
        out.y = (size.y - 1) * this._separation.y + this._textureRegionSize.y * size.y;
        return out;
    }


    //获得一个alternative组
    getAlternative(x: number, y: number): TileAlternativesData {
        if (!this._tiles[y]) {
            return null;
        }
        return this._tiles[y][x];
    }

    addAlternaltive(x: number, y: number, sizeInAtlas: Vector2) {
        let data = this.getAlternative(x, y);
        if (data) {
            return data;
        }
        let tempv2 = Vector2.TempVector2;
        this._getTileUVExtends(sizeInAtlas, tempv2);
        if ((tempv2.x + x > this._atlasSize.x) || (tempv2.y + y > this._atlasSize.y))
            return null;
        let alterData = new TileAlternativesData();
        {
            alterData.localPos = new Vector2(x, y);
            alterData.sizeByAtlas = sizeInAtlas;
            alterData.owner = this;
            alterData._initialIndexFIrstCellData();
        }
        for (var j = 0; j < sizeInAtlas.y; j++) {
            let ymap = this._tiles[j];
            if (!ymap)
                ymap = this._tiles[j] = {};
            for (var i = 0; i < sizeInAtlas.x; i++) {
                ymap[i] = alterData;
            }
        }


        return alterData;
    }

    //移除一个alternative组
    removeAlternaltive(localPos: Vector2): void {
        if (!this._tiles[localPos.y]) {
            return;
        }
        let rowMap = this._tiles[localPos.y];
        if (!rowMap[localPos.x]) {
            return;
        }
        //rowMap.delete(localPos.x);
        delete rowMap[localPos.x];
    }

    //获得一个alternative组
    getCellData(localPos: Vector2, index: number): TileSetCellData {
        // return null;
        let tile = this.getAlternative(localPos.x, localPos.y);
        if (tile == null) { return null; }
        return tile.getCelldata(index);
    }

    //通过 gid 获得一个TileSetCellData
    getCellDataByGid(gid: number): TileSetCellData {
        if (gid <= 0) { return null; }
        const temp = Vector2.TempVector2;
        this._getCellPosByAlternativesId(TileMapUtils.getNativeId(gid), temp);
        let data = this.getAlternative(temp.x, temp.y);
        if (data == null) { return null; }
        return data.getCelldata(TileMapUtils.getCellIndex(gid));
    }

    //移除一个alternative组
    removeCellData(localPos: Vector2, index: number): void {
        let tile = this.getAlternative(localPos.x, localPos.y);
        if (tile == null) { return null; }
        return tile.removeCellData(index);
    }


    release() {
        //删除 TODO
    }
}