"use strict";
// ไฟล์นี้ compile มาจาก calculator.ts — อย่าแก้ตรงนี้ ให้แก้ที่ .ts แล้วรัน: tsc calculator.ts
(function () {
    const displayEl = document.getElementById('display');
    const historyEl = document.getElementById('history');
    const keysEl = document.getElementById('keys');
    let current = '0';
    let previous = null;
    let operator = null;
    let resetNext = false;
    const OP_SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    function isOperator(k) {
        return k === '+' || k === '-' || k === '*' || k === '/';
    }
    function fmt(n) {
        if (n === Infinity || n === -Infinity || isNaN(n))
            return 'Error';
        return parseFloat(n.toPrecision(12)).toString();
    }
    function render() {
        displayEl.textContent = current.length > 14
            ? parseFloat(current).toExponential(6)
            : current;
        historyEl.textContent = previous !== null && operator !== null
            ? fmt(parseFloat(previous)) + ' ' + OP_SYMBOL[operator]
            : '';
    }
    function inputNum(d) {
        if (current === 'Error')
            current = '0';
        if (resetNext) {
            current = '0';
            resetNext = false;
        }
        if (d === '.') {
            if (current.includes('.'))
                return;
            current += '.';
        }
        else {
            current = current === '0' ? d : current + d;
        }
        render();
    }
    function compute(a, b, op) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return b === 0 ? NaN : a / b;
        }
    }
    function highlightOp(op) {
        document.querySelectorAll('.key.op').forEach((b) => {
            b.classList.toggle('active', b.dataset.op === op);
        });
    }
    function setOperator(op) {
        if (current === 'Error')
            return;
        if (operator !== null && previous !== null && !resetNext) {
            current = fmt(compute(parseFloat(previous), parseFloat(current), operator));
            previous = current;
        }
        else {
            previous = current;
        }
        operator = op;
        resetNext = true;
        render();
        highlightOp(op);
    }
    function equals() {
        if (operator === null || previous === null)
            return;
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
    function clearAll() {
        current = '0';
        previous = null;
        operator = null;
        resetNext = false;
        render();
        highlightOp(null);
    }
    function toggleSign() {
        if (current === 'Error' || current === '0')
            return;
        current = current.startsWith('-') ? current.slice(1) : '-' + current;
        render();
    }
    function percent() {
        if (current === 'Error')
            return;
        let val = parseFloat(current);
        if (previous !== null && operator !== null) {
            val = parseFloat(previous) * val / 100;
        }
        else {
            val = val / 100;
        }
        current = fmt(val);
        resetNext = true;
        render();
    }
    keysEl.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b)
            return;
        const ds = b.dataset;
        if (ds.num !== undefined) {
            inputNum(ds.num);
        }
        else if (ds.op !== undefined && isOperator(ds.op)) {
            setOperator(ds.op);
        }
        else {
            switch (ds.action) {
                case 'equals': equals(); break;
                case 'clear': clearAll(); break;
                case 'sign': toggleSign(); break;
                case 'percent': percent(); break;
            }
        }
    });
    window.addEventListener('keydown', (e) => {
        const k = e.key;
        if (/^[0-9]$/.test(k))
            inputNum(k);
        else if (k === '.')
            inputNum('.');
        else if (isOperator(k))
            setOperator(k);
        else if (k === 'Enter' || k === '=') {
            e.preventDefault();
            equals();
        }
        else if (k === 'Escape')
            clearAll();
        else if (k === 'Backspace') {
            if (!resetNext && current !== 'Error') {
                current = current.length > 1 ? current.slice(0, -1) : '0';
                render();
            }
        }
        else if (k === '%')
            percent();
    });
    render();
})();
