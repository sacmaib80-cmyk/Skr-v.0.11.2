// เครื่องคิดเลข — เวอร์ชัน TypeScript
// compile:  tsc calculator.ts   (จะได้ calculator.js ที่ HTML โหลด)

type Operator = '+' | '-' | '*' | '/';

(function (): void {
  const displayEl = document.getElementById('display') as HTMLElement;
  const historyEl = document.getElementById('history') as HTMLElement;
  const keysEl = document.getElementById('keys') as HTMLElement;

  let current = '0';                      // ตัวเลขที่กำลังพิมพ์
  let previous: string | null = null;     // ตัวตั้งก่อนหน้า
  let operator: Operator | null = null;   // ตัวดำเนินการที่ค้างอยู่
  let resetNext = false;                  // กดเลขครั้งถัดไปให้เริ่มใหม่

  const OP_SYMBOL: Record<Operator, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  function isOperator(k: string): k is Operator {
    return k === '+' || k === '-' || k === '*' || k === '/';
  }

  function fmt(n: number): string {
    if (n === Infinity || n === -Infinity || isNaN(n)) return 'Error';
    // ตัดทศนิยมยาวเกิน แต่ไม่ทำให้จำนวนเต็มมีจุด
    return parseFloat(n.toPrecision(12)).toString();
  }

  function render(): void {
    displayEl.textContent = current.length > 14
      ? parseFloat(current).toExponential(6)
      : current;
    historyEl.textContent = previous !== null && operator !== null
      ? fmt(parseFloat(previous)) + ' ' + OP_SYMBOL[operator]
      : '';
  }

  function inputNum(d: string): void {
    if (current === 'Error') current = '0';
    if (resetNext) { current = '0'; resetNext = false; }
    if (d === '.') {
      if (current.includes('.')) return;
      current += '.';
    } else {
      current = current === '0' ? d : current + d;
    }
    render();
  }

  function compute(a: number, b: number, op: Operator): number {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
    }
  }

  function highlightOp(op: Operator | null): void {
    document.querySelectorAll<HTMLButtonElement>('.key.op').forEach((b) => {
      b.classList.toggle('active', b.dataset.op === op);
    });
  }

  function setOperator(op: Operator): void {
    if (current === 'Error') return;
    if (operator !== null && previous !== null && !resetNext) {
      // คำนวณต่อเนื่อง
      current = fmt(compute(parseFloat(previous), parseFloat(current), operator));
      previous = current;
    } else {
      previous = current;
    }
    operator = op;
    resetNext = true;
    render();
    highlightOp(op);
  }

  function equals(): void {
    if (operator === null || previous === null) return;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    const res = compute(a, b, operator);
    historyEl.textContent = fmt(a) + ' ' + OP_SYMBOL[operator] + ' ' + fmt(b) + ' =';
    current = fmt(res);
    previous = null;
    operator = null;
    resetNext = true;
    displayEl.textContent = current;
    highlightOp(null);
  }

  function clearAll(): void {
    current = '0';
    previous = null;
    operator = null;
    resetNext = false;
    render();
    highlightOp(null);
  }

  function toggleSign(): void {
    if (current === 'Error' || current === '0') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    render();
  }

  function percent(): void {
    if (current === 'Error') return;
    let val = parseFloat(current);
    // ถ้ามีตัวตั้ง ให้คิด % ของตัวตั้ง
    if (previous !== null && operator !== null) {
      val = parseFloat(previous) * val / 100;
    } else {
      val = val / 100;
    }
    current = fmt(val);
    resetNext = true;
    render();
  }

  keysEl.addEventListener('click', (e: MouseEvent) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const ds = b.dataset;
    if (ds.num !== undefined) {
      inputNum(ds.num);
    } else if (ds.op !== undefined && isOperator(ds.op)) {
      setOperator(ds.op);
    } else {
      switch (ds.action) {
        case 'equals': equals(); break;
        case 'clear': clearAll(); break;
        case 'sign': toggleSign(); break;
        case 'percent': percent(); break;
      }
    }
  });

  // รองรับคีย์บอร์ด
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) inputNum(k);
    else if (k === '.') inputNum('.');
    else if (isOperator(k)) setOperator(k);
    else if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); }
    else if (k === 'Escape') clearAll();
    else if (k === 'Backspace') {
      if (!resetNext && current !== 'Error') {
        current = current.length > 1 ? current.slice(0, -1) : '0';
        render();
      }
    } else if (k === '%') percent();
  });

  render();
})();
