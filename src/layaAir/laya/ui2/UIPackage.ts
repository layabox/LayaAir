import { PlayerConfig } from "../../Config";
import { ILaya } from "../../ILaya";
import { Laya } from "../../Laya";
import { LayaEnv } from "../../LayaEnv";
import { Loader } from "../net/Loader";
import { GButton } from "./GButton";
import { GComboBox } from "./GComboBox";
import { GProgressBar } from "./GProgressBar";
import { GRoot } from "./GRoot";
import { GSlider } from "./GSlider";
import { GTextInput } from "./GTextInput";
import { UIConfig2 } from "./UIConfig";

/**
 * @ignore @blueprintable
 */
export class UIPackage {
    /**
     * @en Create a button by using the default internal resource.
     * @returns GButton
     * @zh 使用默认的内部资源创建一个按钮。
     * @returns GButton 
     */
    static createButton(): GButton {
        return Loader.createNodes("internal/UI/Button.lh");
    }

    /**
     * @en Create a radio button by using the default internal resource.
     * @returns GButton
     * @zh 使用默认的内部资源创建一个单选按钮。
     * @returns GButton
     */
    static createRadio(): GButton {
        return Loader.createNodes("internal/UI/Radio.lh");
    }

    /**
     * @en Create a checkbox by using the default internal resource.
     * @returns GButton
     * @zh 使用默认的内部资源创建一个复选框。
     * @returns GButton
     */
    static createCheckBox(): GButton {
        return Loader.createNodes("internal/UI/CheckBox.lh");
    }

    /**
     * @en Create a progress bar by using the default internal resource.
     * @returns GProgressBar
     * @zh 使用默认的内部资源创建一个进度条。
     * @returns GProgressBar
     */
    static createProgressBar(): GProgressBar {
        return Loader.createNodes("internal/UI/ProgressBar.lh");
    }

    /**
     * @en Create a horizontal slider by using the default internal resource.
     * @returns GSlider
     * @zh 使用默认的内部资源创建一个水平滑动条。
     * @returns GSlider
     */
    static createSliderH(): GSlider {
        return Loader.createNodes("internal/UI/SliderH.lh");
    }

    /**
     * @en Create a vertical slider by using the default internal resource.
     * @returns GSlider
     * @zh 使用默认的内部资源创建一个垂直滑动条。
     * @returns GSlider
     */
    static createSliderV(): GSlider {
        return Loader.createNodes("internal/UI/SliderV.lh");
    }

    /** 
     * @en Create a text input by using the default internal resource.
     * @returns GTextInput
     * @zh 使用默认的内部资源创建一个文本输入框。
     * @returns GTextInput
     */
    static createTextInput(): GTextInput {
        return Loader.createNodes("internal/UI/TextInput.lh");
    }

    /** 
     * @en Create a text area by using the default internal resource.
     * @returns GTextInput
     * @zh 使用默认的内部资源创建一个文本区域。
     * @returns GTextInput
     */
    static createTextArea(): GTextInput {
        return Loader.createNodes("internal/UI/TextArea.lh");
    }

    /** 
     * @en Create a combo box by using the default internal resource.
     * @returns GComboBox
     * @zh 使用默认的内部资源创建一个下拉列表框。
     * @returns GComboBox
     */
    static createComboBox(): GComboBox {
        return Loader.createNodes("internal/UI/ComboBox.lh");
    }

    /** @internal */
    static _init(): Promise<void> {
        if (!LayaEnv.isPlaying)
            return null;

        GRoot.inst;

        const urls: Array<string> = [
            UIConfig2.windowModalWaiting,
            UIConfig2.globalModalWaiting,
            UIConfig2.popupMenu,
            UIConfig2.tooltipsWidget,
            UIConfig2.horizontalScrollBar,
            UIConfig2.verticalScrollBar
        ].filter((url) => url != null);

        if (PlayerConfig.UI.alwaysIncludeDefaultSkin) {
            urls.push(...[
                "Button.lh",
                "Radio.lh",
                "CheckBox.lh",
                "ProgressBar.lh",
                "SliderH.lh",
                "SliderV.lh",
                "TextInput.lh",
                "TextArea.lh",
                "ComboBox.lh"
            ].map((url) => "internal/UI/" + url));
        }
        return ILaya.loader.load(urls);
    }

}

Laya.addAfterInitCallback(UIPackage._init);