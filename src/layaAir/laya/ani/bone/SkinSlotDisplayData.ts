import { Transform } from "./Transform";
import { Texture } from "../../resource/Texture";

/**
 * @en Slot display data
 * @zh 插槽显示数据
 */
export class SkinSlotDisplayData {

	/**
	 * @en The name of the slot.
	 * @zh 插槽的名称。
	 */
	name: string;
	/**
	 * @en The name of the attachment.
	 * @zh 附件的名称。
	 */
	attachmentName: string;
	/**
	 * @en The type of the slot display.
	 * @zh 插槽显示的类型。
	 */
	type: number;				//0 硬  1 skin 2 另一种skin? 3 不支持
	/**
	 * @en The transformation data of the slot.
	 * @zh 插槽的变换数据。
	 */
	transform: Transform;
	/**
	 * @en The width of the slot.
	 * @zh 插槽的宽度。
	 */
	width: number;
	/**
	 * @en The height of the slot.
	 * @zh 插槽的高度。
	 */
	height: number;
	/**
	 * @en The texture of the slot.
	 * @zh 插槽的纹理。
	 */
	texture: Texture;

	/**
	 * @en The bone data array.
	 * @zh 骨骼数据数组。
	 */
	bones: any[];
	/**
	 * @en The UV data array.
	 * @zh UV数据数组。
	 */
	uvs: any[];
	/**
	 * @en The weight data array.
	 * @zh 权重数据数组。
	 */
	weights: any[];
	/**
	 * @en The triangle data array.
	 * @zh 三角面数据数组。
	 */
	triangles: any[];
	/**
	 * @en The vertex data array.
	 * @zh 顶点数据数组。
	 */
	vertices: any[];
	/**
	 * @en The length data array.
	 * @zh 长度数据数组。
	 */
	lengths: any[];
	/**
	 * @en The version.
	 * @zh 版本号。
	 */
	verLen: number;

	/**
	 * @en Create and update the texture for the slot based on the current texture.
	 * @param currTexture The current texture to be used for creating the slot's texture.
	 * @return The created and updated texture.
	 * @zh 根据当前纹理创建并更新插槽纹理。
	 * @param currTexture 用于创建槽纹理的当前纹理。
	 * @return 新的插槽纹理。
	 */
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

	/**
	 * @en Destroy and clean up the resources used by the slot's texture.
	 * @zh 销毁并清理插槽纹理所使用的资源。
	 */
	destory(): void {
		if (this.texture) this.texture.destroy();
	}
}

