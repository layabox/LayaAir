import { TiledMap } from "./TiledMap";
import { TileAniSprite } from "./TileAniSprite";
import { Sprite } from "../display/Sprite";



/**
 * 地图的每层都会分块渲染处理
 * 本类就是地图的块数据
 * @author ...
 */
export class GridSprite extends Sprite {

    /**相对于地图X轴的坐标*/
    relativeX: number = 0;
    /**相对于地图Y轴的坐标*/
    relativeY: number = 0;
    /**是否用于对象层的独立物件*/
    isAloneObject: boolean = false;
    /**当前GRID中是否有动画*/
    isHaveAnimation: boolean = false;
    /**当前GRID包含的动画*/
    aniSpriteArray: any[];
    /**当前GRID包含多少个TILE(包含动画)*/
    drawImageNum: number = 0;

    private _map: TiledMap = null;//当前地图对象的引用

    /**
     * 传入必要的参数，用于裁剪，跟确认此对象类型
     * @param	map	把地图的引用传进来，参与一些裁剪计算
     * @param	objectKey true:表示当前GridSprite是个活动对象，可以控制，false:地图层的组成块
     */
    initData(map: TiledMap, objectKey: boolean = false): void {
        this._map = map;
        this.isAloneObject = objectKey;
    }

    /**
     * 把一个动画对象绑定到当前GridSprite
     * @param	sprite 动画的显示对象
     */
    addAniSprite(sprite: TileAniSprite): void {
        if (this.aniSpriteArray == null) {
            this.aniSpriteArray = [];
        }
        this.aniSpriteArray.push(sprite);
    }

    /**
     * 显示当前GridSprite，并把上面的动画全部显示
     */
    show(): void {
        if (!this.visible) {
            this.visible = true;
            if (this.aniSpriteArray == null) {
                return;
            }
            var tAniSprite: TileAniSprite;
            for (var i: number = 0; i < this.aniSpriteArray.length; i++) {
                tAniSprite = this.aniSpriteArray[i];
                tAniSprite.show();
            }
        }
    }

    /**
     * 隐藏当前GridSprite，并把上面绑定的动画全部移除
     */
    hide(): void {
        if (this.visible) {
            this.visible = false;
            if (this.aniSpriteArray == null) {
                return;
            }
            var tAniSprite: TileAniSprite;
            for (var i: number = 0; i < this.aniSpriteArray.length; i++) {
                tAniSprite = this.aniSpriteArray[i];
                tAniSprite.hide();
            }
        }
    }

    /**
     * 刷新坐标，当我们自己控制一个GridSprite移动时，需要调用此函数，手动刷新
     */
    updatePos(): void {
        if (this.isAloneObject) {
            if (this._map) {
                this.x = this.relativeX - this._map._viewPortX;
                this.y = this.relativeY - this._map._viewPortY;
            }
            if (this.x < 0 || this.x > this._map.viewPortWidth || this.y < 0 || this.y > this._map.viewPortHeight) {
                this.hide();
            } else {
                this.show();
            }
        } else {
            if (this._map) {
                this.x = this.relativeX - this._map._viewPortX;
                this.y = this.relativeY - this._map._viewPortY;
            }
        }
    }

    /**
     * 重置当前对象的所有属性
     */
    clearAll(): void {
        if (this._map) {
            this._map = null;
        }
        this.visible = false;

        var tAniSprite: TileAniSprite;

        if (this.aniSpriteArray != null) {
            for (var i: number = 0; i < this.aniSpriteArray.length; i++) {
                tAniSprite = this.aniSpriteArray[i];
                tAniSprite.clearAll();
            }
        }

        this.destroy();
        this.relativeX = 0;
        this.relativeY = 0;
        this.isHaveAnimation = false;
        this.aniSpriteArray = null;
        this.drawImageNum = 0;
    }

}


