/**
 * 阿拉伯文的转码。把unicode的阿拉伯文字母编码转成他们的老的能描述不同写法的编码。
 *  这个是从GitHub上 Javascript-Arabic-Reshaper 项目转来的
 * https://github.com/louy/Javascript-Arabic-Reshaper/blob/master/src/index.js
 */
/**
     * Javascript Arabic Reshaper by Louy Alakkad
     * https://github.com/louy/Javascript-Arabic-Reshaper
     * Based on (http://git.io/vsnAd)
     */
export class ArabicReshaper {
    //TODO:coverage
    characterMapContains(c) {
        for (var i = 0; i < ArabicReshaper.charsMap.length; ++i) {
            if (ArabicReshaper.charsMap[i][0] === c) {
                return true;
            }
        }
        return false;
    }
    //TODO:coverage
    getCharRep(c) {
        for (var i = 0; i < ArabicReshaper.charsMap.length; ++i) {
            if (ArabicReshaper.charsMap[i][0] === c) {
                return ArabicReshaper.charsMap[i];
            }
        }
        return false;
    }
    //TODO:coverage
    getCombCharRep(c1, c2) {
        for (var i = 0; i < ArabicReshaper.combCharsMap.length; ++i) {
            if (ArabicReshaper.combCharsMap[i][0][0] === c1 && ArabicReshaper.combCharsMap[i][0][1] === c2) {
                return ArabicReshaper.combCharsMap[i];
            }
        }
        // We should never reach here...
        // istanbul ignore next
        return false;
    }
    //TODO:coverage
    isTransparent(c) {
        for (var i = 0; i < ArabicReshaper.transChars.length; ++i) {
            if (ArabicReshaper.transChars[i] === c) {
                return true;
            }
        }
        return false;
    }
    //TODO:coverage
    getOriginalCharsFromCode(code) {
        var j;
        for (j = 0; j < ArabicReshaper.charsMap.length; ++j) {
            if (ArabicReshaper.charsMap[j].indexOf(code) > -1) {
                return String.fromCharCode(ArabicReshaper.charsMap[j][0]);
            }
        }
        for (j = 0; j < ArabicReshaper.combCharsMap.length; ++j) {
            if (ArabicReshaper.combCharsMap[j].indexOf(code) > -1) {
                return String.fromCharCode(ArabicReshaper.combCharsMap[j][0][0]) +
                    String.fromCharCode(ArabicReshaper.combCharsMap[j][0][1]);
            }
        }
        return String.fromCharCode(code);
    }
    /**
     * 转换函数。从normal转到presentB
     * 这个返回的字符串可以直接按照从左到右的顺序渲染。
     * 例如
     * graphics.fillText(convertArabic('سلام'),....)
     *
    */
    //TODO:coverage
    convertArabic(normal) {
        var crep, combcrep, shaped = '';
        for (var i = 0; i < normal.length; ++i) {
            var current = normal.charCodeAt(i);
            if (this.characterMapContains(current)) {
                var prev = null, next = null, prevID = i - 1, nextID = i + 1;
                /*
                  Transparent characters have no effect in the shaping process.
                  So, ignore all the transparent characters that are BEFORE the
                  current character.
                  */
                for (; prevID >= 0; --prevID) {
                    if (!this.isTransparent(normal.charCodeAt(prevID))) {
                        break;
                    }
                }
                prev = (prevID >= 0) ? normal.charCodeAt(prevID) : null;
                crep = prev ? this.getCharRep(prev) : false;
                if (!crep || crep[2] == null && crep[3] == null) {
                    prev = null; // prev character doesn’t connect with its successor
                }
                /*
                  Transparent characters have no effect in the shaping process.
                  So, ignore all the transparent characters that are AFTER the
                  current character.
                  */
                for (; nextID < normal.length; ++nextID) {
                    if (!this.isTransparent(normal.charCodeAt(nextID))) {
                        break;
                    }
                }
                next = (nextID < normal.length) ? normal.charCodeAt(nextID) : null;
                crep = next ? this.getCharRep(next) : false;
                if (!crep || crep[3] == null && crep[4] == null) {
                    next = null; // next character doesn’t connect with its predecessor
                }
                /* Combinations */
                if (current === 0x0644 && next != null &&
                    (next === 0x0622 || next === 0x0623 || next === 0x0625 || next === 0x0627)) {
                    combcrep = this.getCombCharRep(current, next);
                    if (prev != null) {
                        shaped += String.fromCharCode(combcrep[4]);
                    }
                    else {
                        shaped += String.fromCharCode(combcrep[1]);
                    }
                    ++i;
                    continue;
                }
                crep = this.getCharRep(current);
                /* Medial */
                if (prev != null && next != null && crep[3] != null) {
                    shaped += String.fromCharCode(crep[3]);
                    continue;
                }
                else /* Final */ if (prev != null && crep[4] != null) {
                    shaped += String.fromCharCode(crep[4]);
                    continue;
                }
                else /* Initial */ if (next != null && crep[2] != null) {
                    shaped += String.fromCharCode(crep[2]);
                    continue;
                }
                else /* Isolated */ {
                    shaped += String.fromCharCode(crep[1]);
                }
            }
            else {
                shaped += String.fromCharCode(current);
            }
        }
        return shaped;
    } /*;*/
    // convert from Arabic Presentation Forms B
    //TODO:coverage
    convertArabicBack(apfb) {
        var toReturn = '', selectedChar;
        var i;
        for (i = 0; i < apfb.length; ++i) {
            selectedChar = apfb.charCodeAt(i);
            toReturn += this.getOriginalCharsFromCode(selectedChar);
        }
        return toReturn;
    }
}
ArabicReshaper.charsMap = [[0x0621, 0xFE80, null, null, null],
    [0x0622, 0xFE81, null, null, 0xFE82],
    [0x0623, 0xFE83, null, null, 0xFE84],
    [0x0624, 0xFE85, null, null, 0xFE86],
    [0x0625, 0xFE87, null, null, 0xFE88],
    [0x0626, 0xFE89, 0xFE8B, 0xFE8C, 0xFE8A],
    [0x0627, 0xFE8D, null, null, 0xFE8E],
    [0x0628, 0xFE8F, 0xFE91, 0xFE92, 0xFE90],
    [0x0629, 0xFE93, null, null, 0xFE94],
    [0x062A, 0xFE95, 0xFE97, 0xFE98, 0xFE96],
    [0x062B, 0xFE99, 0xFE9B, 0xFE9C, 0xFE9A],
    [0x062C, 0xFE9D, 0xFE9F, 0xFEA0, 0xFE9E],
    [0x062D, 0xFEA1, 0xFEA3, 0xFEA4, 0xFEA2],
    [0x062E, 0xFEA5, 0xFEA7, 0xFEA8, 0xFEA6],
    [0x062F, 0xFEA9, null, null, 0xFEAA],
    [0x0630, 0xFEAB, null, null, 0xFEAC],
    [0x0631, 0xFEAD, null, null, 0xFEAE],
    [0x0632, 0xFEAF, null, null, 0xFEB0],
    [0x0633, 0xFEB1, 0xFEB3, 0xFEB4, 0xFEB2],
    [0x0634, 0xFEB5, 0xFEB7, 0xFEB8, 0xFEB6],
    [0x0635, 0xFEB9, 0xFEBB, 0xFEBC, 0xFEBA],
    [0x0636, 0xFEBD, 0xFEBF, 0xFEC0, 0xFEBE],
    [0x0637, 0xFEC1, 0xFEC3, 0xFEC4, 0xFEC2],
    [0x0638, 0xFEC5, 0xFEC7, 0xFEC8, 0xFEC6],
    [0x0639, 0xFEC9, 0xFECB, 0xFECC, 0xFECA],
    [0x063A, 0xFECD, 0xFECF, 0xFED0, 0xFECE],
    [0x0640, 0x0640, 0x0640, 0x0640, 0x0640],
    [0x0641, 0xFED1, 0xFED3, 0xFED4, 0xFED2],
    [0x0642, 0xFED5, 0xFED7, 0xFED8, 0xFED6],
    [0x0643, 0xFED9, 0xFEDB, 0xFEDC, 0xFEDA],
    [0x0644, 0xFEDD, 0xFEDF, 0xFEE0, 0xFEDE],
    [0x0645, 0xFEE1, 0xFEE3, 0xFEE4, 0xFEE2],
    [0x0646, 0xFEE5, 0xFEE7, 0xFEE8, 0xFEE6],
    [0x0647, 0xFEE9, 0xFEEB, 0xFEEC, 0xFEEA],
    [0x0648, 0xFEED, null, null, 0xFEEE],
    [0x0649, 0xFEEF, null, null, 0xFEF0],
    [0x064A, 0xFEF1, 0xFEF3, 0xFEF4, 0xFEF2],
    [0x067E, 0xFB56, 0xFB58, 0xFB59, 0xFB57],
    [0x06CC, 0xFBFC, 0xFBFE, 0xFBFF, 0xFBFD],
    [0x0686, 0xFB7A, 0xFB7C, 0xFB7D, 0xFB7B],
    [0x06A9, 0xFB8E, 0xFB90, 0xFB91, 0xFB8F],
    [0x06AF, 0xFB92, 0xFB94, 0xFB95, 0xFB93],
    [0x0698, 0xFB8A, null, null, 0xFB8B]];
ArabicReshaper.combCharsMap = [[[0x0644, 0x0622], 0xFEF5, null, null, 0xFEF6],
    [[0x0644, 0x0623], 0xFEF7, null, null, 0xFEF8],
    [[0x0644, 0x0625], 0xFEF9, null, null, 0xFEFA],
    [[0x0644, 0x0627], 0xFEFB, null, null, 0xFEFC]];
ArabicReshaper.transChars = [0x0610,
    0x0612,
    0x0613,
    0x0614,
    0x0615,
    0x064B,
    0x064C,
    0x064D,
    0x064E,
    0x064F,
    0x0650,
    0x0651,
    0x0652,
    0x0653,
    0x0654,
    0x0655,
    0x0656,
    0x0657,
    0x0658,
    0x0670,
    0x06D6,
    0x06D7,
    0x06D8,
    0x06D9,
    0x06DA,
    0x06DB,
    0x06DC,
    0x06DF,
    0x06E0,
    0x06E1,
    0x06E2,
    0x06E3,
    0x06E4,
    0x06E7,
    0x06E8,
    0x06EA,
    0x06EB,
    0x06EC,
    0x06ED];
