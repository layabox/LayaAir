/** @internal Shader-side MRT contract; attachment semantics remain the caller's responsibility. */
export class ShaderMRT {
    static readonly defineName = "LAYA_MRT";

    /**
     * Extract global, explicitly located vec4 outputs after the backend's GLSL preprocessing.
     * This is not a GLSL preprocessor; #if/defines must already be resolved by the compiler.
     * Arrays and interface blocks are not supported by this initial WebGPU conversion path.
     * Function out parameters and comments must never be mistaken for fragment outputs.
     */
    static extract(source: string): { declarations: string; source: string } {
        const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,
            comment => comment.replace(/[^\r\n]/g, " "));
        const tokens = /^[ \t]*#[^\r\n]*(?:\\\r?\n[^\r\n]*)*|[A-Za-z_]\w*|\d+|[^\s]/gm;
        const locations = new Set<number>();
        const names = new Set<string>();
        const declarations: string[] = [];
        const spans: [number, number][] = [];
        let braces = 0, parentheses = 0, conditional = 0, start = 0;
        let output = false, conditionalOutput = false;
        let token: RegExpExecArray | null;
        while ((token = tokens.exec(code))) {
            const word = token[0].trim();
            if (word[0] === "#") {
                if (/^#\s*(if|ifdef|ifndef)\b/.test(word)) conditional++;
                else if (/^#\s*endif\b/.test(word)) conditional--;
                if (braces === 0 && !output) start = tokens.lastIndex;
                continue;
            }
            if (word === "gl_FragColor" || word === "gl_FragData" || word === "pc_fragColor")
                throw new Error("LAYA_MRT cannot use legacy/default fragment outputs; declare layout(location = N) out vec4 outputs.");
            if (word === "out" && braces === 0 && parentheses === 0) {
                output = true;
                conditionalOutput = conditional !== 0;
            }
            if (word === "(") parentheses++;
            else if (word === ")") parentheses--;
            else if (word === "{") {
                if (output) throw new Error("LAYA_MRT output blocks are not supported.");
                braces++;
            } else if (word === "}") {
                braces--;
                if (braces === 0) start = tokens.lastIndex;
            } else if (word === ";" && braces === 0 && parentheses === 0) {
                if (output) {
                    if (conditionalOutput)
                        throw new Error("LAYA_MRT output extraction requires preprocessed GLSL; found an unresolved #if branch.");
                    const declaration = code.slice(start, tokens.lastIndex);
                    const match = /^\s*layout\s*\(\s*location\s*=\s*(\d+)\s*\)\s*out\s+(?:(highp|mediump|lowp)\s+)?vec4\s+([A-Za-z_]\w*)\s*;\s*$/.exec(declaration);
                    if (!match)
                        throw new Error("LAYA_MRT requires 'layout(location = N) out [precision] vec4 name;' with a literal non-negative integer location.");
                    const location = Number(match[1]), name = match[3];
                    if (!Number.isSafeInteger(location) || locations.has(location))
                        throw new Error(`LAYA_MRT has an invalid or duplicate output location ${match[1]}.`);
                    if (names.has(name)) throw new Error(`LAYA_MRT has a duplicate output name '${name}'.`);
                    locations.add(location);
                    names.add(name);
                    declarations.push(`layout(location = ${location}) out ${match[2] ? match[2] + " " : ""}vec4 ${name};`);
                    spans.push([start, tokens.lastIndex]);
                }
                start = tokens.lastIndex;
                output = false;
                conditionalOutput = false;
            }
        }
        if (!declarations.length || output)
            throw new Error("LAYA_MRT requires explicit fragment output declarations.");
        // Preserve comments, directives and source positions outside the extracted declarations.
        let stripped = source;
        for (let i = spans.length - 1; i >= 0; i--) {
            const [begin, end] = spans[i];
            stripped = stripped.slice(0, begin) + stripped.slice(begin, end).replace(/[^\r\n]/g, " ") + stripped.slice(end);
        }
        return { declarations: declarations.join("\n"), source: stripped };
    }
}
