
import { ClassUtils } from "../../utils/ClassUtils";
import { BloomEffect } from "./BloomEffect";
import { ColorGradEffect } from "./ColorGradEffect";
import { GaussianDoF } from "./GaussianDoF";
import { LensFlareEffect, LensFlareElement, LensFlareData } from "./LensFlares/LensFlareEffect";
import { ScalableAO } from "./ScalableAO";
import { TemporalAAEffect } from "./TemporalAAEffect";
import { MaterialPostProcessEffect } from "./MaterialPostProcessEffect";

//import "./LensFlareSettingsLoader"; TODO

let c = ClassUtils.regClass;

c("BloomEffect", BloomEffect);
c("GaussianDoF", GaussianDoF);
c("ScalableAO", ScalableAO);
c("ColorGradEffect", ColorGradEffect);
c("TemporalAAEffect", TemporalAAEffect);

c("LensFlareEffect", LensFlareEffect);
c("LensFlareElement", LensFlareElement);
c("LensFlareData", LensFlareData);
c("MaterialPostProcessEffect", MaterialPostProcessEffect);
