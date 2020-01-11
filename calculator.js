let operation = "";
let actualNumber = "";

let symbol = null;
let comma = false;
let isSolved = false;

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
    actualNumber = "";
    comma = false;
}

function clearAll() {
    operation = "";
    actualNumber = "";
    symbol = null;
    comma = false;
    isSolved = false;
    result.value = "0";
}

//zwraca true gdy liczba otwartych nawiasów<=zamkniętych
function checkBrackets() {
    const numberOfOpenedBrackets = (operation + actualNumber).split("(").length - 1;
    const numberOfClosedBrackets = (operation + actualNumber).split(")").length - 1;
    const difference = numberOfOpenedBrackets - numberOfClosedBrackets;
    if (difference <= 0) return true;
    else return false;
}

function write(e) {
    const val = e.target.textContent;
    if (isSolved === true) clearAll();//kontynuacja działania po wyniku

    const lastSymb = actualNumber[actualNumber.length - 1];
    const isNotNumber = isNaN(lastSymb);

    //dodanie nawaisów, i ew znaku mnożenia
    function brackets(acN, val, symb = "") {
        operation += acN + symb + val
        clearNumber();
        result.value = operation;
    }

    if (val === "(") {
        if (actualNumber[actualNumber.length - 1] === ".") return;
        //dodanie znaku mnożenia, gdy przed, lub za nawiasem nie wybrano operatora
        if (!isNotNumber || operation[operation.length - 1] === ")") {
            brackets(actualNumber, val, "*")
            return
        }
        brackets(actualNumber, val);
        return
    }
    if (operation[operation.length - 1] === ")" && val !== ")" && val !== "(") {
        operation += "*";
        comma = false;
        result.value = operation;
    }
    //zamyknięcie nawiasu możliwe tylko w odpowiednich warunkach
    if (val === ")") {
        if (isNotNumber || lastSymb === "." || checkBrackets() === true || (operation + actualNumber)[(operation + actualNumber).length - 1] === "(") return;
        brackets(actualNumber, val)
        return;
    }

    //poprawne działanie przecinków
    if (!actualNumber && val !== ",") actualNumber = val;
    else if (val !== ",") actualNumber += val;
    else if (comma === false) {
        if (!actualNumber || actualNumber === "-" || actualNumber === "(" || actualNumber === "(-") actualNumber += "0.";
        else actualNumber += ".";
        comma = true;
    }
    result.value = operation + actualNumber;
}

function getSymbol(e) {
    symbol = e.target.textContent;
    comma = false;
    isSolved = false;

    //wpisywanie misusa jako pierwszego, lub po otwarciu nawiasu
    if (symbol === "-" && (operation[operation.length - 1] === "(" || operation === "") && actualNumber === "") {
        actualNumber = symbol;
        result.value = operation + actualNumber;
        return;
    }

    if (operation === "" && actualNumber !== "-" && actualNumber[actualNumber.length - 1] !== "." && actualNumber !== "(") operation = actualNumber; //pierwsza wpisywana liczba
    else if (actualNumber !== "(" && actualNumber[actualNumber.length - 1] !== "." && actualNumber !== "(-" && actualNumber !== "-") operation += actualNumber; //kolejne liczby

    if (symbol === "=") return count();

    const lastSymb = operation[operation.length - 1];
    const lastActualNumber = actualNumber[actualNumber.length - 1];

    if (operation === "" || operation === "-" || lastActualNumber === "-" || lastSymb === "(" || actualNumber === "(-" || lastActualNumber === ".") return;//blok po minusie
    else if (lastSymb === "+" || lastSymb === "-" || lastSymb === "/" || lastSymb === "*") {
        operation = operation.slice(0, operation.length - 1) + symbol;//możliwość zmiany znaku
    }
    else operation += symbol;//pierwszy wybór

    result.value = operation;
    actualNumber = "";
}

function count() {
    clearNumber();
    //usuwanie operatora na końcu, gdy nie wpisano liczby
    let lastSymb = operation[operation.length - 1];
    while (lastSymb === "+" || lastSymb === "-" || lastSymb === "/" || lastSymb === "*" || lastSymb === "(") {
        operation = operation.slice(0, operation.length - 1);
        lastSymb = operation[operation.length - 1];
    }

    //zamykanie niezamkniętych nawiasów
    while (checkBrackets() === false) operation += ')';

    //obliczanie
    try {
        operation = (operation === "") ? "0" : round(eval(operation), 14);
    }
    catch (e) {
        clearAll();
        result.value = "błąd";
        return;
    }
    //błąd dzielenia przez 0
    if ((operation === Infinity || operation === -Infinity)) {
        clearAll();
        result.value = "Nie dziel przez 0";
    }
    else result.value = operation;
    isSolved = true;
}

//Ograniczenie błędów podczas operacji na float
function round(n, k) {
    const factor = Math.pow(10, k);
    return Math.round(n * factor) / factor;
}


