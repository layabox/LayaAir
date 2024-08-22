import { TileTexSet } from "./TileTexSet";
import { Sprite } from "../display/Sprite";

/**
 * @en The `TileAniSprite` class represents an animation display object within a `TiledMap`. An animation set (represented by `TileTexSet`) can be associated with multiple animation display objects (`TileAniSprite`).
 * @zh `TileAniSprite` 类是 `TiledMap` 的动画显示对象。一个动画集合（由 `TileTexSet` 表示）可以绑定多个动画显示对象（`TileAniSprite`）。
 */
export class TileAniSprite extends Sprite {

    /**
     * @en Reference to the animation set.
     * @zh 动画的引用。
     */
    private _tileTextureSet: TileTexSet = null;
    /**
     * @en The unique name of the current animation display object.
     * @zh 当前动画显示对象的唯一名称。
     */
    private _aniName: string = null;

    /**
     * @en Set the name of the current display object and which animation set it belongs to.
     * @param aniName The unique name of the current animation display object.
     * @param tileTextureSet The animation set that the current display object belongs to.
     * @zh 确定当前显示对象的名称以及属于哪个动画。
     * @param	aniName	当前动画显示对象的名字，名字唯一
     * @param	tileTextureSet 当前显示对象属于哪个动画（一个动画，可以绑定多个同类显示对象）
     */
    setTileTextureSet(aniName: string, tileTextureSet: TileTexSet): void {
        this._aniName = aniName;
        this._tileTextureSet = tileTextureSet;
        tileTextureSet.addAniSprite(this._aniName, this);
    }

    /**
     * @en Add the current animation to the corresponding animation refresh list.
     * @zh 把当前动画加入到对应的动画刷新列表中。
     */
    show(): void {
        this._tileTextureSet.addAniSprite(this._aniName, this);
    }

    /**
     * @en Remove the current animation from the corresponding animation refresh list.
     * @zh 把当前动画从对应的动画刷新列表中移除。
     */
    hide(): void {
        this._tileTextureSet.removeAniSprite(this._aniName);
    }

    /**
     * @en Clear all properties and references of the current object to free up resources.
     * @zh 清理当前对象的所有属性和引用，释放资源。
     */
    clearAll(): void {
        this._tileTextureSet.removeAniSprite(this._aniName);
        this.destroy();
        this._tileTextureSet = null;
        this._aniName = null;
    }
}


