import { ClassUtils } from "./utils/ClassUtils";
import { Component } from "./components/Component";
import { Animation } from "./display/Animation";
import { AnimationBase } from "./display/AnimationBase";
import { BitmapFont } from "./display/BitmapFont";
import { EffectAnimation } from "./display/EffectAnimation";
import { FrameAnimation } from "./display/FrameAnimation";
import { Input } from "./display/Input";
import { Node } from "./display/Node";
import { Scene } from "./display/Scene";
import { Sprite } from "./display/Sprite";
import { Stage } from "./display/Stage";
import { Text } from "./display/Text";
import { BlurFilter } from "./filters/BlurFilter";
import { ColorFilter } from "./filters/ColorFilter";
import { GlowFilter } from "./filters/GlowFilter";
import { Point } from "./maths/Point";
import { Rectangle } from "./maths/Rectangle";
import { SoundNode } from "./media/SoundNode";
import { VideoNode } from "./media/VideoNode";
import { Texture } from "./resource/Texture";
import { Texture2D } from "./resource/Texture2D";
import { Animator2D } from "./components/Animator2D";
import { AnimatorControllerLayer2D } from "./components/AnimatorControllerLayer2D";
import { AnimatorState2D } from "./components/AnimatorState2D";
import { AnimationClip2D } from "./components/AnimationClip2D";
import { Animation2DParm } from "./components/Animation2DParm";
import { Animation2DCondition } from "./components/Animation2DCondition";
import { Prefab } from "./resource/HierarchyResource";
import { Widget } from "./components/Widget";
import { AnimatorController2D } from "./components/AnimatorController2D";
import { Vector2 } from "./maths/Vector2";
import { Vector3 } from "./maths/Vector3";
import { Vector4 } from "./maths/Vector4";
import { Quaternion } from "./maths/Quaternion";
import { Color } from "./maths/Color";
import { Script } from "./components/Script";
import { Matrix } from "./maths/Matrix";
import { Matrix3x3 } from "./maths/Matrix3x3";
import { Matrix4x4 } from "./maths/Matrix4x4";

import "./loaders/TextResourceLoader";
import "./loaders/AtlasLoader";
import "./loaders/HierarchyLoader";
import "./loaders/TextureLoader";
import "./loaders/AnimationClip2DLoader";
import "./loaders/AnimationController2DLoader";
import "./loaders/NullLoader";
import "./loaders/BitmapFontLoader";
import "./loaders/TTFFontLoader";
import "./loaders/MaterialLoader";
import "./loaders/ShaderLoader";
import "./loaders/GLSLLoader";
import "./media/webaudio/WebAudioLoader";

let c = ClassUtils.regClass;

c("Record", Object);
c("Node", Node);
c("Sprite", Sprite);
c("Widget", Widget);
c("Text", Text);
c("Input", Input);
c("AnimationBase", AnimationBase);
c("Animation", Animation);
c("FrameAnimation", FrameAnimation);
c("EffectAnimation", EffectAnimation);
c("SoundNode", SoundNode);
c("VideoNode", VideoNode);

c("Scene", Scene);
c("Stage", Stage);
c("Component", Component);
c("Script", Script);
c("BitmapFont", BitmapFont);
c("BlurFilter", BlurFilter);
c("ColorFilter", ColorFilter);
c("GlowFilter", GlowFilter);
c("Point", Point);
c("Rectangle", Rectangle);
c("Texture", Texture);
c("Texture2D", Texture2D);

c("Prefab", Prefab);

c("Animator2D", Animator2D);
c("AnimatorControllerLayer2D", AnimatorControllerLayer2D);
c("AnimatorState2D", AnimatorState2D);
c("AnimationClip2D", AnimationClip2D);
c("AnimatorController2D", AnimatorController2D);
c("Animation2DParm", Animation2DParm);
c("Animation2DCondition", Animation2DCondition);

c("Vector2", Vector2);
c("Vector3", Vector3);
c("Vector4", Vector4);
c("Quaternion", Quaternion);
c("Color", Color);
c("Matrix", Matrix);
c("Matrix3x3", Matrix3x3);
c("Matrix4x4", Matrix4x4);
