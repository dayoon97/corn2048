import { Dimensions } from 'react-native';
// import type { VegetableInfo } from '../types';

export const BOARD_SIZE = 4;
export const CELL_SIZE = Math.floor(Dimensions.get('window').width * 0.2);
export const CELL_MARGIN = Math.floor(CELL_SIZE * 0.1);
export const BOARD_DIMENSION =
  CELL_SIZE * BOARD_SIZE + CELL_MARGIN * (BOARD_SIZE + 1);


export const TILE_STYLES: Record<number, { emoji: string; color: string }> = {
  2: { emoji: '🌱', color: '#e5f8e0' },
  4: { emoji: '🪴', color: '#c3e6cb' },
  8: { emoji: '🌿', color: '#a9d6b4' },
  16: { emoji: '🍀', color: '#8bc6a6' },
  32: { emoji: '🌼', color: '#6da893' },
  64: { emoji: '🌸', color: '#5e927e' },
  128: { emoji: '🍓', color: '#4b7a65' },
  256: { emoji: '🍎', color: '#3d664f' },
  512: { emoji: '🧺', color: '#31523f' },
  1024: { emoji: '🪴✨', color: '#294532' },
  2048: { emoji: '🌳🏡', color: '#1e3424' },
};
