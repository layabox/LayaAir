import { IUI } from "./IUI";
import { DialogManager } from "./DialogManager";
import { ILaya } from "../../ILaya";
import { ViewStack } from "./ViewStack";
import { Button } from "./Button";
import { TextArea } from "./TextArea";
import { ColorPicker } from "./ColorPicker";
import { Box } from "./Box";
import { ScaleBox } from "./ScaleBox";
import { CheckBox } from "./CheckBox";
import { Clip } from "./Clip";
import { ComboBox } from "./ComboBox";
import { UIComponent } from "./UIComponent";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { HSlider } from "./HSlider";
import { Label } from "./Label";
import { List } from "./List";
import { Panel } from "./Panel";
import { ProgressBar } from "./ProgressBar";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";
import { ScrollBar } from "./ScrollBar";
import { Slider } from "./Slider";
import { Tab } from "./Tab";
import { TextInput } from "./TextInput";
import { View } from "./View";
import { Dialog } from "./Dialog";
import { VSlider } from "./VSlider";
import { Tree } from "./Tree";
import { HBox } from "./HBox";
import { VBox } from "./VBox";
//import { Sprite } from "../../../../bin/core/laya/display/Sprite";
import { FontClip } from "./FontClip";
import { Image } from "./Image";
import { Animation } from "../display/Animation";
//TODO 什么时候做
export class UILib{
    static __init__(){
        IUI.DialogManager = DialogManager;
    //注册UI类名称映射
    ILaya.ClassUtils.regShortClassName([ViewStack, Button, TextArea, ColorPicker, Box, ScaleBox,CheckBox, Clip, ComboBox, UIComponent, 
        HScrollBar, HSlider, Image, Label, List, Panel, ProgressBar, Radio, RadioGroup, ScrollBar, Slider, Tab, TextInput, View, Dialog, 
        VScrollBar, VSlider, Tree, HBox, VBox,  Animation, Text, FontClip]);		

    }
}
