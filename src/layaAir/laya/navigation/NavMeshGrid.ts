import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { NavTileData } from "./NavTileData";
import { RecastConfig } from "./RecastConfig";

/**
 * @en The NavMeshGrid class manages the grid division of the navigation mesh.
 * @zh NavMeshGrid 类用于管理导航网格的网格划分。
 */
export class NavMeshGrid {
    /**@internal */
    private _config: RecastConfig;

    /**@internal */
    private _boundsMin: Vector3 = new Vector3();

    /**@internal */
    private _boundsMax: Vector3 = new Vector3();

    /**@internal */
    private _tileSize: Vector2;

    /**@internal */
    private _cellSize: Vector2;

    /**@internal */
    private _bordWidth: number = 0;

    /**
     * @en The width of a single tile.
     * @zh 单个瓦片的宽度。
     */
    get tileWidth() {
        return this._config.tileSize * this._config.cellSize;
    }

    /**
     * @ignore
     * @en Instance an NavMeshGrid component.
     * @param config The configuration for the navigation mesh.
     * @param bound The bounding box of the navigation mesh.
     * @zh 实例化一个NavMeshGrid组件。
     * @param config 导航网格的配置。
     * @param bound 导航网格的边界框。
     */
    constructor(config: RecastConfig, min: Vector3, max: Vector3) {
        this._config = config;
        this._boundsMin = min;
        this._boundsMax = max;
        this._tileSize = new Vector2();
        this._cellSize = new Vector2();
        this._updateBound();
    }

    /**
     * update bound
     */
    private _updateBound() {
        this._bordWidth = this._config.cellSize * 3;
        let max = this._boundsMax;
        let min = this._boundsMin;
        const tileWidth = this._config.cellSize * this._config.tileSize;
        this._tileSize.x = Math.ceil((max.x - min.x) / tileWidth);
        this._tileSize.y = Math.ceil((max.z - min.z) / tileWidth);

        const cellSize = this._config.cellSize;
        this._cellSize.x = Math.ceil((max.x - min.x) / cellSize);
        this._cellSize.x = Math.ceil((max.z - min.z) / cellSize);
    }



    /**
     * @en Update the configuration and bounding box based on the given tile data.
     * @param tile The navigation tile data.
     * @zh 根据给定的瓦片数据更新配置和边界框。
     * @param tile 导航瓦片数据。
     */
    public refeachConfig(tile: NavTileData) {
        tile._boundMin.cloneTo(this._boundsMin);
        tile._boundMax.cloneTo(this._boundsMax);
        this._updateBound()
    }

    /**
     * @en Get the tile indices that intersect with the given bounding box.
     * @param bound The bounding box to check.
     * @param isbord Whether to include a border around the bounding box.
     * @returns An array of tile indices.
     * @zh 获取与给定边界框相交的瓦片索引。
     * @param bound 要检查的边界框。
     * @param isbord 是否在边界框周围包含边界。
     * @returns 瓦片索引数组。
     */
    public getBoundTileIndex(min: Vector3, max: Vector3, isbord: boolean = false): number[] {
        //阔边
        let pMinx = min.x;
        let pMinz = min.z;
        let pMaxx = max.x;
        let pMaxz = max.z;
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
     * @en The bounding box of the navigation mesh.
     * @zh 导航网格的边界框。
     */
    public get boundMin(): Vector3 {
        return this._boundsMin;
    }

    /**
     * @en The bounding box of the navigation mesh.
     * @zh 导航网格的边界框。
     */
    public get boundMax(): Vector3 {
        return this._boundsMax;
    }

    /**
     * @en The configuration of the navigation mesh.
     * @zh 导航网格的配置。
     */
    public get config(): RecastConfig {
        return this._config;
    }

    /**
     * @en Get the tile index based on world position.
     * @param x The x-coordinate in world space.
     * @param z The z-coordinate in world space.
     * @returns The tile index.
     * @zh 根据世界坐标获取瓦片索引。
     * @param x 世界坐标 x。
     * @param z 世界坐标 z。
     * @returns 瓦片索引。
     */
    getTileIndexByPos(x: number, z: number): number {
        return this.getTileIndex(this.getTileXIndex(x), this.getTileZIndex(z));
    }

    /**
     * @en Get the tile index based on tile coordinates.
     * @param xIndex The x-index of the tile.
     * @param zIndex The z-index of the tile.
     * @returns The tile index, or -1 if out of bounds.
     * @zh 根据瓦片坐标获取瓦片索引。
     * @param xIndex 瓦片的 x 索引。
     * @param zIndex 瓦片的 z 索引。
     * @returns 瓦片索引，如果超出边界则返回 -1。
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
        return this._getLeftValue(value - this._boundsMin.x);
    }

    /**
    * @internal
    * get tile z index
    */
    getTileZIndex(value: number) {
        return this._getLeftValue(value - this._boundsMin.z);
    }

    /**
     * @internal
     * get tile index of map
     */
    private _getLeftValue(value: number): number {
        return Math.floor(value / this.tileWidth);
    }

    /**
     * @en Get the maximum number of tiles.
     * @zh 获取最大瓦片数量。
     */
    public getMaxtiles() {
        return this.maxXTileCount * this.maxZTileCount;
    }

    /**
     * @en Get the maximum number of tiles along the x-axis.
     * @zh 获取 x 轴方向的最大瓦片数量。
     */
    public get maxXTileCount(): number {
        return this._tileSize.x;
    }

    /**
     * @en Get the maximum number of tiles along the z-axis.
     * @zh 获取 z 轴方向的最大瓦片数量。
     */
    public get maxZTileCount(): number {
        return this._tileSize.y;
    }

    /**
     * @en Get the maximum number of cells along the x-axis.
     * @zh 获取 x 轴方向的最大单元格数量。
     */
    public get maxXCellCount(): number {
        return this._cellSize.x;
    }
    /**
     * @en Get the maximum number of cells along the z-axis.
     * @zh 获取 z 轴方向的最大单元格数量。
     */
    public get maxZCellCount(): number {
        return this._cellSize.y;
    }

}