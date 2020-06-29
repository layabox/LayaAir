import { TileTexSet } from "./TileTexSet";
import { Sprite } from "../display/Sprite";

/**
 * TildMap的动画显示对象（一个动画（TileTexSet），可以绑定多个动画显示对象（TileAniSprite））
 * @author ...
 */
export class TileAniSprite extends Sprite {

    private _tileTextureSet: TileTexSet = null;//动画的引用
    private _aniName: string = null;//当前动画显示对象的名字，名字唯一

    /**
     * 确定当前显示对象的名称以及属于哪个动画
     * @param	aniName	当前动画显示对象的名字，名字唯一
     * @param	tileTextureSet 当前显示对象属于哪个动画（一个动画，可以绑定多个同类显示对象）
     */
    setTileTextureSet(aniName: string, tileTextureSet: TileTexSet): void {
        this._aniName = aniName;
        this._tileTextureSet = tileTextureSet;
        tileTextureSet.addAniSprite(this._aniName, this);
    }

    /**
     * 把当前动画加入到对应的动画刷新列表中
     */
    show(): void {
        this._tileTextureSet.addAniSprite(this._aniName, this);
    }

    /**
     * 把当前动画从对应的动画刷新列表中移除
     */
    hide(): void {
        this._tileTextureSet.removeAniSprite(this._aniName);
    }

    /**
     * 清理
     */
    clearAll(): void {
        this._tileTextureSet.removeAniSprite(this._aniName);
        this.destroy();
        this._tileTextureSet = null;
        this._aniName = null;
    }
}


