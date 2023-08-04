import { ILaya } from "../../../../ILaya";
import { Loader } from "../../../net/Loader";
import { UI3D } from "./UI3D";
import { Texture } from "../../../resource/Texture";
import { Sprite } from "../../../display/Sprite";
import { Vector2 } from "../../../maths/Vector2";


export class Image3D extends UI3D {
    /**@private */
    protected _skin: string;

    private _textureSize: Vector2;

    /**
     * <p>对象的皮肤地址，以字符串表示。</p>
     * <p>如果资源未加载，则先加载资源，加载完成后应用于此对象。</p>
     * <b>注意：</b>资源加载完成后，会自动缓存至资源库中。
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (value == "")
            value = null;
        if (this._skin == value)
            return;

        this._setSkin(value);
    }

    _setSkin(url: string): Promise<void> {
        this._skin = url;
        if (url) {
            let source = Loader.getRes(url);
            if (source) {
                this.updataSource(source);
                return Promise.resolve();
            }
            else {
                let sk = this._skin;
                return ILaya.loader.load(url, { type: Loader.IMAGE }).then(tex => {
                    if (sk == this._skin)
                        this.updataSource(tex);
                });
            }
        }
        else {
            this.updataSource(null);
            return Promise.resolve();
        }
    }


    private updataSource(value: Texture) {
        this.sprite.texture = value;
        if (value) {
            let w: number = value.width / this.resolutionRate;
            let h: number = value.height / this.resolutionRate;
            this._textureSize.setValue(w, h);
            this.scale = this._textureSize;
        }
    }

    /**
     *  实例化一个Image3D
     */
    constructor() {
        super();
        this.sprite =  new Sprite();
        this._textureSize = new Vector2();
    }
}

