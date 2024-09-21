precision highp float;

in vec2 vUV;

uniform sampler2D uTexture;
uniform sampler2D uShapeTexture;
uniform sampler2D uGrainTexture;
uniform float uBrushSize;
uniform vec4 uBrushColor;
uniform vec2 uPosition;
uniform vec2 uLastPosition;

vec2 rotateUV(vec2 uv, vec2 mid, float rotation) {
    float s = sin(rotation);
    float c = cos(rotation);
    mat2 rotationMatrix = mat2(c, -s, s, c);
    return mid + rotationMatrix * (uv - mid);
}

float rand(float co){
    return fract(sin(co * 12.9898) * 43758.5453);
}

void main() {
    vec2 brushUv = vUV + 100.0 * (vec2(0.5) - vUV) / uBrushSize;
    float theta = atan(uPosition.y - uLastPosition.y, uPosition.x - uLastPosition.x);
    // theta = min(abs(theta), 1.5);
    // brushUv = rotateUV(brushUv, vec2(0.5), 3.14 / 4.0);

    vec2 shapeUV = brushUv;
    vec4 shapeMask = texture2D(uShapeTexture, shapeUV).rgba;
    float alpha = (0.005 + 0.15 * (1.0 - 0.5 * length(uBrushColor.rgb))) * shapeMask.a * uBrushColor.a;

    vec2 grainUV = fract(((vUV - vec2(0.5)) * 500.0 + 0.5 * (uPosition + uLastPosition - (100.0 * (uPosition - uLastPosition)))) / 500.0);
    vec4 grain = texture2D(uGrainTexture, grainUV);

    vec3 color = uBrushColor.rgb + 0.1 * (vec3(0.5) - uBrushColor.rgb) * (1.0 - alpha);

    vec4 c = 0.8 * vec4(color.rgb * alpha, alpha) + 0.2 * grain * alpha;
    gl_FragColor = vec4(c.rgb, alpha);
}