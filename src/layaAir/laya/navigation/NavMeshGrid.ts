
import { Bounds } from "../d3/math/Bounds";
import { Vector2 } from "../maths/Vector2";
import { NavTileData } from "./NavTileData";
import { RecastConfig } from "./RecastConfig";

export class NavMeshGrid {
    /**@internal */
    private _config: RecastConfig;

    /**@internal */
    private _bounds: Bounds;

    /**@internal */
    private _tileSize: Vector2;

    /**@internal */
    private _cellSize: Vector2;

    /**@internal */
    private _bordWidth: number = 0;

    get tileWidth() {
        return this._config.tileSize * this._config.cellSize;
    }

    /**
     * <code>实例化一个NavMeshGrid组件<code>
     */
    constructor(config: RecastConfig, bound: Bounds) {
        this._config = config;
        this._bounds = bound;
        this._tileSize = new Vector2();
        this._cellSize = new Vector2();
        this._updateBound();
    }

    /**
     * update bound
     */
    private _updateBound() {
        this._bordWidth = this._config.cellSize * 3;
        let max = this._bounds.getMax();
        let min = this._bounds.getMin();
        const tileWidth = this._config.cellSize * this._config.tileSize;
        this._tileSize.x = Math.ceil((max.x - min.x) / tileWidth);
        this._tileSize.y = Math.ceil((max.z - min.z) / tileWidth);

        const cellSize = this._config.cellSize;
        this._cellSize.x = Math.ceil((max.x - min.x) / cellSize);
        this._cellSize.x = Math.ceil((max.z - min.z) / cellSize);
    }



    /**
     * refeachConfig
     */
    public refeachConfig(tile: NavTileData) {
        tile._boundBox.cloneTo(this._bounds);
        this._updateBound()
    }

    /**
     * get tile index by Bound
     */
    public getBoundTileIndex(bound: Bounds, isbord: boolean = false): number[] {
        //阔边
        let pMinx = bound.min.x;
        let pMinz = bound.min.z;
        let pMaxx = bound.max.x;
        let pMaxz = bound.max.z;
        if (isbord) {
            pMinx -= this._bordWidth;
            pMinz -= this._bordWidth;

            pMaxx += this._bordWidth;
            pMaxz += this._bordWidth;
        }
        let lists: number[] = [];
        let minIx = Math.max(0, this.getTileXIndex(pMinx));
        let maxIx = Math.min(this._tileSize.x - 1, this.getTileXIndex(pMaxx));
        let minIz = Math.max(0, this.getTileZIndex(pMinz));
        let maxIz = Math.min(this._tileSize.y - 1, this.getTileZIndex(pMaxz));

        for (var z = minIz; z <= maxIz; z++) {
            for (var x = minIx; x <= maxIx; x++) {
                lists.push(z * this._tileSize.x + x);
            }
        }

        return lists;
    }


    /**
    * get  bounds of mesh
    */
    public get bounds(): Bounds {
        return this._bounds;
    }

    /**
    * get  bounds of mesh
    */
    public get config(): RecastConfig {
        return this._config;
    }

    /**
    * get tile index of map by position
    * @param x  世界坐标x
    * @param z  世界坐标z
    */
    getTileIndexByPos(x: number, z: number): number {
        return this.getTileIndex(this.getTileXIndex(x), this.getTileZIndex(z));
    }

    /**
     * get tile index of map
     */
    getTileIndex(xIndex: number, zIndex: number): number {
        if (zIndex < 0 || zIndex >= this._tileSize.y) {
            return -1;
        }
        if (xIndex < 0 || xIndex >= this._tileSize.x) {
            return -1;
        }
        return zIndex * (this._tileSize.x) + xIndex;
    }

    /**
    * @internal
    * get tile x index
    */
    getTileXIndex(value: number) {
        return this._getLeftValue(value - this._bounds.min.x);
    }

    /**
    * @internal
    * get tile z index
    */
    getTileZIndex(value: number) {
        return this._getLeftValue(value - this._bounds.min.z);
    }

    /**
     * @internal
     * get tile index of map
     */
    private _getLeftValue(value: number): number {
        return Math.floor(value / this.tileWidth);
    }

    /**
     * get max tiles number
     */
    public getMaxtiles() {
        return this.maxXTileCount * this.maxZTileCount;
    }

    /**
     * get max x tiles number
     */
    public get maxXTileCount(): number {
        return this._tileSize.x;
    }

    /**
     * get max z tiles number
     */
    public get maxZTileCount(): number {
        return this._tileSize.y;
    }

    /**
    * get max x cell number
    */
    public get maxXCellCount(): number {
        return this._cellSize.x;
    }
    /**
     * get max z cell number
     */
    public get maxZCellCount(): number {
        return this._cellSize.y;
    }

}