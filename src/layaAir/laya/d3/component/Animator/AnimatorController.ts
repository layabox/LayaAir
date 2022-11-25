import { AnimatorControllerParse, AniParmType, TypeAnimatorConditions, TypeAnimatorControllerData, TypeAnimatorParams, TypeAnimatorState } from "../../../components/AnimatorControllerParse";
import { Resource } from "../../../resource/Resource";
import { Animator } from "./Animator";
import { AnimatorControllerLayer } from "./AnimatorControllerLayer";
import { AnimatorState } from "./AnimatorState";
import { AnimatorStateBoolCondition, AnimatorStateCondition, AnimatorStateNumberCondition } from "./AnimatorStateCondition";
import { AnimatorTransition } from "./AnimatorTransition";

export class AnimatorController extends Resource {
    data: TypeAnimatorControllerData;
    controllerLayer: AnimatorControllerLayer[];
    clipsID: string[];
    constructor(data: any) {
        super();
        let obj = AnimatorControllerParse.parse(data);


        this.data = obj.ret;
        this.clipsID = obj.clipsID;
    }

    private initLayers() {
        if (null == this.controllerLayer) {
            let layers = this.data.controllerLayers;



            let lArr: AnimatorControllerLayer[] = [];

            for (let i = layers.length - 1; i >= 0; i--) {
                let l = layers[i];
                let acl = new AnimatorControllerLayer(l.name);
                lArr.unshift(acl);


                for (let k in l) {
                    if ("name" == k || "states" == k || null == (l as any)[k]) {
                        continue;
                    }
                    try {
                        (acl as any)[k] = (l as any)[k];
                    } catch (err: *) { }
                }
                this.getState(l.states, acl, this.data);

            }
            this.controllerLayer = lArr;
        }
    }


    updateTo(a: Animator) {
        this.initLayers();
        (a as any)._controllerLayers.length = 0;
        for (let i = 0, len = this.controllerLayer.length; i < len; i++) {
            a.addControllerLayer(this.controllerLayer[i]);
        }
        let parms = this.data.animatorParams;
        if (parms) {
            for (let i = parms.length - 1; i >= 0; i--) {
                let p = parms[i];
                if (AniParmType.Bool == p.type) {
                    a.setParamsBool(p.name, Boolean(p.val));
                } else if (AniParmType.Float == p.type) {
                    let val = Number(p.val);
                    if (isNaN(val)) {
                        val = 0;
                    }
                    a.setParamsNumber(p.name, val);
                }
            }
        }

    }


    private getState(states: TypeAnimatorState[], acl: AnimatorControllerLayer, data: TypeAnimatorControllerData) {
        //let ret:
        if (states) {
            let idCatch: Record<string, AnimatorState> = {};
            for (let i = states.length - 1; i >= 0; i--) {
                let obj = states[i];
                let state = new AnimatorState();
                idCatch[obj.id] = state;

                for (let k in obj) {
                    try {
                        if ("soloTransitions" == k) {
                            continue;
                        } else if (null != (obj as any)[k]) {
                            (state as any)[k] = (obj as any)[k];
                        }
                    } catch (err: *) { }
                }

                acl.addState(state);
            }


            //acl.defaultState = 


            for (let i = states.length - 1; i >= 0; i--) {
                let obj = states[i];

                if ("-1" == obj.id) {
                    if (obj.soloTransitions && 0 < obj.soloTransitions.length) {
                        acl.defaultState = idCatch[obj.soloTransitions[0].id];
                        continue;
                    }
                }

                let soloTransitions = obj.soloTransitions;
                if (soloTransitions && idCatch[obj.id]) {

                    let ats: AnimatorTransition[] = [];

                    for (let j = soloTransitions.length - 1; j >= 0; j--) {
                        let o = soloTransitions[j];
                        let ato = new AnimatorTransition();

                        for (let k in o) {
                            if ("id" == k) {
                                if (idCatch[o.id]) {
                                    ato.destState = idCatch[o.id];
                                }
                            } else if ("conditions" == k) {
                                if (o.conditions) {
                                    this.addConditions(o.conditions, ato, data);
                                }
                            } else {
                                (ato as any)[k] = (o as any)[k];
                            }


                        }
                        ats.unshift(ato);

                    }
                    idCatch[obj.id].soloTransitions = ats;
                }


            }








        }
    }

    private addConditions(arr: TypeAnimatorConditions[], ato: AnimatorTransition, data: TypeAnimatorControllerData) {
        let parms = data.animatorParams;
        if (null == parms || 0 == parms.length) return;
        for (let i = 0, len = arr.length; i < len; i++) {
            let o = arr[i];
            let parm: TypeAnimatorParams = null;
            for (let j = parms.length - 1; j >= 0; j--) {
                if (parms[j].id == o.id) {
                    parm = parms[j];
                    break;
                }
            }
            if (null == parm) {
                return;
            }
            let c: AnimatorStateCondition;
            if (parm.type == AniParmType.Bool) {
                let b = new AnimatorStateBoolCondition(o.name);
                b.compareFlag = Boolean(o.checkValue);
                c = b;
            } else if (parm.type == AniParmType.Float) {
                let n = new AnimatorStateNumberCondition(o.name);
                n.numberValue = Number(o.checkValue);
                n.compareFlag = o.type;
                c = n;
            } else {
                //TODO
            }


            ato.addCondition(c);
        }
    }



}