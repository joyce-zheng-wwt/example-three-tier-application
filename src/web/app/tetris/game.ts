// Pure Tetris rules. No React, no DOM — so this is unit-testable on its own.

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;

export type Shape = number[][];
export type Cell = string | null;
export type Grid = Cell[][];

export interface Piece {
  shape: Shape;
  x: number;
  y: number;
  color: string;
}

export interface GameState {
  grid: Grid;
  piece: Piece | null;
  score: number;
  gameOver: boolean;
}

// I, O, T, S, Z, J, L
export const SHAPES: Shape[] = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
];

export const COLORS = [
  '#06b6d4',
  '#eab308',
  '#8b5cf6',
  '#22c55e',
  '#ef4444',
  '#3b82f6',
  '#f97316',
];

export function emptyGrid(): Grid {
  return Array.from({ length: GRID_HEIGHT }, () =>
    Array<Cell>(GRID_WIDTH).fill(null),
  );
}

/** Rotate a shape 90° clockwise. */
export function rotate(shape: Shape): Shape {
  const rows = shape.length;
  const cols = shape[0].length;
  return Array.from({ length: cols }, (_, r) =>
    Array.from({ length: rows }, (_, c) => shape[rows - 1 - c][r]),
  );
}

export function collides(piece: Piece, grid: Grid): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const x = piece.x + c;
      const y = piece.y + r;
      if (x < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) return true;
      if (y >= 0 && grid[y][x]) return true;
    }
  }
  return false;
}

export function merge(piece: Piece, grid: Grid): Grid {
  const next = grid.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const x = piece.x + c;
      const y = piece.y + r;
      if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
        next[y][x] = piece.color;
      }
    }
  }
  return next;
}

export function clearLines(grid: Grid): { grid: Grid; cleared: number } {
  const kept = grid.filter((row) => row.some((cell) => cell === null));
  const cleared = GRID_HEIGHT - kept.length;
  const fresh = Array.from({ length: cleared }, () =>
    Array<Cell>(GRID_WIDTH).fill(null),
  );
  return { grid: [...fresh, ...kept], cleared };
}

export function spawn(randomIndex = Math.floor(Math.random() * SHAPES.length)): Piece {
  const shape = SHAPES[randomIndex];
  return {
    shape,
    x: Math.floor((GRID_WIDTH - shape[0].length) / 2),
    y: 0,
    color: COLORS[randomIndex],
  };
}

/** Points per simultaneous line clear. */
const LINE_SCORES = [0, 100, 300, 500, 800];

/**
 * Advance one gravity step: drop the piece, or lock it, clear lines and spawn
 * the next one. Pure, so the render loop can call it as a functional update and
 * never read stale state.
 */
export function tick(state: GameState, nextPiece: Piece = spawn()): GameState {
  if (state.gameOver || !state.piece) return state;

  const moved = { ...state.piece, y: state.piece.y + 1 };
  if (!collides(moved, state.grid)) {
    return { ...state, piece: moved };
  }

  const { grid, cleared } = clearLines(merge(state.piece, state.grid));
  const score = state.score + LINE_SCORES[cleared];

  if (collides(nextPiece, grid)) {
    return { grid, piece: null, score, gameOver: true };
  }
  return { grid, piece: nextPiece, score, gameOver: false };
}

/** Shift the active piece horizontally, ignoring blocked moves. */
export function move(state: GameState, dx: number): GameState {
  if (state.gameOver || !state.piece) return state;
  const moved = { ...state.piece, x: state.piece.x + dx };
  return collides(moved, state.grid) ? state : { ...state, piece: moved };
}

/**
 * Sideways nudges tried when a rotation does not fit, nearest first: 0, -1, +1,
 * -2, +2, -3, +3. The longest piece is 4 wide, so rotating it flush against a
 * wall can need a nudge of 3.
 */
const WALL_KICKS = [0, -1, 1, -2, 2, -3, 3];

/**
 * Rotate the active piece clockwise, nudging it sideways (a "wall kick") when
 * the rotated shape would overlap a wall or settled block. Returns the state
 * unchanged when no nudge fits.
 */
export function rotatePiece(state: GameState): GameState {
  if (state.gameOver || !state.piece) return state;
  const shape = rotate(state.piece.shape);
  for (const dx of WALL_KICKS) {
    const candidate = { ...state.piece, shape, x: state.piece.x + dx };
    if (!collides(candidate, state.grid)) {
      return { ...state, piece: candidate };
    }
  }
  return state;
}

/** Drop the piece as far as it will go, then lock it. */
export function hardDrop(state: GameState, nextPiece: Piece = spawn()): GameState {
  if (state.gameOver || !state.piece) return state;
  let piece = state.piece;
  while (!collides({ ...piece, y: piece.y + 1 }, state.grid)) {
    piece = { ...piece, y: piece.y + 1 };
  }
  return tick({ ...state, piece }, nextPiece);
}

export function newGame(): GameState {
  return { grid: emptyGrid(), piece: spawn(), score: 0, gameOver: false };
}

/** Grid with the active piece painted in, for rendering. */
export function withPiece(state: GameState): Grid {
  return state.piece ? merge(state.piece, state.grid) : state.grid;
}
