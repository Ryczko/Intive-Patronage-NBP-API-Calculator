let startVal = 0;
let secondVal = 0;
let symbol = null;
let comma = false;
let isChoosen = false;

const numbers = document.querySelectorAll('.numbers');
const result = document.querySelector('.result');
const symbols = document.querySelectorAll('.symbol');
const c = document.querySelector('.c');
const ce = document.querySelector('.ce');

symbols.forEach(el => {
    el.addEventListener('click', getSymbol);
})

numbers.forEach(el => {
    el.addEventListener('click', write);
})

c.addEventListener('click', clearAll);
ce.addEventListener('click', clearNumber);


function clearNumber() {
    startVal = 0;
    result.value = startVal;
}

function clearAll() {
    startVal = 0;
    secondVal = 0;
    symbol = null;
    comma = false;
    isChoosen = false;
    result.value = startVal;
}

function write(e) {
    const val = e.target.textContent;

    if (startVal == "0" && val != ",") {
        startVal = val;
    }
    else if (val != ",") {
        startVal += val;
    }
    else {
        if (comma == false) {
            startVal += ".";
            comma = true;
        }
    }
    result.value = startVal;
    isChoosen = true;
}

function getSymbol(e) {
    if (isChoosen) {
        if (symbol != "=" && symbol != null) count(startVal, symbol, secondVal);
        secondVal = startVal;
        startVal = 0;
    };
    symbol = e.target.textContent;
    isChoosen = false;
    comma = false;

}

function count(sVal, symb, secVal) {

    if (symb == "/" && sVal == "0") result.value = "Nie dziel przez 0";
    else {
        startVal = round(eval(secVal + symb + sVal), 14);
        result.value = startVal;
    }
}

//Pominięcie błędów podczas operacji na float
function round(n, k) {
    const factor = Math.pow(10, k);
    return Math.round(n * factor) / factor;
}


