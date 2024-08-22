import { TileAniSprite } from "./TileAniSprite";
import { Texture } from "../resource/Texture";
import { ILaya } from "../../ILaya";



/**
 * @en The `TileTexSet` class is a sub-texture class that also manages animations of the same type.
 * TiledMap divides textures into numerous sub-textures and can replace a specific sub-texture with an animation sequence.
 * The implementation of this class sets the `animationKey` to true if a sub-texture is replaced with an animation sequence.
 * That is, if `animationKey` is true, use `TileAniSprite` for display, and draw the animation sequence onto `TileAniSprite` according to time.
 * @zh `TileTexSet` 类是一个子纹理类，同时管理同类型动画。
 * TiledMap 将纹理分割成许多子纹理，并且可以将其中的某个子纹理替换为动画序列。
 * 如果发现子纹理被替换为动画序列，本类的实现会将 `animationKey` 设置为 true。
 * 即如果 `animationKey` 为 true，则使用 `TileAniSprite` 来显示，并将动画序列根据时间绘制到 `TileAniSprite` 上。
 */
export class TileTexSet {

    /**
     * @en The unique identifier for the tile texture set.
     * @zh 子纹理集的唯一标识。
     */
    gid: number = -1;
    /**
     * @en The reference to the sub-texture.
     * @zh 子纹理的引用。
     */
    texture: Texture;
    /**
     * @en The X coordinate offset when displaying the texture.
     * @zh 纹理显示时的X坐标偏移。
     */
    offX: number = 0;
    /**
     * @en The Y coordinate offset when displaying the texture.
     * @zh 纹理显示时的Y坐标偏移。
     */
    offY: number = 0;

    //下面是动画支持需要的
    /**
     * @en The array of textures to be displayed for the current animation.
     * @zh 当前要播放的动画纹理序列。
     */
    textureArray: any[] = null;
    /**
     * @en The duration of each frame in the current animation.
     * @zh 当前动画每帧的时间间隔。
     */
    durationTimeArray: any[] = null;
    /**
     * @en The total duration of the animation.
     * @zh 动画播放的总时间。
     */
    animationTotalTime: number = 0;
    /**
     * @en Indicates whether the current texture is an animation sequence (true) or a single texture (false).
     * @zh 表示当前纹理是一组动画(true)还是单个纹理(false)。
     */
    isAnimation: boolean = false;

    /**
     * @en The number of display objects in the current animation.
     * @zh 当前动画的显示对象数量。
     */
    private _spriteNum: number = 0;				//当前动画有多少个显示对象
    /**
     * @en A dictionary to save display objects by their unique name.
     * @zh 通过显示对象的唯一名字保存显示对象的字典。
     */
    private _aniDic: any = null;			//通过显示对象的唯一名字，去保存显示显示对象
    /**
     * @en The current frame index in the animation sequence.
     * @zh 当前动画播放到的帧索引。
     */
    private _frameIndex: number = 0;			//当前动画播放到第几帧

    /**
     * @en The elapsed time since the last animation refresh.
     * @zh 距离上次动画刷新过了多少时间。
     */
    private _time: number = 0;					
    /**
     * @en The interval time for refreshing each frame.
     * @zh 每帧刷新的时间间隔。
     */
    private _interval: number = 0;			
    /**
     * @en The timestamp of the last frame refresh.
     * @zh 上一帧刷新的时间戳。
     */
    private _preFrameTime: number = 0;		

    /**
     * @en Adds an animation display object to this animation.
     * @param aniName The name of the display object.
     * @param sprite The display object.
     * @zh 将一个动画显示对象加入到此动画中。
     * @param aniName 显示对象的名字。
     * @param sprite 显示对象。
     */
    addAniSprite(aniName: string, sprite: TileAniSprite): void {
        if (this.animationTotalTime == 0) {
            return;
        }
        if (this._aniDic == null) {
            this._aniDic = {};
        }
        if (this._spriteNum == 0) {
            //每3帧刷新一下吧，每帧刷新可能太耗了
            ILaya.timer.frameLoop(3, this, this.animate);
            this._preFrameTime = ILaya.Browser.now();
            this._frameIndex = 0;
            this._time = 0;
            this._interval = 0;
        }
        this._spriteNum++;
        this._aniDic[aniName] = sprite;
        if (this.textureArray && this._frameIndex < this.textureArray.length) {
            var tTileTextureSet: TileTexSet = this.textureArray[this._frameIndex];
            this.drawTexture(sprite, tTileTextureSet);
        }
    }
    
    /**
     * @en Draws the animation to all registered sprites.
     * @zh 把动画画到所有注册的显示对象上。
     */
    private animate(): void {
        if (this.textureArray && this.textureArray.length > 0 && this.durationTimeArray && this.durationTimeArray.length > 0) {
            var tNow: number = ILaya.Browser.now();
            this._interval = tNow - this._preFrameTime;
            this._preFrameTime = tNow;
            if (this._interval > this.animationTotalTime) {
                this._interval = this._interval % this.animationTotalTime;
            }
            this._time += this._interval;
            var tTime: number = this.durationTimeArray[this._frameIndex];
            while (this._time > tTime) {
                this._time -= tTime;
                this._frameIndex++;
                if (this._frameIndex >= this.durationTimeArray.length || this._frameIndex >= this.textureArray.length) {
                    this._frameIndex = 0;
                }
                var tTileTextureSet: TileTexSet = this.textureArray[this._frameIndex];
                var tSprite: TileAniSprite;
                for (var p in this._aniDic) {
                    tSprite = this._aniDic[p];
                    this.drawTexture(tSprite, tTileTextureSet);
                }
                tTime = this.durationTimeArray[this._frameIndex];
            }
        }
    }

    /**
     * @en Draws the texture to the specified sprite.
     * @param sprite The sprite to draw the texture on.
     * @param tileTextSet The tile texture set to draw.
     * @zh 将纹理绘制到指定的显示对象上。
     * @param sprite 要绘制纹理的显示对象。
     * @param tileTextSet 要绘制的子纹理集。
     */
    private drawTexture(sprite: TileAniSprite, tileTextSet: TileTexSet): void {
        sprite.graphics.clear(true);
        //sprite.graphics.drawImage(tileTextSet.texture, tileTextSet.offX, tileTextSet.offY, tileTextSet.texture.width, tileTextSet.texture.height);
        sprite.graphics.drawImage(tileTextSet.texture, tileTextSet.offX, tileTextSet.offY);
    }

    /**
     * @en Removes the sprite that no longer needs to be updated.
     * @param _name The name of the sprite to remove.
     * @zh 移除不再需要更新的显示对象。
     * @param _name 要移除的显示对象的名字。
     */
    removeAniSprite(_name: string): void {
        if (this._aniDic && this._aniDic[_name]) {
            delete this._aniDic[_name];
            this._spriteNum--
            if (this._spriteNum == 0) {
                ILaya.timer.clear(this, this.animate);
            }
        }
    }

    /**
     * @en Displays the current usage of the animation.
     * @returns A string containing the debug information.
     * @zh 显示当前动画的使用情况。
     * @returns 包含调试信息的字符串。
     */
    showDebugInfo(): string {
        var tInfo: string = null;
        if (this._spriteNum > 0) {
            tInfo = "TileTextureSet::gid:" + this.gid.toString() + " 动画数:" + this._spriteNum.toString();
        }
        return tInfo;
    }

    /**
     * @en Clears all properties of the tile texture set.
     * @zh 清理子纹理集的所有属性。
     */
    clearAll(): void {
        this.gid = -1;//唯一标识
        if (this.texture) {
            this.texture.destroy();
            this.texture = null;
        }
        this.offX = 0;
        this.offY = 0;

        this.textureArray = null;
        this.durationTimeArray = null;
        this.isAnimation = false;
        this._spriteNum = 0;
        this._aniDic = null;
        this._frameIndex = 0;
        this._preFrameTime = 0;
        this._time = 0;
        this._interval = 0;
    }

}


