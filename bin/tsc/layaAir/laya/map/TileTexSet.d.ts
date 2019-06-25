import { Texture } from "../resource/Texture";
import { TileAniSprite } from "./TileAniSprite";
/**
 * 此类是子纹理类，也包括同类动画的管理
 * TiledMap会把纹理分割成无数子纹理，也可以把其中的某块子纹理替换成一个动画序列
 * 本类的实现就是如果发现子纹理被替换成一个动画序列，animationKey会被设为true
 * 即animationKey为true,就使用TileAniSprite来做显示，把动画序列根据时间画到TileAniSprite上
 * @author ...
 */
export declare class TileTexSet {
    /**唯一标识*/
    gid: number;
    /**子纹理的引用*/
    texture: Texture;
    /**纹理显示时的坐标偏移X*/
    offX: number;
    /**纹理显示时的坐标偏移Y*/
    offY: number;
    /**当前要播放动画的纹理序列*/
    textureArray: any[];
    /** 当前动画每帧的时间间隔*/
    durationTimeArray: any[];
    /** 动画播放的总时间 */
    animationTotalTime: number;
    /**true表示当前纹理，是一组动画，false表示当前只有一个纹理*/
    isAnimation: boolean;
    private _spriteNum;
    private _aniDic;
    private _frameIndex;
    private _time;
    private _interval;
    private _preFrameTime;
    /**
     * 加入一个动画显示对象到此动画中
     * @param	aniName	//显示对象的名字
     * @param	sprite	//显示对象
     */
    addAniSprite(aniName: string, sprite: TileAniSprite): void;
    /**
     * 把动画画到所有注册的SPRITE上
     */
    private animate;
    private drawTexture;
    /**
     * 移除不需要更新的SPRITE
     * @param	_name
     */
    removeAniSprite(_name: string): void;
    /**
     * 显示当前动画的使用情况
     */
    showDebugInfo(): string;
    /**
     * 清理
     */
    clearAll(): void;
}
