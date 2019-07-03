import { MapLayer } from "./MapLayer";
import { Rectangle } from "../maths/Rectangle";
import { Sprite } from "../display/Sprite";
import { Handler } from "../utils/Handler";
import { Point } from "../maths/Point";
import { TileTexSet } from "./TileTexSet";
import { GridSprite } from "./GridSprite";
/**
 * tiledMap是整个地图的核心
 * 地图以层级来划分地图（例如：地表层，植被层，建筑层）
 * 每层又以分块（GridSprite)来处理显示对象，只显示在视口区域的区
 * 每块又包括N*N个格子（tile)
 * 格子类型又分为动画格子跟图片格子两种
 * @author ...
 */
export declare class TiledMap {
    /**四边形地图*/
    static ORIENTATION_ORTHOGONAL: string;
    /**菱形地图*/
    static ORIENTATION_ISOMETRIC: string;
    /**45度交错地图*/
    static ORIENTATION_STAGGERED: string;
    /**六边形地图*/
    static ORIENTATION_HEXAGONAL: string;
    /**地图格子从左上角开始渲染*/
    static RENDERORDER_RIGHTDOWN: string;
    /**地图格子从左下角开始渲染*/
    static RENDERORDER_RIGHTUP: string;
    /**地图格子从右上角开始渲染*/
    static RENDERORDER_LEFTDOWN: string;
    /**地图格子右下角开始渲染*/
    static RENDERORDER_LEFTUP: string;
    private _jsonData;
    private _tileTexSetArr;
    private _texArray;
    private _x;
    private _y;
    private _width;
    private _height;
    private _mapW;
    private _mapH;
    private _mapTileW;
    private _mapTileH;
    private _rect;
    private _paddingRect;
    private _mapSprite;
    private _layerArray;
    private _renderLayerArray;
    private _gridArray;
    private _showGridKey;
    private _totalGridNum;
    private _gridW;
    private _gridH;
    private _gridWidth;
    private _gridHeight;
    private _jsonLoader;
    private _loader;
    private _tileSetArray;
    private _currTileSet;
    private _completeHandler;
    private _mapRect;
    private _mapLastRect;
    private _index;
    private _animationDic;
    private _properties;
    private _tileProperties;
    private _tileProperties2;
    private _orientation;
    private _renderOrder;
    private _colorArray;
    private _scale;
    private _pivotScaleX;
    private _pivotScaleY;
    private _centerX;
    private _centerY;
    private _viewPortWidth;
    private _viewPortHeight;
    private _enableLinear;
    private _resPath;
    private _pathArray;
    private _limitRange;
    /**
     * 是否自动缓存没有动画的地块
     */
    autoCache: boolean;
    /**
     * 自动缓存类型,地图较大时建议使用normal
     */
    autoCacheType: string;
    /**
     * 是否合并图层,开启合并图层时，图层属性内可添加layer属性，运行时将会将相邻的layer属性相同的图层进行合并以提高性能
     */
    enableMergeLayer: boolean;
    /**
     * 是否移除被覆盖的格子,地块可添加type属性，type不为0时表示不透明，被不透明地块遮挡的地块将会被剔除以提高性能
     */
    removeCoveredTile: boolean;
    /**
     * 是否显示大格子里显示的贴图数量
     */
    showGridTextureCount: boolean;
    /**
     * 是否调整地块边缘消除缩放导致的缝隙
     */
    antiCrack: boolean;
    /**
     * 是否在加载完成之后cache所有大格子
     */
    cacheAllAfterInit: boolean;
    constructor();
    /**
     * 创建地图
     * @param	mapName 		JSON文件名字
     * @param	viewRect 		视口区域
     * @param	completeHandler 地图创建完成的回调函数
     * @param	viewRectPadding 视口扩充区域，把视口区域上、下、左、右扩充一下，防止视口移动时的穿帮
     * @param	gridSize 		grid大小
     * @param	enableLinear 	是否开启线性取样（为false时，可以解决地图黑线的问题，但画质会锐化）
     * @param	limitRange		把地图限制在显示区域
     */
    createMap(mapName: string, viewRect: Rectangle, completeHandler: Handler, viewRectPadding?: Rectangle, gridSize?: Point, enableLinear?: boolean, limitRange?: boolean): void;
    /**
     * json文件读取成功后，解析里面的纹理数据，进行加载
     * @param	e JSON数据
     */
    private onJsonComplete;
    /**
     * 合并路径
     * @param	resPath
     * @param	relativePath
     * @return
     */
    private mergePath;
    private _texutreStartDic;
    /**
     * 纹理加载完成，如果所有的纹理加载，开始初始化地图
     * @param	e 纹理数据
     */
    private onTextureComplete;
    private adptTexture;
    /**
     * 初始化地图
     */
    private initMap;
    private addTileProperties;
    getTileUserData(id: number, sign: string, defaultV?: any): any;
    private adptTiledMapData;
    private removeCoverd;
    private collectCovers;
    /**
     * 得到一块指定的地图纹理
     * @param	index 纹理的索引值，默认从1开始
     * @return
     */
    getTexture(index: number): TileTexSet;
    /**
     * 得到地图的自定义属性
     * @param	name		属性名称
     * @return
     */
    getMapProperties(name: string): any;
    /**
     * 得到tile自定义属性
     * @param	index		地图块索引
     * @param	id			具体的TileSetID
     * @param	name		属性名称
     * @return
     */
    getTileProperties(index: number, id: number, name: string): any;
    /**
     * 通过纹理索引，生成一个可控制物件
     * @param	index 纹理的索引值，默认从1开始
     * @return
     */
    getSprite(index: number, width: number, height: number): GridSprite;
    /**
     * 设置视口的缩放中心点（例如：scaleX= scaleY= 0.5,就是以视口中心缩放）
     * @param	scaleX
     * @param	scaleY
     */
    setViewPortPivotByScale(scaleX: number, scaleY: number): void;
    /**
     * 设置地图缩放
     * @param	scale
     */
    /**
    * 得到当前地图的缩放
    */
    scale: number;
    /**
     * 移动视口
     * @param	moveX 视口的坐标x
     * @param	moveY 视口的坐标y
     */
    moveViewPort(moveX: number, moveY: number): void;
    /**
     * 改变视口大小
     * @param	moveX	视口的坐标x
     * @param	moveY	视口的坐标y
     * @param	width	视口的宽
     * @param	height	视口的高
     */
    changeViewPort(moveX: number, moveY: number, width: number, height: number): void;
    /**
     * 在锚点的基础上计算，通过宽和高，重新计算视口
     * @param	width		新视口宽
     * @param	height		新视口高
     * @param	rect		返回的结果
     * @return
     */
    changeViewPortBySize(width: number, height: number, rect?: Rectangle): Rectangle;
    /**
     * 刷新视口
     */
    private updateViewPort;
    /**
     * GRID裁剪
     */
    private clipViewPort;
    /**
     * 显示指定的GRID
     * @param	gridX
     * @param	gridY
     */
    private showGrid;
    private cacheAllGrid;
    private static _tempCanvas;
    private cacheGridsArray;
    private getGridArray;
    /**
     * 隐藏指定的GRID
     * @param	gridX
     * @param	gridY
     */
    private hideGrid;
    /**
     * 得到对象层上的某一个物品
     * @param	layerName   层的名称
     * @param	objectName	所找物品的名称
     * @return
     */
    getLayerObject(layerName: string, objectName: string): GridSprite;
    /**
     * 销毁地图
     */
    destroy(): void;
    /****************************地图的基本数据***************************/ /**
     * 格子的宽度
     */
    readonly tileWidth: number;
    /**
     * 格子的高度
     */
    readonly tileHeight: number;
    /**
     * 地图的宽度
     */
    readonly width: number;
    /**
     * 地图的高度
     */
    readonly height: number;
    /**
     * 地图横向的格子数
     */
    readonly numColumnsTile: number;
    /**
     * 地图竖向的格子数
     */
    readonly numRowsTile: number;
    /**
     * @private
     * 视口x坐标
     */
    readonly viewPortX: number;
    /**
     * @private
     * 视口的y坐标
     */
    readonly viewPortY: number;
    /**
     * @private
     * 视口的宽度
     */
    readonly viewPortWidth: number;
    /**
     * @private
     * 视口的高度
     */
    readonly viewPortHeight: number;
    /**
     * 地图的x坐标
     */
    readonly x: number;
    /**
     * 地图的y坐标
     */
    readonly y: number;
    /**
     * 块的宽度
     */
    readonly gridWidth: number;
    /**
     * 块的高度
     */
    readonly gridHeight: number;
    /**
     * 地图的横向块数
     */
    readonly numColumnsGrid: number;
    /**
     * 地图的坚向块数
     */
    readonly numRowsGrid: number;
    /**
     * 当前地图类型
     */
    readonly orientation: string;
    /**
     * tile渲染顺序
     */
    readonly renderOrder: string;
    /*****************************************对外接口**********************************************/
    /**
     * 整个地图的显示容器
     * @return 地图的显示容器
     */
    mapSprite(): Sprite;
    /**
     * 得到指定的MapLayer
     * @param layerName 要找的层名称
     * @return
     */
    getLayerByName(layerName: string): MapLayer;
    /**
     * 通过索引得MapLayer
     * @param	index 要找的层索引
     * @return
     */
    getLayerByIndex(index: number): MapLayer;
}
