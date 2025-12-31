export enum TileMapCellNeighbor {
    RIGHT_SIDE = 0,
    RIGHT_CORNER = 1,
    BOTTOM_RIGHT_SIDE = 2,
    BOTTOM_RIGHT_CORNER = 3,
    BOTTOM_SIDE = 4,
    BOTTOM_CORNER = 5,
    BOTTOM_LEFT_SIDE = 6,
    BOTTOM_LEFT_CORNER = 7,
    LEFT_SIDE = 8,
    LEFT_CORNER = 9,
    TOP_LEFT_SIDE = 10,
    TOP_LEFT_CORNER = 11,
    TOP_SIDE = 12,
    TOP_CORNER = 13,
    TOP_RIGHT_SIDE = 14,
    TOP_RIGHT_CORNER = 15,
    MAX = 16,
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

export enum DirtyFlagType {
    ALL = -1,
    RENDER,
    PHYSICS,
    OCCLUSION,
}

export const DIRTY_TYPES = 3;