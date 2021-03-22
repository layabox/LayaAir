import { Transform } from "./Transform";
import { Texture } from "../../resource/Texture";

/**
 * 插槽显示数据
 */
export class SkinSlotDisplayData {

	/**名称 */
	name: string;
	/**附件名称 */
	attachmentName: string;
	/**类型 */
	type: number;				//0 硬  1 skin 2 另一种skin? 3 不支持
	/**变换 */
	transform: Transform;
	/**宽度 */
	width: number;
	/**高度 */
	height: number;
	/**纹理 */
	texture: Texture;

	/**骨骼数据 */
	bones: any[];
	/**uv数据 */
	uvs: any[];
	/**权重 */
	weights: any[];
	/**三角面数据 */
	triangles: any[];
	/**顶点数据 */
	vertices: any[];
	/**长度数据 */
	lengths: any[];
	/**版本号 */
	verLen: number;

	createTexture(currTexture: Texture): Texture {
		if (this.texture) return this.texture;
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
		} else {
			this.texture.width = currTexture.width;
			this.texture.height = currTexture.height;
			this.texture.offsetX = -currTexture.offsetX;
			this.texture.offsetY = -currTexture.offsetY;
			this.texture.sourceWidth = currTexture.sourceWidth;
			this.texture.sourceHeight = currTexture.sourceHeight;
		}
		return this.texture;
	}

	destory(): void {
		if (this.texture) this.texture.destroy();
	}
}

