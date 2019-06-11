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
export declare class ArabicReshaper {
    private static charsMap;
    private static combCharsMap;
    private static transChars;
    characterMapContains(c: number): boolean;
    getCharRep(c: number): boolean;
    getCombCharRep(c1: any, c2: any): boolean;
    isTransparent(c: any): boolean;
    getOriginalCharsFromCode(code: any): string;
    /**
     * 转换函数。从normal转到presentB
     * 这个返回的字符串可以直接按照从左到右的顺序渲染。
     * 例如
     * graphics.fillText(convertArabic('سلام'),....)
     *
    */
    convertArabic(normal: any): string;
    convertArabicBack(apfb: any): string;
}
