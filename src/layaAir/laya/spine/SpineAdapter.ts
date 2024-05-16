import { Laya } from "../../Laya";
import { SpineSkeletonRenderer } from "./SpineSkeletonRenderer";
import { SpineTemplet } from "./SpineTemplet";
import { SpineWasmRender } from "./SpineWasmRender";
export class SpineAdapter {
    static _vbArray: Float32Array;
    static _ibArray: Uint16Array;
    static _spine: any;

    static isWasm: boolean;

    static stateMap: any = { 0: "start", 1: "interrupt", 2: "end", 3: "complete", 4: "dispose", 5: "event" };

    /**
    * 初始化系统，由系统内部调用
    * @internal
    */
    static initialize() {
        //@ts-ignore
        if (window.Spine) {
            SpineAdapter.isWasm = true;
            //@ts-ignore
            return window.Spine().then((spine: any) => {
                SpineAdapter._spine = spine;
                window.spine = spine;
                SpineAdapter.initClass();
                SpineAdapter.bindBuffer(10922 * 22, 10922 * 3);
                SpineAdapter.allAdpat();
                return Promise.resolve();
            });
        }
        else if (window.spine) {
            SpineAdapter.isWasm = false;
            SpineAdapter.adaptJS();
            SpineAdapter.allAdpat();
        }
    }

    static createNormalRender(templet: SpineTemplet, twoColorTint: boolean) {
        return SpineAdapter.isWasm ? new SpineWasmRender(templet, twoColorTint) : new SpineSkeletonRenderer(templet, twoColorTint);
    }

    static allAdpat() {

        let stateProto = spine.AnimationState.prototype;
        //@ts-ignore
        stateProto.oldApply = stateProto.apply;
        //@ts-ignore
        stateProto.applyCache = function (skeleton: spine.Skeleton) {
            //this.setAnimationLast(this.animationLast);
        }
        //@ts-ignore
        stateProto.getCurrentPlayTimeOld = function (trackIndex: number) {
            //@ts-ignore
            return Math.max(0, this.getCurrentOld(trackIndex).animationLast);
        }
        //@ts-ignore
        stateProto.getCurrentPlayTime = stateProto.getCurrentPlayTimeOld;
        //@ts-ignore
        stateProto.getCurrentPlayTimeByCache = function (trackIndex: number) {
            let entry = this.getCurrent(trackIndex);
            //trackEntry.setAnimationLast(trackEntry.getAnimationTime());
            let animationStart = entry.animationStart, animationEnd = entry.animationEnd;
            let duration = animationEnd - animationStart;
            entry.trackLast = entry.nextTrackLast;
            let trackLastWrapped = entry.trackLast % duration;
            let animationTime = entry.getAnimationTime();
            //entry.setAnimationLast(animationTime);

            let complete = false;
            if (entry.loop)
                complete = duration == 0 || trackLastWrapped > entry.trackTime % duration;
            else
                complete = animationTime >= animationEnd && entry.animationLast < animationEnd;
            if (complete) {
                //@ts-ignore
                this.dispatchEvent(entry, "complete", null);
                return 0;
               // animationTime = 0;
            }
            entry.nextAnimationLast = animationTime;
            entry.nextTrackLast = entry.trackTime;
            let animationLast = entry.animationLast;
            return Math.max(animationLast,0);
        }



        let skeletonProto = spine.Skeleton.prototype;
        //@ts-ignore
        skeletonProto.oldUpdateWorldTransform = skeletonProto.updateWorldTransform;
        //@ts-ignore
        skeletonProto.updateWorldTransformCache = function () {

        }
        //@ts-ignore
        spine.AnimationState.prototype.dispatchEvent = function (entry: any, type: string, event: any) {
            //@ts-ignore
            this.eventsObject[type](entry, event);
        }
    }

    static adaptJS() {
        if (spine) {
            //@ts-ignore 
            spine.AnimationState.prototype.oldAddListener = spine.AnimationState.prototype.addListener;
            spine.AnimationState.prototype.addListener = function (data: any) {
                //@ts-ignore 
                this.eventsObject = data;
                //@ts-ignore 
                this.oldAddListener(data);
            };
            let sketonDataProto = spine.SkeletonData.prototype;
            //@ts-ignore
            sketonDataProto.getAnimationsSize = function () { return this.animations.length };
            //@ts-ignore
            sketonDataProto.getAnimationByIndex = function (index: number) { return this.animations[index] };
            //@ts-ignore
            sketonDataProto.getSkinIndexByName = function (name: string) {
                let skins = this.skins;
                for (let i = 0, n = skins.length; i < n; i++) {
                    if (skins[i].name == name) {
                        return i;
                    }
                }
                return -1;
            }
            let skeletonProto = spine.Skeleton.prototype;
            //@ts-ignore
            skeletonProto.showSkinByIndex = function (index: number) {
                this.setSkin(this.data.skins[index]);
            }
            let stateProto = spine.AnimationState.prototype;
            //@ts-ignore
            stateProto.getCurrentOld = stateProto.getCurrent;

            stateProto.getCurrent = function (trackIndex: number) {
                //@ts-ignore
                let result = this.getCurrentOld(trackIndex);
                //@ts-ignore
                this.currentTrack = result;
                return result;
            }
        }
    }

    static initClass() {
        let stateProto = spine.AnimationState.prototype;
        stateProto.addListener = function (data: any) {
            //@ts-ignore 
            this.eventsObject = data;
            //@ts-ignore   
            this.setListener(SpineAdapter._spine.AnimationStateListenerObject.implement({
                callback: (state: any, type: any, entry: any, event: any) => {
                    data[SpineAdapter.stateMap[type.value]](entry, event);
                }
            }));
        }
        //@ts-ignore
        stateProto.getCurrentOld = stateProto.getCurrent;

        stateProto.getCurrent = function (trackIndex: number) {
            let result;
            //@ts-ignore
            let __tracks = this.__tracks;
            if (!__tracks) {
                //@ts-ignore
                __tracks = this.__tracks = [];
                //@ts-ignore
                result = this.getCurrentOld(trackIndex);
                __tracks[trackIndex] = result;
            }
            if (!result) {
                //@ts-ignore
                result = this.getCurrentOld(trackIndex);
                __tracks[trackIndex] = result;
            }
            //@ts-ignore
            this.currentTrack = result;
            return result;
        }

        spine.TextureAtlas = TextureAtlas as any;
        Object.defineProperty(spine.Skin.prototype, "attachments", {
            get: function () {
                return this.getAttachments();
            }
        });

        let skeletonProto = spine.Skeleton.prototype;

        Object.defineProperty(skeletonProto, "slots", {
            get: function () {
                return this.getSlots();
            }
        });

        Object.defineProperty(skeletonProto, "data", {
            get: function () {
                return this.getData();
            }
        });

        Object.defineProperty(skeletonProto, "bones", {
            get: function () {
                return this.getBones();
            }
        });

        Object.defineProperty(skeletonProto, "color", {
            get: function () {
                return this.getColor();
            }
        });

        let skeletonDataProto = spine.SkeletonData.prototype;

        Object.defineProperty(skeletonDataProto, "name", {
            get: function () {
                return this.getName();
            }
        });

        Object.defineProperty(skeletonDataProto, "skins", {
            get: function () {
                return this.getSkins();
            }
        });

        Object.defineProperty(skeletonDataProto, "slots", {
            get: function () {
                return this.getSlots();
            }
        });

        let animationProto = spine.Animation.prototype;
        Object.defineProperty(animationProto, "name", {
            get: function () {
                return this.getName();
            }
        });

        Object.defineProperty(animationProto, "duration", {
            get: function () {
                return this.getDuration();
            }
        });


        Object.defineProperty(animationProto, "timelines", {
            get: function () {
                return this.getTimelines();
            }
        });

        Object.defineProperty(skeletonDataProto, "animations", {
            get: function () {
                return this.getAnimations();
            }
        });



        Object.defineProperty(spine.Skin.prototype, "name", {
            get: function () {
                return this.getName();
            }
        });

        let slotDataProto = spine.SlotData.prototype;

        Object.defineProperty(slotDataProto, "boneData", {
            get: function () {
                return this.getBoneData();
            }
        });

        Object.defineProperty(slotDataProto, "color", {
            get: function () {
                return this.getColor();
            }
        });

        Object.defineProperty(slotDataProto, "index", {
            get: function () {
                return this.getIndex();
            }
        });
        Object.defineProperty(slotDataProto, "attachmentName", {
            get: function () {
                return this.getAttachmentName();
            }
        });


        Object.defineProperty(slotDataProto, "blendMode", {
            get: function () {
                return this.getBlendMode().value;
            }
        });

        // Object.defineProperty( spine.SlotData.prototype, "blendMode", {
        //     get: function () {
        //         return this.getBlendMode();
        //     }
        // });


        Object.defineProperty(spine.BoneData.prototype, "index", {
            get: function () {
                return this.getIndex();
            }
        });

        let regionAttachMentProto = spine.RegionAttachment.prototype;
        Object.defineProperty(regionAttachMentProto, "color", {
            get: function () {
                return this.getColor();
            }
        });

        Object.defineProperty(regionAttachMentProto, "name", {
            get: function () {
                return this.getName();
            }
        });

        Object.defineProperty(regionAttachMentProto, "offset", {
            get: function () {
                let from = this.getOffset();
                return from;
            }
        });


        Object.defineProperty(regionAttachMentProto, "uvs", {
            get: function () {
                return this.getRotateUVs();
            }
        });

        Object.defineProperty(regionAttachMentProto, "region", {
            get: function () {
                return this;
            }
        });
        Object.defineProperty(regionAttachMentProto, "page", {
            get: function () {
                return this.getPage();
            }
        });
        //@ts-ignore
        Object.defineProperty(spine.AtlasPage.prototype, "name", {
            get: function () {
                return this.getName();
            }
        });


        let meshAttachmentProto = spine.MeshAttachment.prototype;

        Object.defineProperty(meshAttachmentProto, "bones", {
            get: function () {
                return this.getBones();
            }
        });

        Object.defineProperty(meshAttachmentProto, "uvs", {
            get: function () {
                return this.getUVs();
            }
        });
        Object.defineProperty(meshAttachmentProto, "triangles", {
            get: function () {
                return this.getTriangles();
            }
        });
        Object.defineProperty(meshAttachmentProto, "vertices", {
            get: function () {
                let from = this.getVertices();
                return from;
            }
        });


        Object.defineProperty(meshAttachmentProto, "color", {
            get: function () {
                return this.getColor();
            }
        });
        Object.defineProperty(meshAttachmentProto, "region", {
            get: function () {
                return this;
            }
        });
        Object.defineProperty(meshAttachmentProto, "page", {
            get: function () {
                return this.getPage();
            }
        });

        Object.defineProperty(meshAttachmentProto, "name", {
            get: function () {
                return this.getName();
            }
        });
        let eventTimelineProto = spine.EventTimeline.prototype;
        Object.defineProperty(eventTimelineProto, "frames", {
            get: function () {
                return this.getFrames();
            }
        });

        Object.defineProperty(eventTimelineProto, "events", {
            get: function () {
                return this.getEvents();
            }
        });

        let attachmentTimelineProto = spine.AttachmentTimeline.prototype;
        Object.defineProperty(attachmentTimelineProto, "frames", {
            get: function () {
                return this.getFrames();
            }
        });

        Object.defineProperty(attachmentTimelineProto, "slotIndex", {
            get: function () {
                return this.getSlotIndex();
            }
        });

        Object.defineProperty(attachmentTimelineProto, "attachmentNames", {
            get: function () {
                return this.getAttachmentNames();
            }
        });

        let drawOrderTimelineProto = spine.DrawOrderTimeline.prototype;
        Object.defineProperty(drawOrderTimelineProto, "frames", {
            get: function () {
                return this.getFrames();
            }
        });

        Object.defineProperty(drawOrderTimelineProto, "drawOrders", {
            get: function () {
                return this.getDrawOrders();
            }
        });
        //@ts-ignore
        let colorTimelineProto = spine.ColorTimeline.prototype;
        Object.defineProperty(colorTimelineProto, "frames", {
            get: function () {
                return this.getFrames();
            }
        });

        Object.defineProperty(colorTimelineProto, "slotIndex", {
            get: function () {
                return this.getSlotIndex();
            }
        });

        let trackEntryProto = spine.TrackEntry.prototype;

        Object.defineProperty(trackEntryProto, "loop", {
            get: function () {
                return this.getLoop();
            }
        });

        Object.defineProperty(trackEntryProto, "animationStart", {
            get: function () {
                return this.getAnimationStart();
            },
            set: function (value) {
            }
        });

        Object.defineProperty(trackEntryProto, "animationEnd", {
            get: function () {
                return this.getAnimationEnd();
            }
        });

        Object.defineProperty(trackEntryProto, "animationLast", {
            get: function () {
                return this.getAnimationLast();
            }
        });

        Object.defineProperty(trackEntryProto, "nextAnimationLast", {
            get: function () {
                return this.getAnimationLast();
            },
            set: function (value) {
                this.setNextAnimationLast(value);
            }
        });

        // Object.defineProperty(trackEntryProto, "nextTrackLast", {
        //     get: function () {
        //         return ;
        //     },
        //     set: function (value) {
        //         //this.setNextTrackLast(value);
        //     }
        // });


        Object.defineProperty(trackEntryProto, "trackTime", {
            get: function () {
                return this.getTrackTime();
            }
        });

        Object.defineProperty(trackEntryProto, "animation", {
            get: function () {
                return this.getAnimation();
            }
        });

        let boneProto = spine.Bone.prototype;

        Object.defineProperty(boneProto, "a", {
            get: function () {
                return this.getA();
            }
        });

        Object.defineProperty(boneProto, "b", {
            get: function () {
                return this.getB();
            }
        });

        Object.defineProperty(boneProto, "c", {
            get: function () {
                return this.getC();
            }
        });

        Object.defineProperty(boneProto, "d", {
            get: function () {
                return this.getD();
            }
        });

        Object.defineProperty(boneProto, "worldX", {
            get: function () {
                return this.getWorldX();
            }
        });

        Object.defineProperty(boneProto, "worldY", {
            get: function () {
                return this.getWorldY();
            }
        });

        let eventProto = spine.Event.prototype;

        Object.defineProperty(eventProto, "volume", {
            get: function () {
                return this.getVolume();
            }
        });

        Object.defineProperty(eventProto, "balance", {
            get: function () {
                return this.getBalance();
            }
        });

        Object.defineProperty(eventProto, "time", {
            get: function () {
                return this.getTime();
            }
        });
        Object.defineProperty(eventProto, "data", {
            get: function () {
                return this.getData();
            }
        });

        Object.defineProperty(eventProto, "floatValue", {
            get: function () {
                return this.getFloatValue();
            }
        });

        Object.defineProperty(eventProto, "intValue", {
            get: function () {
                return this.getIntValue();
            }
        });

        Object.defineProperty(eventProto, "stringValue", {
            get: function () {
                return this.getStringValue();
            }
        });


        let eventDataProto = spine.EventData.prototype;
        Object.defineProperty(eventDataProto, "name", {
            get: function () {
                return this.getName();
            }
        });

        // Object.defineProperty(eventDataProto, "intValue", {
        //     get: function () {
        //         return this.getIntValue();
        //     }
        // });

        // Object.defineProperty(eventDataProto, "floatValue", {
        //     get: function () {
        //         return this.getFloatValue();
        //     }
        // });

        // Object.defineProperty(eventDataProto, "stringValue", {
        //     get: function () {
        //         return this.getStringValue();
        //     }
        // });

        Object.defineProperty(eventDataProto, "audioPath", {
            get: function () {
                return this.getAudioPath();
            }
        });

    }

    static bindBuffer(maxNumVertices: number, maxNumIndices: number) {
        SpineAdapter._spine.createBuffer(maxNumVertices, maxNumIndices);
        SpineAdapter._vbArray = SpineAdapter._spine.getVertexsBuffer();
        SpineAdapter._ibArray = SpineAdapter._spine.getIndexsBuffer();
    }

    // static parseAtlas(text, path, atlasPages, atlasUrls) {

    //     return new SpineManager._spine.Atlas(text, path, SpineManager._spine.TextureLoader.implement({
    //         load: function (page, path) {
    //             atlasUrls.push({ url: path });
    //             atlasPages.push(page);
    //         },
    //         unload: function (s) {

    //         }
    //     }), true);
    // }

    // static createAtlasAttachmentLoader(loader) {
    //     return new SpineManager._spine.AtlasAttachmentLoader(loader);
    // }

    // static readSkeletonData(desc, loader) {
    //     let atlasLoader = new SpineManager._spine.AtlasAttachmentLoader(loader);
    //     if (desc instanceof ArrayBuffer) {
    //         let skeleton = new SpineManager._spine.SkeletonBinary(atlasLoader, false);
    //         return skeleton.readSkeletonData(new Uint8Array(desc));
    //     }
    //     else {
    //         let skeleton = new SpineManager._spine.SkeletonJson(atlasLoader, false);
    //         return skeleton.readSkeletonData(JSON.stringify(desc));
    //     }
    // }

    // static createAnimationStateListenerObject(fun: Function) {
    //     return SpineManager._spine.AnimationStateListenerObject.implement({
    //         callback: fun
    //     })
    // }

    static drawSkeleton(fun: Function, skeleton: any, twoColorTint: boolean, slotRangeStart: number, slotRangeEnd: number) {
        SpineAdapter._spine.drawSkeleton(fun, skeleton, twoColorTint, slotRangeStart, slotRangeEnd);
    }

    // static createSkinnerRender(render: SpineWasmRender) {
    //     return SpineManager._spine.LayaSkinnerRender.implement({
    //         graphicsRender: function (vbLen: number, iblen: number, texturePath: string, blendMode: any) {
    //             render.graphicsRender(vbLen, iblen, texturePath, blendMode);
    //         }
    //     })
    // }

}

class TextureAtlas {
    constructor(atlasText: string, textureLoader: any) {
        return new SpineAdapter._spine.Atlas(atlasText, "", SpineAdapter._spine.TextureLoader.implement({
            load: (page: any, url: string) => {
                let texture = textureLoader(url);
                page.texture = texture;
            },
            unload: function (s: any) {

            }
        }), true);


    }
}
Laya.addBeforeInitCallback(SpineAdapter.initialize);
