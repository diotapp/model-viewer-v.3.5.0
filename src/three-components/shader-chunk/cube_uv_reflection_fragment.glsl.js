import {getFaceChunk, getUVChunk} from './common.glsl.js';

export const cubeUVChunk = /* glsl */ `
#ifdef ENVMAP_TYPE_CUBE_UV

const float cubeUV_maxMipLevel = 8.0;
const float cubeUV_minMipLevel = 3.0;
#define cubeUV_sizeY(maxMip) (4.0 * (maxMip + exp2(maxMip)) + 2.0)
const float cubeUV_margin = cubeUV_sizeY(cubeUV_minMipLevel - 1.0);

const vec2 cubeUV_texelSize =
  1.0 / vec2(3.0 * (exp2(cubeUV_maxMipLevel) + 2.0),
             cubeUV_sizeY(cubeUV_maxMipLevel) - cubeUV_margin);

${getFaceChunk}
${getUVChunk}

vec3 bilinearCubeUV(sampler2D envMap, vec3 direction, float mipInt) {
  int face = getFace(direction);
  float filterInt = max(cubeUV_minMipLevel - mipInt, 0.0);
  mipInt = max(mipInt, cubeUV_minMipLevel);
  float faceSize = exp2(mipInt);

  vec2 uv = getUV(direction, face) * faceSize;
  uv += 0.5;
  vec2 f = fract(uv);
  uv += 0.5 - f;
  if (face > 2) {
    uv.y += faceSize + 2.0;
    face -= 3;
  }
  uv.x += float(face) * (faceSize + 2.0);
  uv.y += cubeUV_sizeY(mipInt - 1.0) - cubeUV_margin;
  uv.x += filterInt * 3.0 * (exp2(cubeUV_minMipLevel) + 2.0);
  uv *= cubeUV_texelSize;
  uv.y = 1.0 - uv.y;

  vec3 tl = envMapTexelToLinear(texture2D(envMap, uv)).rgb;
  uv.x += cubeUV_texelSize.x;
  vec3 tr = envMapTexelToLinear(texture2D(envMap, uv)).rgb;
  uv.y -= cubeUV_texelSize.y;
  vec3 br = envMapTexelToLinear(texture2D(envMap, uv)).rgb;
  uv.x -= cubeUV_texelSize.x;
  vec3 bl = envMapTexelToLinear(texture2D(envMap, uv)).rgb;
  vec3 tm = mix(tl, tr, f.x);
  vec3 bm = mix(bl, br, f.x);
  return mix(tm, bm, f.y);
}

vec4 textureCubeUV(sampler2D envMap, vec3 sampleDir, float roughness) {	
  float filterMip = 0.0;
  if(roughness >= 0.7){
    filterMip = (1.0 - roughness) / (1.0 - 0.7) - 3.0;
  } else if(roughness >= 0.5){
    filterMip = (0.7 - roughness) / (0.7 - 0.5) - 2.0;
  } else if(roughness >= 0.32){
    filterMip = (0.5 - roughness) / (0.5 - 0.32) - 1.0;
  }

  roughness = min(roughness, 0.32);
  float sigma = PI * roughness * roughness / ( 1.0 + roughness );

  // Add anti-aliasing mipmap contribution
  vec3 dxy = max(abs(dFdx(sampleDir)), abs(dFdy(sampleDir)));
  sigma += max(max(dxy.x, dxy.y), dxy.z);

  float mip = clamp(-log2(sigma), cubeUV_minMipLevel, cubeUV_maxMipLevel) + filterMip;
  float mipF = fract(mip);
  float mipInt = floor(mip);

  vec3 color0 = bilinearCubeUV(envMap, sampleDir, mipInt);
  if (mipF == 0.0) {
    return vec4(color0, 1.0);
  } else {
    vec3 color1 = bilinearCubeUV(envMap, sampleDir, mipInt + 1.0);
    return vec4(mix(color0, color1, mipF), 1.0);
  }
}
#endif
`;
