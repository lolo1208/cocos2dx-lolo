namespace lolo {


    /**
     * 使用 Shader 实现一些滤镜效果
     * 2017/7/27
     * @author LOLO
     */
    export class Filter {

        private static _programs: any = {};


        /**
         * 图像变灰
         * @param target
         */
        public static grayScale(target: cc.Sprite): void {
            let program: cc.GLProgram = this._programs["grayScale"];
            if (program == null) {
                program = new cc.GLProgram();
                program.retain();
                program.initWithString(this.DEFAULT_VERTEX_SHADER, this.GRAY_SCALE_FRAGMENT_SHADER);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                program.link();
                program.updateUniforms();
                this._programs["grayScale"] = program;
            }
            target.setShaderProgram(program);
        }


        public static none(target: cc.Sprite): void {
            let program: cc.GLProgram = this._programs["none"];
            if (program == null) {
                program = new cc.GLProgram();
                program.retain();
                program.initWithString(this.DEFAULT_VERTEX_SHADER, this.NONE_FRAGMENT_SHADER);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                program.link();
                program.updateUniforms();
                this._programs["none"] = program;
            }
            target.setShaderProgram(program);
        }

        public static NONE_FRAGMENT_SHADER: string = ""
            + "#ifdef GL_ES \n"
            + "    precision lowp float; \n"
            + "#endif \n"
            + "varying vec4 v_fragmentColor; \n"
            + "varying vec2 v_texCoord; \n"
            + "void main() \n"
            + "{ \n"
            + "    vec4 c = texture2D(CC_Texture0, v_texCoord); \n"
            + "    c = v_fragmentColor * c; \n"
            + "    gl_FragColor = c; \n"
            + "}";

        //

        public static DEFAULT_VERTEX_SHADER: string = ""
            + "attribute vec4 a_position; \n"
            + "attribute vec2 a_texCoord; \n"
            + "attribute vec4 a_color; \n"
            + "#ifdef GL_ES \n"
            + "    varying lowp vec4 v_fragmentColor; \n"
            + "    varying mediump vec2 v_texCoord; \n"
            + "#else \n"
            + "    varying vec4 v_fragmentColor; \n"
            + "    varying vec2 v_texCoord; \n"
            + "#endif \n"
            + "void main() \n"
            + "{ \n"
            + "    gl_Position = CC_PMatrix * a_position; \n"
            + "    v_fragmentColor = a_color; \n"
            + "    v_texCoord = a_texCoord; \n"
            + "}";
        //

        public static GRAY_SCALE_FRAGMENT_SHADER: string = ""
            + "#ifdef GL_ES \n"
            + "    precision lowp float; \n"
            + "#endif \n"
            + "varying vec4 v_fragmentColor; \n"
            + "varying vec2 v_texCoord; \n"
            + "void main() \n"
            + "{ \n"
            + "    vec4 c = texture2D(CC_Texture0, v_texCoord); \n"
            + "    c = v_fragmentColor * c; \n"
            + "    gl_FragColor.xyz = vec3(0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b); \n"
            + "    gl_FragColor.w = c.w; \n"
            + "}";


        //
    }
}