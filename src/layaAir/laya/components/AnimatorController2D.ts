import { AnimatorStateBoolCondition, AnimatorStateCondition, AnimatorStateNumberCondition, AnimatorStateTriggerCondition } from "../d3/component/Animator/AnimatorStateCondition";
import { Resource } from "../resource/Resource";
import { ClassUtils } from "../utils/ClassUtils";
import { Animation2DNext } from "./Animation2DNext";
import { Animation2DParm } from "./Animation2DParm";
import { Animator2D } from "./Animator2D";
import { AnimatorControllerLayer2D } from "./AnimatorControllerLayer2D";
import { AnimatorControllerParse, AniParmType, TypeAnimatorConditions, TypeAnimatorControllerData, TypeAnimatorParams, TypeAnimatorState } from "./AnimatorControllerParse";
import { AnimatorState2D } from "./AnimatorState2D";
import { AnimatorTransition2D } from "./AnimatorTransition2D";

export class AnimatorController2D extends Resource {
    data: TypeAnimatorControllerData;
    //controllerLayer: AnimatorControllerLayer2D[];
    clipsID: string[];
    constructor(data: any) {
        super();
        let obj = AnimatorControllerParse.parse(data);


        this.data = obj.ret;
        this.clipsID = obj.clipsID;
    }
    private getLayers() {
        let layers = this.data.controllerLayers;



        let lArr: AnimatorControllerLayer2D[] = [];

        for (let i = layers.length - 1; i >= 0; i--) {
            let l = layers[i];
            let acl = new AnimatorControllerLayer2D(l.name);
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
        return lArr;
    }


    private getState(states: TypeAnimatorState[], acl: AnimatorControllerLayer2D, data: TypeAnimatorControllerData) {
        //let ret:
        if (states) {
            let idCatch: Record<string, AnimatorState2D> = {};
            for (let i = states.length - 1; i >= 0; i--) {
                let obj = states[i];
                if (0 > Number(obj.id)) {
                    continue;
                }
                let state = new AnimatorState2D();
                idCatch[obj.id] = state;

                for (let k in obj) {
                    try {
                        if ("scripts" == k) {
                            let scripts: string[] = obj[k];
                            if (scripts && Array.isArray(scripts)) {
                                for (let k = scripts.length - 1; k >= 0; k--) {
                                    let uuid = scripts[k];
                                    let c = ClassUtils.getClass(uuid);
                                    if (c) {
                                        state.addScript(c);
                                    }

                                }



                            }

                            continue;
                        } else if ("soloTransitions" == k) {
                            continue;
                        } else if (null != (obj as any)[k]) {
                            (state as any)[k] = (obj as any)[k];
                        }
                    } catch (err: *) { }
                }

                acl.addState(state);
            }

            for (let i = states.length - 1; i >= 0; i--) {
                let obj = states[i];

                if ("-1" == obj.id) {
                    if (obj.soloTransitions && 0 < obj.soloTransitions.length) {
                        acl.defaultState = idCatch[obj.soloTransitions[0].id];
                        continue;
                    }
                }else if ("-2" == obj.id) {
                    let transitions = obj.soloTransitions;
                    if (transitions) {
                        for (let j = transitions.length - 1; j >= 0; j--) {
                            let o = transitions[j];
                            let destState = idCatch[o.id];
                            if (destState) {
                                for (let idk in idCatch) {
                                    let state = idCatch[idk];
                                    let ato = new AnimatorTransition2D();
                                    ato.destState = destState;
                                    if (o.conditions) {
                                        this.addConditions(o.conditions, ato, data);
                                    }

                                    for (let k in o) {
                                        if ("solo" == k || "id" == k || "conditions" == k) {
                                            continue;
                                        } else {
                                            (ato as any)[k] = (o as any)[k];
                                        }
                                    }

                                    if (o.solo) {
                                        state.soloTransitions.unshift(ato);
                                    } else {
                                        state.transitions.unshift(ato);
                                    }




                                }
                            }

                        }
                    }



                    continue;
                }

                let soloTransitions = obj.soloTransitions;
                if (soloTransitions && idCatch[obj.id]) {

                    let transitions = idCatch[obj.id].transitions;
                    let sTransitions = idCatch[obj.id].soloTransitions;

                    // let ats: AnimatorTransition2D[] = [];

                    for (let j = soloTransitions.length - 1; j >= 0; j--) {
                        let o = soloTransitions[j];
                        if (null == idCatch[o.id]) continue;


                        let ato = new AnimatorTransition2D();
                        ato.destState = idCatch[o.id];

                        if (o.conditions) {
                            this.addConditions(o.conditions, ato, data);
                        }

                        for (let k in o) {
                            if ("solo" == k || "id" == k || "conditions" == k) {
                                continue;
                            } else {
                                (ato as any)[k] = (o as any)[k];
                            }
                        }
                        if (o.solo) {
                            sTransitions.unshift(ato);
                        } else {
                            transitions.unshift(ato);
                        }

                    }
                }


            }
        }
    }
    private addConditions(arr: TypeAnimatorConditions[], ato: AnimatorTransition2D, data: TypeAnimatorControllerData) {
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
            } else if (parm.type == AniParmType.Trigger) {
                let t = new AnimatorStateTriggerCondition(o.name);
                c = t;
            }


            ato.addCondition(c);
        }
    }

    updateTo(a: Animator2D) {
        let currLayer = (a as any)._controllerLayers;

        for (let i = 0, len = currLayer.length; i < len; i++) {
            currLayer[i].destroy();
        }
        currLayer.length = 0;

        let layers = this.getLayers();
        for (let i = 0, len = layers.length; i < len; i++) {
            a.addControllerLayer(layers[i]);
        }

        let parms = this.data.animatorParams;
        if (parms) {
            let setParm: Record<string, Animation2DParm> = {};
            for (let i = parms.length - 1; i >= 0; i--) {
                let p = parms[i];
                let sp = new Animation2DParm();
                sp.name = p.name;
                sp.type = p.type;
                sp.value = p.val;
                setParm[p.name] = sp;
            }
            a.parameters = setParm;
        }



    }
}