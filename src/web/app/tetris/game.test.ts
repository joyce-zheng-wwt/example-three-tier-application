import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  SHAPES,
  clearLines,
  collides,
  emptyGrid,
  hardDrop,
  merge,
  move,
  newGame,
  rotate,
  rotatePiece,
  spawn,
  tick,
  type Grid,
} from './game.ts';

const T = SHAPES[2];
const empty = (grid: Grid) => grid.every((row) => row.every((c) => c === null));

test('rotate turns a shape 90deg clockwise', () => {
  assert.deepEqual(rotate([[1, 1, 1, 1]]), [[1], [1], [1], [1]]);
  assert.deepEqual(rotate(T), [
    [1, 0],
    [1, 1],
    [1, 0],
  ]);
});

test('rotating four times returns every shape to its original', () => {
  for (const shape of SHAPES) {
    assert.deepEqual(rotate(rotate(rotate(rotate(shape)))), shape);
  }
});

test('rotatePiece changes orientation in open space', () => {
  const state = {
    grid: emptyGrid(),
    piece: { shape: T, x: 4, y: 5, color: 'c' },
    score: 0,
    gameOver: false,
  };
  assert.deepEqual(rotatePiece(state).piece!.shape, rotate(T));
});

test('rotatePiece wall-kicks off the right wall instead of leaving the grid', () => {
  // A vertical I flush against the right edge becomes 4 wide when rotated, so
  // it only fits if it is nudged 3 columns left.
  const piece = { shape: rotate([[1, 1, 1, 1]]), x: GRID_WIDTH - 1, y: 0, color: 'c' };
  const out = rotatePiece({ grid: emptyGrid(), piece, score: 0, gameOver: false });

  assert.deepEqual(out.piece!.shape, [[1, 1, 1, 1]], 'did rotate');
  assert.equal(out.piece!.x, GRID_WIDTH - 4, 'kicked left to fit');
  assert.equal(collides(out.piece!, emptyGrid()), false);
});

test('rotatePiece is a no-op when there is no room to kick into', () => {
  // A horizontal I in a 1-tall slot: rotating needs 4 rows of height and every
  // sideways nudge is walled in, so no candidate placement fits.
  const grid = emptyGrid();
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      // Leave exactly the 4 cells the flat piece occupies free.
      if (y !== 5 || x < 3 || x > 6) grid[y][x] = 'wall';
    }
  }
  const state = {
    grid,
    piece: { shape: [[1, 1, 1, 1]], x: 3, y: 5, color: 'c' },
    score: 0,
    gameOver: false,
  };
  assert.equal(collides(state.piece, grid), false, 'the piece fits where it is');
  assert.equal(rotatePiece(state), state, 'same state returned');
});

test('collides detects the floor, both walls and settled blocks', () => {
  const grid = emptyGrid();
  assert.equal(collides({ shape: [[1]], x: 0, y: GRID_HEIGHT, color: 'c' }, grid), true);
  assert.equal(collides({ shape: [[1]], x: -1, y: 0, color: 'c' }, grid), true);
  assert.equal(collides({ shape: [[1]], x: GRID_WIDTH, y: 0, color: 'c' }, grid), true);

  grid[5][5] = 'x';
  assert.equal(collides({ shape: [[1]], x: 5, y: 5, color: 'c' }, grid), true);
  assert.equal(collides({ shape: [[1]], x: 4, y: 5, color: 'c' }, grid), false);
});

test('move respects the walls', () => {
  const state = {
    grid: emptyGrid(),
    piece: { shape: [[1]], x: 0, y: 0, color: 'c' },
    score: 0,
    gameOver: false,
  };
  assert.equal(move(state, -1).piece!.x, 0, 'blocked at the left wall');
  assert.equal(move(state, 1).piece!.x, 1);
});

test('clearLines removes a full row and drops the stack above it', () => {
  const grid = emptyGrid();
  grid[GRID_HEIGHT - 1] = Array(GRID_WIDTH).fill('full');
  grid[GRID_HEIGHT - 2][0] = 'keep';

  const out = clearLines(grid);
  assert.equal(out.cleared, 1);
  assert.equal(out.grid.length, GRID_HEIGHT, 'height preserved');
  assert.equal(out.grid[GRID_HEIGHT - 1][0], 'keep', 'stack fell by one');
  assert.equal(out.grid[GRID_HEIGHT - 1][1], null);
});

test('clearLines handles four rows at once', () => {
  const grid = emptyGrid();
  for (let y = GRID_HEIGHT - 4; y < GRID_HEIGHT; y++) {
    grid[y] = Array(GRID_WIDTH).fill('f');
  }
  const out = clearLines(grid);
  assert.equal(out.cleared, 4);
  assert.ok(empty(out.grid), 'board emptied');
});

test('clearLines leaves an incomplete row alone', () => {
  const grid = emptyGrid();
  grid[GRID_HEIGHT - 1] = Array(GRID_WIDTH).fill('f');
  grid[GRID_HEIGHT - 1][4] = null;

  const out = clearLines(grid);
  assert.equal(out.cleared, 0);
  assert.deepEqual(out.grid, grid);
});

test('tick drops the active piece one row', () => {
  const state = newGame();
  assert.equal(tick(state).piece!.y, state.piece!.y + 1);
});

test('tick locks a piece that reaches the floor and activates the next', () => {
  const piece = { shape: [[1]], x: 0, y: GRID_HEIGHT - 1, color: 'red' };
  const next = { shape: [[1]], x: 5, y: 0, color: 'blue' };
  const out = tick({ grid: emptyGrid(), piece, score: 0, gameOver: false }, next);

  assert.equal(out.grid[GRID_HEIGHT - 1][0], 'red', 'locked into the grid');
  assert.equal(out.piece!.color, 'blue', 'next piece is active');
});

test('tick scores a line completed by the locking piece', () => {
  const grid = emptyGrid();
  grid[GRID_HEIGHT - 1] = Array(GRID_WIDTH).fill('f');
  grid[GRID_HEIGHT - 1][0] = null;

  const piece = { shape: [[1]], x: 0, y: GRID_HEIGHT - 1, color: 'red' };
  const out = tick({ grid, piece, score: 0, gameOver: false });

  assert.equal(out.score, 100);
  assert.ok(empty(out.grid), 'the completed row was cleared');
});

test('the game ends when the next piece cannot spawn', () => {
  // The top row is full except for one cell, so it is not cleared and still
  // blocks the spawn position.
  const grid = emptyGrid();
  grid[0] = Array(GRID_WIDTH).fill('f');
  grid[0][GRID_WIDTH - 1] = null;

  const piece = { shape: [[1]], x: 0, y: GRID_HEIGHT - 1, color: 'red' };
  const out = tick(
    { grid, piece, score: 0, gameOver: false },
    { shape: [[1]], x: 0, y: 0, color: 'b' },
  );

  assert.equal(out.gameOver, true);
  assert.equal(out.piece, null);
});

test('a finished game ignores further input', () => {
  const over = { grid: emptyGrid(), piece: null, score: 7, gameOver: true };
  assert.equal(tick(over), over);
  assert.equal(move(over, 1), over);
  assert.equal(rotatePiece(over), over);
  assert.equal(hardDrop(over), over);
});

test('hardDrop lands the piece on the floor', () => {
  const state = {
    grid: emptyGrid(),
    piece: { shape: [[1]], x: 3, y: 0, color: 'red' },
    score: 0,
    gameOver: false,
  };
  const out = hardDrop(state, { shape: [[1]], x: 5, y: 0, color: 'b' });
  assert.equal(out.grid[GRID_HEIGHT - 1][3], 'red');
});

test('hardDrop rests on top of settled blocks', () => {
  const grid = emptyGrid();
  grid[GRID_HEIGHT - 1][3] = 'old';
  const state = {
    grid,
    piece: { shape: [[1]], x: 3, y: 0, color: 'red' },
    score: 0,
    gameOver: false,
  };
  const out = hardDrop(state, { shape: [[1]], x: 5, y: 0, color: 'b' });

  assert.equal(out.grid[GRID_HEIGHT - 2][3], 'red', 'stacked on the old block');
  assert.equal(out.grid[GRID_HEIGHT - 1][3], 'old');
});

test('every shape spawns inside the grid', () => {
  for (let i = 0; i < SHAPES.length; i++) {
    assert.equal(collides(spawn(i), emptyGrid()), false, `shape ${i} spawns clear`);
  }
});

test('merge does not mutate the grid it is given', () => {
  const grid = emptyGrid();
  merge({ shape: [[1]], x: 0, y: 0, color: 'c' }, grid);
  assert.equal(grid[0][0], null);
});
