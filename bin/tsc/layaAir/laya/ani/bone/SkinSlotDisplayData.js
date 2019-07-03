import { Texture } from "../../resource/Texture";
export class SkinSlotDisplayData {
    createTexture(currTexture) {
        if (this.texture)
            return this.texture;
        this.texture = new Texture(currTexture.bitmap, this.uvs);
        //判断是否旋转
        if (this.uvs[0] > this.uvs[4]
            && this.uvs[1] > this.uvs[5]) {
            //旋转
            this.texture.width = currTexture.height;
            this.texture.height = currTexture.width;
            this.texture.offsetX = -currTexture.offsetX;
            this.texture.offsetY = -currTexture.offsetY;
            this.texture.sourceWidth = currTexture.sourceHeight;
            this.texture.sourceHeight = currTexture.sourceWidth;
        }
        else {
            this.texture.width = currTexture.width;
            this.texture.height = currTexture.height;
            this.texture.offsetX = -currTexture.offsetX;
            this.texture.offsetY = -currTexture.offsetY;
            this.texture.sourceWidth = currTexture.sourceWidth;
            this.texture.sourceHeight = currTexture.sourceHeight;
        }
        return this.texture;
    }
    destory() {
        if (this.texture)
            this.texture.destroy();
    }
}
