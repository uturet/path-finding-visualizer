import React, {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {AlgorithInterface, BFSAlgorithm, Point} from './Algorithm';

type CellType = 'start'|'end'|'disabled'|'used'|'default'

const TIMEOUT = 10;
const cellSize = 48;
const colorType: { disabled: string; start: string; end: string; used: string; default: string; } = {
  disabled: 'bg-slate-400',
  start: 'bg-red-400',
  end: 'bg-green-400',
  used: 'bg-cyan-400',
  default: 'bg-yellow-400',
};
const cellTypes: CellType[] = ['start', 'end', 'disabled', 'used', 'default'];

function App() {
  const [algo, setAlgo] = useState<AlgorithInterface|null>(null);
  const [count, setCount] = useState<number>(1);
  const [started, setStarted] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [cellType, setCellType] = useState<CellType>('start');
  const [startPoint, setStartPoint] = useState<number>(0);
  const [endPoint, setEndPoint] = useState<number>(1);
  const [disabledCells, setDisabledCells] = useState<Set<number>>(new Set());
  const [usedCells, setUsedCells] = useState<Set<number>>(new Set());
  const fieldRef = useRef<HTMLDivElement>(null);

  const usePoint = useCallback((point: Point): boolean => {
    if (point[0] < 0 || point[0] >= width || point[1] < 0 || point[1] >= height) return false;
    const index = (point[1] * width) + point[0];
    if (disabledCells.has(index)) return false;
    setUsedCells((prev) => new Set(prev.add(index)));
    return true;
  }, [disabledCells, width, height]);

  useEffect(() => {
    if (!fieldRef.current) return;
    setWidth(Math.floor((fieldRef.current.offsetWidth / cellSize)));
    setHeight(Math.floor((fieldRef.current.offsetHeight / cellSize)));
    setAmount(Math.floor((fieldRef.current.offsetWidth / cellSize)) * (Math.floor(fieldRef.current.offsetHeight / cellSize)));
  }, [fieldRef]);

  const getCellType = useCallback((index: number): CellType => {
    if (disabledCells.has(index)) {
      return 'disabled';
    } else if (index === startPoint) {
      return 'start';
    } else if (index === endPoint) {
      return 'end';
    } else if (usedCells.has(index)) {
      return 'used';
    }
    return 'default';
  }, [disabledCells, usedCells, startPoint, endPoint]);

  const changeCellType = useCallback((index: number) => {
    const cellTypeDispatch = {
      'start': (index: number) => setStartPoint(index),
      'end': (index: number) => setEndPoint(index),
      'disabled': (index: number) => setDisabledCells((prev) => new Set(prev.add(index))),
      'used': (index: number) => setUsedCells((prev) => new Set(prev.add(index))),
    };
    const curType = getCellType(index);
    if (cellType == 'default' && curType == 'disabled') {
      disabledCells.delete(index);
      setDisabledCells(new Set(disabledCells));
    } else if ((curType == 'default' || curType == 'used') && cellType != 'default') {
      cellTypeDispatch[cellType](index);
    } else if (cellType == 'start' || cellType == 'end') {
      disabledCells.delete(index);
      setDisabledCells(new Set(disabledCells));
      cellTypeDispatch[cellType](index);
    }
  }, [disabledCells, usedCells, cellType, getCellType]);

  const cells = useMemo(() => {
    const cells = [];
    for (let i=0; i<amount; i++) {
      cells.push(<div
        key={i.toString()}
        onClick={() => changeCellType(i)}
        className={`w-10 h-10 m-1 rounded ${colorType[getCellType(i)]}`}/>);
    }
    return cells;
  }, [amount, changeCellType, getCellType]);

  const startSearch = () => {
    setAlgo(new BFSAlgorithm(
      width,
      height,
      startPoint,
      endPoint,
      usePoint,
    ));
    setCount(1);
    setUsedCells(new Set());
    setStarted(!started);
  };

  useEffect(() => {
    if (!started || !algo) return;
    const timeout = setTimeout(() => {
      setCount((prev) => prev+1);
    }, TIMEOUT);

    if (algo.nextStep(count)) {
      clearTimeout(timeout);
      setStarted(false);
    }
  }, [count, started]);

  return (
    <div className='w-screen h-screen flex flex-col overflow-hidden'>
      <div className='h=[30px] flex flex-row items-center justify-center'>
        {cellTypes.map((t) => {
          if (t == 'used') return null;
          return <div
            title={t}
            key={t}
            onClick={() => setCellType(t)}
            className={`w-10 h-10 m-1 rounded ${cellType == t && 'drop-shadow-md border-2'} border-slate-700 ${colorType[t]}`}/>;
        })}
        <div
          onClick={startSearch}
          className='h-10 m-1 rounded bg-cyan-400 px-3 text-white font-bold flex items-center hover:bg-cyan-600 pointer'>
          <span>{started? 'Stop': 'Start'}</span>
        </div>
        <div className='h-10 m-1 px-3 rounded font-bold flex items-center border'>
          <span>{count}</span>
        </div>
      </div>
      <div ref={fieldRef} className='flex-grow h-full flex flex-row flex-wrap p-3'>
        {cells}
      </div>
    </div>
  );
}

export default App;
