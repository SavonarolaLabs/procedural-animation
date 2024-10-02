// Configuration file

export const MAP_SIZE = 16000; // Dota 2-like map size
export const HERO_SIZE = 100; // Hero size in Dota 2 units
export const TEXTURE_REPEAT = 10; // How many times the texture is repeated over ground
export const AMBIENT_LIGHT_INTENSITY = 0.6;
export const DIRECTIONAL_LIGHT_INTENSITY = 0.8;
export const DIRECTIONAL_LIGHT_POSITION = { x: 10, y: 20, z: 10 }; // Initial position
export const CAMERA_LIGHT_OFFSET = { x: 10, y: 10, z: 10 }; // Offset behind the camera
export const SHADOW_MAP_SIZE = 2048; // Resolution of shadow map

// Movement and camera controls
export const MOVE_SPEED_PERCENTAGE = 0.001; // Speed relative to map size
export const ZOOM_SPEED_PERCENTAGE = 0.005; // Zoom speed relative to map size
export const HERO_STARTING_POSITION = { x: 0, y: 0, z: 2 }; // Starting position of the hero

// Camera defaults, with offsets relative to HERO_STARTING_POSITION
export const CAMERA_OFFSET = { x: -MAP_SIZE * 0.015, y: MAP_SIZE * 0.025, z: -MAP_SIZE * 0.015 };
export const CAMERA_DEFAULT_TARGET = { x: HERO_STARTING_POSITION.x, y: HERO_SIZE * 0.05, z: HERO_STARTING_POSITION.z };

// Scale multiplier for bot models (1 = 100% of HERO_SIZE)
export const HERO_SCALE = { x: 1, y: 1, z: 1 };
export const HERO_MOVE_SPEED = 0.7; // Speed of hero movement per frame
export const HERO_ROTATION_SPEED = 0.05; // Speed of hero rotation
