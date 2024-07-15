import { Slider } from "./Slider";

/**
 * @en The HSlider control allows the user to select a value by moving a slider between the end points of the slider track.
 * The HSlider control is displayed horizontally. The slider track stretches from left to right, and the labels are displayed at the top or bottom of the track.
 * @zh 使用 HSlider 控件，用户可以通过在滑块轨道的终点之间移动滑块来选择值。
 * HSlider 控件采用水平方向。滑块轨道从左向右扩展，而标签位于轨道的顶部或底部。
 */


export class HSlider extends Slider {

    /**
     * @en In the constructor method, set the sliding direction to horizontal.
     * @param skin The skin of the HSlider.
     * @zh 在构造方法里，设置滑动方向为水平，
     * @param skin 皮肤纹理。
     */
    constructor(skin: string = null) {
        super(skin);
        this.isVertical = false;
    }
}