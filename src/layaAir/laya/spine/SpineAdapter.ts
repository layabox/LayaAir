import { Laya } from "../../Laya";
import { SpineSkeletonRenderer } from "./normal/SpineSkeletonRenderer";
import { SpineTemplet } from "./SpineTemplet";
import { SpineWasmRender } from "./normal/SpineWasmRender";
/**
 * @en SpineAdapter is an adapter class for integrating the Spine animation system.
 * @zh SpineAdapter 是一个适配器类，用于集成 Spine 动画系统。
 */
export class SpineAdapter {
    static _vbArray: Float32Array;
    static _ibArray: Uint16Array;
    static _spine: any;

    /**
     * @en Indicates whether the Spine system is using WebAssembly.
     * @zh 指示 Spine 系统是否使用 WebAssembly。
     */
    static isWasm: boolean;

    /**
     * @en Map of state values to their corresponding string representations.
     * @zh 状态值到其对应字符串表示的映射。
     */
    static stateMap: any = { 0: "start", 1: "interrupt", 2: "end", 3: "complete", 4: "dispose", 5: "event" };

    /**
     * @internal
     * @en Initialize the system, called internally by the system.
     * @zh 初始化系统，由系统内部调用。
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
                SpineAdapter.bindBuffer(10922 * 12, 10922 * 3);
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

    /**
     * @en Create a normal render object for Spine animation.
     * @param templet The Spine template.
     * @param twoColorTint Whether to use two-color tinting.
     * @zh 为 Spine 动画创建一个普通渲染对象。
     * @param templet Spine 模板。
     * @param twoColorTint 是否使用两色染色。
     */
    static createNormalRender(templet: SpineTemplet, twoColorTint: boolean) {
        return SpineAdapter.isWasm ? new SpineWasmRender(templet, twoColorTint) : new SpineSkeletonRenderer(templet, twoColorTint);
    }

    /**
     * @en Perform all necessary adaptations for Spine integration.
     * @zh 执行所有必要的 Spine 集成适配。
     */
    static allAdpat() {

        let stateProto = window.spine.AnimationState.prototype;
        //@ts-ignore
        stateProto.oldApply = stateProto.apply;
        //@ts-ignore
        stateProto.applyCache = function (skeleton: spine.Skeleton) {
            //this.setAnimationLast(this.animationLast);
        }
        //@ts-ignore
        stateProto.getCurrentPlayTimeOld = function (trackIndex: number) {
            //@ts-ignore
            // return Math.max(0, this.getCurrentOld(trackIndex).animationLast);
            return this.getCurrentOld(trackIndex).getAnimationTime();
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
                entry.nextAnimationLast = -1;
                entry.nextTrackLast = -1;
                return 0;
                // animationTime = 0;
            }
            entry.nextAnimationLast = animationTime;
            entry.nextTrackLast = entry.trackTime;
            let animationLast = entry.animationLast;
            return Math.max(animationLast, 0);
        }



        let skeletonProto = window.spine.Skeleton.prototype;
        //@ts-ignore
        skeletonProto.oldUpdateWorldTransform = skeletonProto.updateWorldTransform;
        //@ts-ignore
        skeletonProto.updateWorldTransformCache = function () {

        }
        //@ts-ignore
        window.spine.AnimationState.prototype.dispatchEvent = function (entry: any, type: string, event: any) {
            //@ts-ignore
            this.eventsObject[type](entry, event);
        }
    }

    /**
     * @en Adapt the JavaScript version of Spine.
     * @zh 适配 JavaScript 版本的 Spine。
     */
    static adaptJS() {
        if (window.spine) {
            //@ts-ignore 
            window.spine.AnimationState.prototype.oldAddListener = window.spine.AnimationState.prototype.addListener;
            window.spine.AnimationState.prototype.addListener = function (data: any) {
                //@ts-ignore 
                this.eventsObject = data;
                //@ts-ignore 
                this.oldAddListener(data);
            };
            let sketonDataProto = window.spine.SkeletonData.prototype;
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
            let skeletonProto = window.spine.Skeleton.prototype;
            //@ts-ignore
            skeletonProto.showSkinByIndex = function (index: number) {
                this.setSkin(this.data.skins[index]);
            }
            let stateProto = window.spine.AnimationState.prototype;
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

    /**
     * @en Initialize and extend the Spine animation library's AnimationState prototype.
     * @zh 初始化并扩展Spine动画库的AnimationState原型。
     */
    static initClass() {
        let stateProto = window.spine.AnimationState.prototype;
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
        //@ts-ignore
        stateProto.setAnimationOld = stateProto.setAnimation;

        stateProto.setAnimation = function (trackIndex: number, animationName: string, loop: boolean) {
            //@ts-ignore
            if(this.__tracks){
                //@ts-ignore
                this.__tracks.length = 0;
            }
            //@ts-ignore
            return this.setAnimationOld(trackIndex, animationName, loop);
        }

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
            else {
                result = __tracks[trackIndex];
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

        window.spine.TextureAtlas = TextureAtlas as any;
        Object.defineProperty(window.spine.Skin.prototype, "attachments", {
            get: function () {
                return this.getAttachments();
            }
        });

        let skeletonProto = window.spine.Skeleton.prototype;

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

        let skeletonDataProto = window.spine.SkeletonData.prototype;

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

        let animationProto = window.spine.Animation.prototype;
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



        Object.defineProperty(window.spine.Skin.prototype, "name", {
            get: function () {
                return this.getName();
            }
        });

        let slotDataProto = window.spine.SlotData.prototype;

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

        // Object.defineProperty( window.spine.SlotData.prototype, "blendMode", {
        //     get: function () {
        //         return this.getBlendMode();
        //     }
        // });


        Object.defineProperty(window.spine.BoneData.prototype, "index", {
            get: function () {
                return this.getIndex();
            }
        });

        let regionAttachMentProto = window.spine.RegionAttachment.prototype;
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
        Object.defineProperty(window.spine.AtlasPage.prototype, "name", {
            get: function () {
                return this.getName();
            }
        });


        let meshAttachmentProto = window.spine.MeshAttachment.prototype;

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
        let eventTimelineProto = window.spine.EventTimeline.prototype;
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

        let attachmentTimelineProto = window.spine.AttachmentTimeline.prototype;
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

        let drawOrderTimelineProto = window.spine.DrawOrderTimeline.prototype;
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
        let colorTimelineProto = window.spine.ColorTimeline.prototype;
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

        let trackEntryProto = window.spine.TrackEntry.prototype;

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

        let boneProto = window.spine.Bone.prototype;

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

        let eventProto = window.spine.Event.prototype;

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


        let eventDataProto = window.spine.EventData.prototype;
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

    /**
     * @en Bind vertex and index buffers for Spine rendering.
     * @param maxNumVertices Maximum number of vertices.
     * @param maxNumIndices Maximum number of indices.
     * @zh 为 Spine 渲染绑定顶点和索引缓冲区。
     * @param maxNumVertices 最大顶点数量。
     * @param maxNumIndices 最大索引数量。
     */
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

    /**
     * @en Draw a Spine skeleton.
     * @param fun The drawing function.
     * @param skeleton The Spine skeleton to draw.
     * @param twoColorTint Whether to use two-color tinting.
     * @param slotRangeStart The starting slot index.
     * @param slotRangeEnd The ending slot index.
     * @zh 绘制 Spine 骨骼。
     * @param fun 绘制函数。
     * @param skeleton 要绘制的 Spine 骨骼。
     * @param twoColorTint 是否使用两色混色。
     * @param slotRangeStart 起始插槽索引。
     * @param slotRangeEnd 结束插槽索引。
     */
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

/**
 * @en TextureAtlas class for handling Spine texture atlases.
 * @zh TextureAtlas 类用于处理 Spine 纹理图集。
 */
class TextureAtlas {
    /**
     * @en Creates a new TextureAtlas instance.
     * @param atlasText The atlas data in text format.
     * @param textureLoader A function to load textures.
     * @zh 创建一个新的 TextureAtlas 实例。
     * @param atlasText 纹理图集数据（文本格式）。
     * @param textureLoader 用于加载纹理的函数。
     */
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
