import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  GestureDetector,
  Gesture,
  Directions,
} from 'react-native-gesture-handler';
import {
  runOnJS,
  useSharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';
import Tile from './src/components/Tile';
import {
  BOARD_SIZE,
  BOARD_DIMENSION,
  CELL_SIZE,
  CELL_MARGIN,
} from './src/constants';
import type { Direction, TileData } from './src/types';
import {
  createEmptyBoard,
  rotateBoard,
  checkIfGameCanMove,
} from './src/util/gameLogic';

let tileIdCounter = 1;

const addRandomTile = (currentTiles: TileData[]): TileData[] => {
  const emptyCells: { x: number; y: number }[] = [];
  const board = createEmptyBoard();

  currentTiles.forEach(tile => {
    board[tile.y][tile.x] = tile.value;
  });

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) emptyCells.push({ x, y });
    }
  }

  if (emptyCells.length > 0) {
    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newTile: TileData = {
      id: tileIdCounter++,
      value: Math.random() < 0.9 ? 2 : 4,
      x,
      y,
      isNew: true,
    };
    return [...currentTiles, newTile];
  }
  return currentTiles;
};

const App = () => {
  const tiles = useSharedValue<TileData[]>([]);
  const [renderTiles, setRenderTiles] = useState<TileData[]>([]);
  const [score, setScore] = useState<number>(0);
  const isGameOver = useSharedValue<boolean>(false);
  const [isGameOverState, setIsGameOverState] = useState(false);

  useAnimatedReaction(
    () => isGameOver.value,
    value => {
      runOnJS(setIsGameOverState)(value);
    },
  );

  useAnimatedReaction(
    () => tiles.value,
    value => {
      runOnJS(setRenderTiles)(value);
    },
    [],
  );

  const initGame = useCallback((): void => {
    tileIdCounter = 1;
    const initialTiles = addRandomTile(addRandomTile([]));
    tiles.value = initialTiles;
    setScore(0);
    isGameOver.value = false;
    setIsGameOverState(false); // 이 줄 추가!
  }, [isGameOver, tiles]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const checkAndHandleGameOver = useCallback(
    (currentTiles: TileData[]): void => {
      const board = createEmptyBoard();
      currentTiles.forEach(tile => {
        board[tile.y][tile.x] = tile.value;
      });

      const canMove = checkIfGameCanMove(board);
      const emptyCellsCount = board.flat().filter(cell => cell === 0).length;

      if (!canMove && emptyCellsCount === 0) {
        isGameOver.value = true;
        Alert.alert('Game Over!', `Your score: ${score}\nTry again?`, [
          { text: 'New Game', onPress: initGame },
        ]);
      }
      const has2048Tile = currentTiles.some(tile => tile.value === 32768);
      if (has2048Tile) {
        isGameOver.value = true;
        Alert.alert('🎉 You Win!', `You made 2048!\nScore: ${score}`, [
          { text: 'Play Again', onPress: initGame },
        ]);
        return; // 2048 도달 시 더 이상 진행 안 함
      }
    },
    [isGameOver, score, initGame],
  );

  const move = useCallback(
    (direction: Direction): void => {
      if (isGameOver.value) return;

      let board = createEmptyBoard();
      tiles.value.forEach(t => {
        board[t.y][t.x] = t.value;
      });
      const originalBoard = JSON.stringify(board);

      let rotations = 0;
      if (direction === 'UP') rotations = 1;
      if (direction === 'RIGHT') rotations = 2;
      if (direction === 'DOWN') rotations = 3;
      for (let i = 0; i < rotations; i++) board = rotateBoard(board);

      let scoreToAdd = 0;
      for (let y = 0; y < BOARD_SIZE; y++) {
        const row = board[y].filter(val => val !== 0);
        for (let i = 0; i < row.length - 1; i++) {
          if (row[i] === row[i + 1]) {
            const mergedValue = row[i] * 2;
            scoreToAdd += mergedValue;
            row[i] = mergedValue;
            row.splice(i + 1, 1);
          }
        }
        const newRow = Array(BOARD_SIZE).fill(0);
        row.forEach((val, idx) => (newRow[idx] = val));
        board[y] = newRow;
      }

      for (let i = 0; i < (4 - rotations) % 4; i++) board = rotateBoard(board);

      if (JSON.stringify(board) !== originalBoard) {
        const newTiles: TileData[] = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
          for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== 0) {
              newTiles.push({ id: tileIdCounter++, value: board[y][x], x, y });
            }
          }
        }
        setScore(s => s + scoreToAdd);
        tiles.value = addRandomTile(newTiles);
        checkAndHandleGameOver(tiles.value);
      }
    },
    [tiles, isGameOver, checkAndHandleGameOver],
  );

  const leftGesture = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => runOnJS(move)('LEFT'))
    .enabled(!isGameOverState); // ← 수정됨

  const rightGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => runOnJS(move)('RIGHT'))
    .enabled(!isGameOverState);

  const upGesture = Gesture.Fling()
    .direction(Directions.UP)
    .onEnd(() => runOnJS(move)('DOWN'))
    .enabled(!isGameOverState);

  const downGesture = Gesture.Fling()
    .direction(Directions.DOWN)
    .onEnd(() => runOnJS(move)('UP'))
    .enabled(!isGameOverState);

  const gesture = Gesture.Race(
    leftGesture,
    rightGesture,
    upGesture,
    downGesture,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Veggie 2048</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>🌽 점수</Text>
          <Text style={styles.score}>{score}</Text>
        </View>
      </View>

      <GestureDetector gesture={gesture}>
        <View style={styles.board}>
          {Array(BOARD_SIZE * BOARD_SIZE)
            .fill(0)
            .map((_, i) => (
              <View
                key={i}
                style={[
                  styles.cell,
                  {
                    left:
                      (i % BOARD_SIZE) * (CELL_SIZE + CELL_MARGIN) +
                      CELL_MARGIN,
                    top:
                      Math.floor(i / BOARD_SIZE) * (CELL_SIZE + CELL_MARGIN) +
                      CELL_MARGIN,
                  },
                ]}
              />
            ))}
          {renderTiles.map(tile => (
            <Tile key={tile.id} tile={tile} />
          ))}
        </View>
      </GestureDetector>

      <TouchableOpacity style={styles.resetButton} onPress={initGame}>
        <Text style={styles.resetButtonText}>New Game</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8f4', // 연한 민트빛 배경
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: BOARD_DIMENSION,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4e944f', // 짙은 초록 텍스트
  },
  scoreContainer: {
    backgroundColor: '#a5d6a7', // 연녹색
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  scoreTitle: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  board: {
    width: BOARD_DIMENSION,
    height: BOARD_DIMENSION,
    backgroundColor: '#c8e6c9', // 잔디 초록색
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  cell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: 'rgba(200, 230, 200, 0.4)', // 연한 연초록 배경
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: '#a5d6a7', // 짙은 연두 테두리
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },

  resetButton: {
    marginTop: 30,
    backgroundColor: '#81c784', // 녹색 버튼
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
