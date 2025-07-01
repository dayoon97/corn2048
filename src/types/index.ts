// src/types/index.ts
export type TileData = {
  id: number;
  value: number;
  x: number; // 보드 상의 x 좌표 (0, 1, 2, 3)
  y: number; // 보드 상의 y 좌표 (0, 1, 2, 3)
  isNew?: boolean; // 새롭게 생성된 타일인지 여부 (애니메이션 용도)
  isMerged?: boolean; // 병합된 타일인지 여부 (애니메이션 용도)
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Board = number[][]; // 4x4 숫자 배열
