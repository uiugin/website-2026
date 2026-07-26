/**
 * Planet maps — Earth/Moon from Three.js examples; others from threex.
 */
const THREE_PLANETS =
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets';
const THREEX =
  'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images';

export const PLANET_TEXTURE_URLS = {
  sun: `${THREEX}/sunmap.jpg`,
  mercury: `${THREEX}/mercurymap.jpg`,
  mercuryBump: `${THREEX}/mercurybump.jpg`,
  venus: `${THREEX}/venusmap.jpg`,
  venusBump: `${THREEX}/venusbump.jpg`,
  earth: `${THREE_PLANETS}/earth_atmos_2048.jpg`,
  earthNormal: `${THREE_PLANETS}/earth_normal_2048.jpg`,
  earthSpecular: `${THREE_PLANETS}/earth_specular_2048.jpg`,
  earthClouds: `${THREE_PLANETS}/earth_clouds_1024.png`,
  earthNight: `${THREE_PLANETS}/earth_lights_2048.png`,
  moon: `${THREE_PLANETS}/moon_1024.jpg`,
  moonBump: `${THREEX}/moonbump1k.jpg`,
  mars: `${THREEX}/marsmap1k.jpg`,
  marsBump: `${THREEX}/marsbump1k.jpg`,
  jupiter: `${THREEX}/jupitermap.jpg`,
  saturn: `${THREEX}/saturnmap.jpg`,
  saturnRing: `${THREEX}/saturnringcolor.jpg`,
  saturnRingAlpha: `${THREEX}/saturnringpattern.gif`,
  asteroid: `${THREE_PLANETS}/moon_1024.jpg`,
} as const;
