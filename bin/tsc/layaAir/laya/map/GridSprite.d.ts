import { TiledMap } from "./TiledMap";
import { TileAniSprite } from "./TileAniSprite";
import { Sprite } from "../display/Sprite";
/**
 * 地图的每层都会分块渲染处理
 * 本类就是地图的块数据
 * @author ...
 */
export declare class GridSprite extends Sprite {
    /**相对于地图X轴的坐标*/
    relativeX: number;
    /**相对于地图Y轴的坐标*/
    relativeY: number;
    /**是否用于对象层的独立物件*/
    isAloneObject: boolean;
    /**当前GRID中是否有动画*/
    isHaveAnimation: boolean;
    /**当前GRID包含的动画*/
    aniSpriteArray: any[];
    /**当前GRID包含多少个TILE(包含动画)*/
    drawImageNum: number;
    private _map;
    /**
     * 传入必要的参数，用于裁剪，跟确认此对象类型
     * @param	map	把地图的引用传进来，参与一些裁剪计算
     * @param	objectKey true:表示当前GridSprite是个活动对象，可以控制，false:地图层的组成块
     */
    initData(map: TiledMap, objectKey?: boolean): void;
    /**
     * 把一个动画对象绑定到当前GridSprite
     * @param	sprite 动画的显示对象
     */
    addAniSprite(sprite: TileAniSprite): void;
    /**
     * 显示当前GridSprite，并把上面的动画全部显示
     */
    show(): void;
    /**
     * 隐藏当前GridSprite，并把上面绑定的动画全部移除
     */
    hide(): void;
    /**
     * 刷新坐标，当我们自己控制一个GridSprite移动时，需要调用此函数，手动刷新
     */
    updatePos(): void;
    /**
     * 重置当前对象的所有属性
     */
    clearAll(): void;
}
