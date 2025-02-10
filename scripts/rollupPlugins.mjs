import MagicString from 'magic-string';
import rollupPluginutils from 'rollup-pluginutils';

export function glsl(options) {
    if (options === void 0) options = {};

    var filter = rollupPluginutils.createFilter(options.include, options.exclude);

    return {
        name: 'glsl',

        transform: function transform(source, id) {
            if (!filter(id)) return;

            var code = generateCode(options.compress !== false ? compressShader(source) : source),
                magicString = new MagicString(code);

            var result = { code: magicString.toString() };
            if (options.sourceMap !== false) {
                result.map = magicString.generateMap({ hires: true })
            }
            return result
        }
    };
}


function compressShader(source) {
    var needNewline = false;
    return source.replace(/\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/gs, "").split(/\n+/).reduce(function (result, line) {
        line = line.trim().replace(/\s{2,}|\t/, " ");
        if (line[0] === '#') {
            if (needNewline) {
                result.push("\n");
            }

            result.push(line, "\n");
            needNewline = false
        } else {
            // Add space after "else" at end of prior line (unless this line starts with curly brace)
            if (!line.startsWith('{')
                && result.length
                && result[result.length - 1].endsWith('else')
            ) {
                result.push(' ');
            }
            result.push(line
                .replace(/\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|\-|!|;)\s*/g, "$1"))
            needNewline = true;
        }
        return result;
    }, []).join('').replace(/\n+/g, "\n");
}

function generateCode(source) {
    return ("export default " + (JSON.stringify(source)) + ";");
}
