// Шкала ленты времени на тетрадном листе в клетку.
//
// Лента честная, линейная: между соседними клетками всегда одно и то же
// число лет. Исключение одно — первобытность в 5 классе. Два миллиона лет
// в масштабе «клетка — сто лет» заняли бы двадцать тысяч клеток, поэтому
// она стоит слева отдельной сжатой зоной.
//
// Настройки у каждого класса свои (js/data/class-N/timeline.js):
//   startYear, endYear — края ленты, минус значит «до нашей эры»;
//   yearsPerCell       — сколько лет в одной клетке;
//   tickYears          — годы, подписанные на оси;
//   prehistoryCells    — ширина зоны первобытности в клетках, 0 — зоны нет.

export const getTotalCells = ({ startYear, endYear, yearsPerCell, prehistoryCells }) =>
  prehistoryCells + (endYear - startYear) / yearsPerCell;

export const createScale = ({ startYear, yearsPerCell, prehistoryCells }, cellSize, prehistoricCount) => ({
  yearToX: (year) => (prehistoryCells + (year - startYear) / yearsPerCell) * cellSize,

  // Первобытные события расставлены просто по порядку, на равных
  // расстояниях. Последнюю клетку зоны оставляем пустой под знак разрыва
  prehistoricToX: (index) =>
    ((index + 1) / (prehistoricCount + 1)) * (prehistoryCells - 1) * cellSize,
});

// Раскладывает метки по рядам, чтобы соседние по времени не слиплись:
// каждая встаёт в самый нижний ряд, где после предыдущей метки есть зазор.
// spans — отрезки { left, right } в пикселях, по возрастанию left
export const stackRows = (spans, gap) => {
  const rowEnds = [];

  return spans.map(({ left, right }) => {
    const freeRow = rowEnds.findIndex((end) => left - end >= gap);
    const row = freeRow === -1 ? rowEnds.length : freeRow;

    rowEnds[row] = right;

    return row;
  });
};
