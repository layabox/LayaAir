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

export class UIPackage {

    static createButton(): GButton {
        return Loader.createNodes("internal/UI/Button.lh");
    }

    static createRadio(): GButton {
        return Loader.createNodes("internal/UI/Radio.lh");
    }

    static createCheckBox(): GButton {
        return Loader.createNodes("internal/UI/CheckBox.lh");
    }

    static createProgressBar(): GProgressBar {
        return Loader.createNodes("internal/UI/ProgressBar.lh");
    }

    static createSliderH(): GSlider {
        return Loader.createNodes("internal/UI/SliderH.lh");
    }

    static createSliderV(): GSlider {
        return Loader.createNodes("internal/UI/SliderV.lh");
    }

    static createTextInput(): GTextInput {
        return Loader.createNodes("internal/UI/TextInput.lh");
    }

    static createTextArea(): GTextInput {
        return Loader.createNodes("internal/UI/TextArea.lh");
    }

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

Laya.addReadyCallback(UIPackage._init);