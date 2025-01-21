export enum TileMapCellNeighbor {
    RIGHT_SIDE = 0,
    RIGHT_CORNER,
    BOTTOM_RIGHT_SIDE,
    BOTTOM_RIGHT_CORNER,
    BOTTOM_SIDE,
    BOTTOM_CORNER,
    BOTTOM_LEFT_SIDE,
    BOTTOM_LEFT_CORNER,
    LEFT_SIDE,
    LEFT_CORNER,
    TOP_LEFT_SIDE,
    TOP_LEFT_CORNER,
    TOP_SIDE,
    TOP_CORNER,
    TOP_RIGHT_SIDE,
    TOP_RIGHT_CORNER,
    MAX,
}

export enum TileMapTerrainMode {
    MATCH_CORNERS_AND_SIDES = 0,
    MATCH_CORNERS,
    MATCH_SIDES,
}

export enum TileShape {
    TILE_SHAPE_SQUARE,//四边矩形
    TILE_SHAPE_ISOMETRIC,//菱形
    TILE_SHAPE_HALF_OFFSET_SQUARE,//错位quad
    TILE_SHAPE_HEXAGON,//六边形
}


export enum TileLayerSortMode {
    YSort,
    ZINDEXSORT,
    XSort
}

export enum TileMapDirtyFlag {
    CELL_CHANGE = 1 << 0,//add remove create...
    CELL_COLOR = 1 << 1,//a_color
    CELL_QUAD = 1 << 2,//a_quad xy offset,zw extend
    CELL_QUADUV = 1 << 3,//a_UV xy offset,zw extend
    CELL_UVTRAN = 1 << 4,
    CELL_PHYSICS = 1 << 5,
    CELL_TERRAIN = 1 << 6,
    CELL_LIGHTSHADOW = 1 << 7,
    CELL_NAVIGATION = 1 << 8,
    CELL_SORTCHANGE = 1 << 9,
    TILESET_SAZE = 1 << 10,
    LAYER_COLOR = 1 << 11,
    LAYER_PHYSICS = 1 << 12,
}

export enum DirtyFlagType{
    ALL = -1,
    RENDER,
    PHYSICS,
    OCCLUSION,
}

export const DIRTY_TYPES = 3;