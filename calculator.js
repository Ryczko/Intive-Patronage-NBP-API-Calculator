let startVal = "0";
let secondVal = "0";
let symbol = null;
let comma = false;
let isChoosen = false;

const result = document.querySelector('.result');
const container = document.querySelector('.container');

container.onclick = function (event) {
    const classes = event.target.classList;
    if (classes.contains("numbers")) write(event);
    else if (classes.contains("symbol")) getSymbol(event);
    else if (classes.contains("c")) clearAll();
    else if (classes.contains("ce")) clearNumber();
}

function clearNumber() {
    startVal = "0";
}

function clearAll() {
    startVal = "0";
    secondVal = "0";
    symbol = null;
    comma = false;
    isChoosen = false;
    result.value = startVal;
}

function write(e) {
    const val = e.target.textContent;

    if (startVal === "0" && val !== ",") startVal = val;
    else if (val !== ",") startVal += val;
    else if (comma === false) {
        startVal += ".";
        comma = true;
    }
    result.value = startVal;
    isChoosen = true;
}

function getSymbol(e) {
    if (isChoosen) {
        if (symbol !== "=" && symbol !== null) count(startVal, symbol, secondVal);
        secondVal = startVal;
        startVal = "0";
    };
    symbol = e.target.textContent;
    isChoosen = false;
    comma = false;
}

function count(sVal, symb, secVal) {
    startVal = round(eval(secVal + symb + sVal), 14);
    if (symb == "/" && (startVal === Infinity || startVal === -Infinity)) {
        clearAll();
        result.value = "Nie dziel przez 0";
    }
    else result.value = startVal;
}

//Pominięcie błędów podczas operacji na float
function round(n, k) {
    const factor = Math.pow(10, k);
    return Math.round(n * factor) / factor;
}


