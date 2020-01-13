let operation = "";
let actualNumber = "";

let symbol = null;
let comma = false;
let isSolved = false;

let special = false;
let root = false;

let stringToView = "";

const result = document.querySelector('.result');
const operationWindow = document.querySelector('.operationWindow');
const container = document.querySelector('.container');

container.onclick = function (event) {
    const classes = event.target.classList;
    if (classes.contains("numbers")) write(event);
    else if (classes.contains("symbol")) getSymbol(event);
    else if (classes.contains("c")) clearAll();
    else if (classes.contains("ce")) clearNumber();
}

function clearNumber() {
    //brak możliwości zmiany stopnie pierwiastka
    if (root) return;
    const len = actualNumber.length;
    stringToView = stringToView.slice(0, ((stringToView.length) - len));
    //zmiana wykładnika
    if (special && actualNumber !== "") {
        //11*len- długość tagu <sup>n</sup>
        stringToView = stringToView.slice(0, ((stringToView.length) - 11 * len))
    }
    actualNumber = "";
    comma = false;
}

function clearAll() {
    operation = "";
    actualNumber = "";
    symbol = null;
    comma = false;
    isSolved = false;
    special = false;
    root = false;
    result.value = "";
    stringToView = "";
    operationWindow.innerHTML = stringToView;
}

//zwraca true gdy liczba otwartych nawiasów<=zamkniętych
function checkBrackets() {
    const numberOfOpenedBrackets = (stringToView + actualNumber).split("(").length - 1;
    const numberOfClosedBrackets = (stringToView + actualNumber).split(")").length - 1;
    const difference = numberOfOpenedBrackets - numberOfClosedBrackets;
    if (difference <= 0) return true;
    else return false;
}

function write(e) {
    let val = e.target.textContent;
    if (isSolved === true) clearAll();//kontynuacja działania po wyniku

    const lastSymb = actualNumber[actualNumber.length - 1];
    const isNotNumber = isNaN(lastSymb);

    //wpisanie stopnie pierwiastka
    if (root || special) {
        if (val === ")" || val === "(") {

            if (val === ")" && checkBrackets() === true) return;
            if (val === "(") val = "*" + val;
            if (root) {
                if (!actualNumber) actualNumber = "2";
                operation += `1/${actualNumber})${val}`;
            }
            else if (special) {
                if (!actualNumber) actualNumber = "1";
                operation += `${actualNumber})${val}`;
            }
            stringToView += val;
            operationWindow.innerHTML = stringToView;
            clearNumber();
            special = false;
            root = false;
            return;
        }

        if (!isNaN(val) || (val === ",")) {
            if (!actualNumber && val !== ",") actualNumber = val;
            else if (val !== ",") actualNumber += val;
            else if (comma) return;
            else if (comma === false) {
                if (!actualNumber || actualNumber === "-" || actualNumber === "(" || actualNumber === "(-") actualNumber += "0.";
                else actualNumber += ".";
                comma = true;
            }
            if (special && !root) {
                stringToView += actualNumber[actualNumber.length - 1].sup();
                operationWindow.innerHTML = stringToView;
                return;
            }
        }
        if (root) {
            const rootIndex = stringToView.lastIndexOf("√");
            stringToView = stringToView.slice(0, rootIndex) + actualNumber[actualNumber.length - 1].sup() + stringToView.slice(rootIndex);
            operationWindow.innerHTML = stringToView
            return;
        }
    }

    //dodanie nawaisów, i ew znaku mnożenia
    function brackets(acN, val, symb = "") {
        operation += acN + symb + val
        clearNumber();
        stringToView += acN + symb + val
        operationWindow.innerHTML = stringToView;
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
        stringToView += "*"
        operationWindow.innerHTML = stringToView;
    }
    //zamyknięcie nawiasu możliwe tylko w odpowiednich warunkach
    if (val === ")") {
        if ((isNotNumber && actualNumber !== "") || (actualNumber === "" && operation[operation.length - 1] !== ")") || lastSymb === "." || checkBrackets() === true || (operation + actualNumber)[(operation + actualNumber).length - 1] === "(") return;
        brackets(actualNumber, val)
        return;
    }

    //poprawne działanie przecinków
    if (!actualNumber && val !== ",") {
        actualNumber = val;
        stringToView += val
    }
    else if (val !== ",") {
        actualNumber += val;
        stringToView += actualNumber[actualNumber.length - 1];
    }
    else if (comma === false) {
        if (!actualNumber || actualNumber === "-" || actualNumber === "(" || actualNumber === "(-") {
            actualNumber += "0.";
            stringToView += "0."
        }
        else {
            actualNumber += ".";
            stringToView += "."
        }
        comma = true;
    }
    operationWindow.innerHTML = stringToView;
}

function getSymbol(e) {
    symbol = e.target.textContent;
    comma = false;
    const powerAndRoot = e.target.dataset.special;

    if (isSolved) {
        stringToView = actualNumber;
        operationWindow.innerHTML = stringToView;
        result.value = "";
        isSolved = false;
    }

    //opcja pierwiastkowania i potęgowania wcześniej wpisanej wartości
    if (powerAndRoot === "root" || powerAndRoot === "power") {
        if (special === true || root === true || actualNumber === "" || !isNaN(operation[operation.length - 1])) return;
        operation += `Math.pow(${actualNumber},`;
        if (powerAndRoot === "root") {
            stringToView = stringToView.slice(0, stringToView.length - actualNumber.length)
            stringToView += "√" + actualNumber;
            operationWindow.innerHTML = stringToView;
            root = true;
        }
        special = true;
        actualNumber = "";
        return;
    }


    //koniec pisania stopnia pierwiastka
    if (root) {
        if (actualNumber === "") actualNumber = "2";
        operation += `1/${actualNumber})`;
        actualNumber = "";
        special = false;
        root = false;
    }

    //koniec pisania wykładnika
    if (special) {
        if (actualNumber === "") actualNumber = "1";
        operation += actualNumber + ")";
        actualNumber = "";
        special = false;
    }

    //wpisywanie misusa jako pierwszego, lub po otwarciu nawiasu
    if (symbol === "-" && (operation[operation.length - 1] === "(" || operation === "" || special === true) && actualNumber === "") {
        actualNumber = symbol;
        stringToView += actualNumber
        operationWindow.innerHTML = stringToView;
        return;
    }

    if (operation === "" && actualNumber !== "-" && actualNumber[actualNumber.length - 1] !== "." && actualNumber !== "(") operation = actualNumber;//pierwsza wpisywana liczba
    else if (actualNumber !== "(" && actualNumber[actualNumber.length - 1] !== "." && actualNumber !== "(-" && actualNumber !== "-") operation += actualNumber;//kolejne liczby

    if (symbol === "=") return count();

    const lastSymb = operation[operation.length - 1];
    const lastActualNumber = actualNumber[actualNumber.length - 1];

    if (operation === "" || operation === "-" || lastActualNumber === "-" || lastSymb === "(" || actualNumber === "(-" || lastActualNumber === ".") return;//blok po minusie
    else if (lastSymb === "+" || lastSymb === "-" || lastSymb === "/" || lastSymb === "*") {
        operation = operation.slice(0, operation.length - 1) + symbol;//możliwość zmiany znaku
        stringToView = stringToView.slice(0, stringToView.length - 1) + symbol;
    }
    else {
        stringToView += symbol
        operation += symbol;//pierwszy wybór
    }
    operationWindow.innerHTML = stringToView;
    actualNumber = "";
}

function count() {
    stringToView += actualNumber;
    clearNumber();

    //usuwanie operatora na końcu, gdy nie wpisano liczby
    let lastSymb = operation[operation.length - 1];
    while (lastSymb === "+" || lastSymb === "-" || lastSymb === "/" || lastSymb === "*" || lastSymb === "(") {
        operation = operation.slice(0, operation.length - 1);
        stringToView = stringToView.slice(0, stringToView.length - 1)
        lastSymb = operation[operation.length - 1];
    }

    //zamykanie niezamkniętych nawiasów
    while (checkBrackets() === false) {
        operation += ')';
        stringToView += ')';
    }
    operationWindow.innerHTML = stringToView;

    //obliczanie
    try {
        operation = (operation === "") ? "0" : round(eval(operation), 14);
        operation = operation.toString();
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
    else if (operation === "NaN") {
        clearAll();
        result.value = "błąd";

    }
    else result.value = operation;
    actualNumber = operation;
    operation = "";
    isSolved = true;
    stringToView = "";
}

//Ograniczenie błędów podczas operacji na float
function round(n, k) {
    const factor = Math.pow(10, k);
    return Math.round(n * factor) / factor;
}


