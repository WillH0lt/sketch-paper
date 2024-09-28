precision highp float;

in vec2 vUV;

uniform sampler2D uTexture;
uniform sampler2D uShapeTexture;
uniform float uBrushSize;

void main() {
    vec4 color = texture2D(uTexture, vUV).rgba;

    vec2 brushUV = vUV + 120.0 * (vec2(0.5) - vUV) / uBrushSize;
    vec4 brushMask = texture2D(uShapeTexture, brushUV).rgba;

    gl_FragColor = brushMask.a * color;
}