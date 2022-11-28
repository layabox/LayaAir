import { AnimatorControllerParse, AniParmType, TypeAnimatorConditions, TypeAnimatorControllerData, TypeAnimatorParams, TypeAnimatorState } from "../../../components/AnimatorControllerParse";
import { Resource } from "../../../resource/Resource";
import { ClassUtils } from "../../../utils/ClassUtils";
import { Animator } from "./Animator";
import { AnimatorControllerLayer } from "./AnimatorControllerLayer";
import { AnimatorState } from "./AnimatorState";
import { AnimatorStateBoolCondition, AnimatorStateCondition, AnimatorStateNumberCondition, AnimatorStateTriggerCondition } from "./AnimatorStateCondition";
import { AnimatorTransition } from "./AnimatorTransition";

export class AnimatorController extends Resource {
    data: TypeAnimatorControllerData;
    clipsID: string[];
    constructor(data: any) {
        super();
        let obj = AnimatorControllerParse.parse(data);


        this.data = obj.ret;
        this.clipsID = obj.clipsID;
    }

    private getLayers() {
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
        return lArr;
    }


    updateTo(a: Animator) {
        let currLayer = (a as any)._controllerLayers;

        for (let i = 0, len = currLayer.length; i < len; i++) {
            currLayer[i]._removeReference();
        }
        currLayer.length = 0;

        let layers = this.getLayers();

        for (let i = 0, len = layers.length; i < len; i++) {
            a.addControllerLayer(layers[i]);
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
                } else if (AniParmType.Trigger == p.type) {
                    if (p.val) {
                        a.setParamsTrigger(p.name);
                    }
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

                if (0 > Number(obj.id)) {
                    continue;
                }


                let state = new AnimatorState();
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


            //acl.defaultState = 


            for (let i = states.length - 1; i >= 0; i--) {
                let obj = states[i];

                if ("-1" == obj.id) {
                    if (obj.soloTransitions && 0 < obj.soloTransitions.length) {
                        acl.defaultState = idCatch[obj.soloTransitions[0].id];
                        continue;
                    }
                } else if ("-2" == obj.id) {
                    let transitions = obj.soloTransitions;
                    if (transitions) {
                        for (let j = transitions.length - 1; j >= 0; j--) {
                            let o = transitions[j];
                            let destState = idCatch[o.id];
                            if (destState) {
                                for (let idk in idCatch) {
                                    let state = idCatch[idk];
                                    let ato = new AnimatorTransition();
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

                    let ats: AnimatorTransition[] = idCatch[obj.id].transitions;
                    let sts: AnimatorTransition[] = idCatch[obj.id].soloTransitions;



                    for (let j = soloTransitions.length - 1; j >= 0; j--) {
                        let o = soloTransitions[j];
                        let ato = new AnimatorTransition();

                        for (let k in o) {
                            if ("solo" == k) {

                            } else if ("id" == k) {
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
                        if (o.solo) {
                            sts.unshift(ato);
                        } else {
                            ats.unshift(ato);
                        }
                    }
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
            } else if (parm.type == AniParmType.Trigger) {
                let t = new AnimatorStateTriggerCondition(o.name);
                c = t;
            }


            ato.addCondition(c);
        }
    }



}