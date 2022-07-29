import React, {useState, useMemo, useRef, useEffect} from 'react';

type CellType = 'start'|'end'|'disabled'|'used'|'default'

const cellSize = 44;
const colorType: { disabled: string; start: string; end: string; used: string; default: string; } = {
  disabled: 'bg-slate-400',
  start: 'bg-red-400',
  end: 'bg-green-400',
  used: 'bg-cyan-400',
  default: 'bg-yellow-400',
};
const cellTypes: CellType[] = ['start', 'end', 'disabled', 'used', 'default'];
function App() {
  const [amount, setAmount] = useState<number>(0);
  const [cellType, setCellType] = useState<CellType>('start');
  const [startPoint, setStartPoint] = useState<number>(0);
  const [endPoint, setEndPoint] = useState<number>(1);
  const [disabledCells, setDisabledCells] = useState<Set<number>>(new Set());
  const [usedCells, setUsedCells] = useState<Set<number>>(new Set());
  const fieldRef = useRef<HTMLDivElement>(null);
  const cellTypeDispatch = {
    'start': (index: number) => setStartPoint(index),
    'end': (index: number) => setEndPoint(index),
    'disabled': (index: number) => setDisabledCells(new Set(disabledCells.add(index))),
    'used': (index: number) => setUsedCells(new Set(usedCells.add(index))),
  };
  const getCellType = (index: number): CellType => {
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
  };

  const changeCellType = (index: number) => {
    const curType = getCellType(index);
    if (curType == 'default' && cellType != 'default') {
      cellTypeDispatch[cellType](index);
    }
  };
  const cells = useMemo(() => {
    const cells = [];
    for (let i=0; i<amount; i++) {
      cells.push(<div
        key={i.toString()}
        onClick={() => changeCellType(i)}
        className={`w-10 h-10 m-1 rounded ${colorType[getCellType(i)]}`}/>);
    }
    return cells;
  }, [amount, startPoint, endPoint, disabledCells, usedCells, changeCellType, getCellType]);


  useEffect(() => {
    if (!fieldRef.current) return;
    setAmount(Math.floor((fieldRef.current.offsetWidth / cellSize)-2) * (Math.floor(fieldRef.current.offsetHeight / cellSize)-2));
  }, [fieldRef]);

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
      </div>
      <div ref={fieldRef} className='flex-grow h-full flex flex-row flex-wrap p-3'>
        {cells}
      </div>
    </div>

  );
}

export default App;
