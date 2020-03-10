let operation = "";
let actualNumber = "";

let symbol = null;
let comma = false;
let isSolved = false;

let special = false;
let root = false;

let currencyWrite = false;
let stringToView = "";

const result = document.querySelector('.result');
const operationWindow = document.querySelector('.operationWindow');
const container = document.querySelector('.container');
const currencyList = document.querySelector('.currencyList');

container.onclick = function (event) {
    const classes = event.target.classList;
    if (classes.contains("numbers")) write(event);
    else if (classes.contains("symbol")) getSymbol(event);
    else if (classes.contains("c")) clearAll();
    else if (classes.contains("ce")) clearNumber();
}

fetch("https://api.nbp.pl/api/exchangerates/tables/A/")
    .then(resp => {
        if (resp.ok) {
            return resp.json()
        } else {
            throw new Error("Błąd wczytywania walut")
        }
    })
    .then(resp => {
        resp[0].rates.forEach(rate => {
            const a = document.createElement('a');
            let currency = rate.code;
            let price = rate.mid;
            a.addEventListener('click', function () {
                addCurrency(currency, price)
            })
            a.className += "dropdown-item";
            a.href = "#";
            a.innerHTML = rate.currency;
            currencyList.appendChild(a);
        })
    })

//dodanie waluty
function addCurrency(cur, pric) {
    if (isSolved === true) clearAll();
    if (currencyWrite) return;
    if (actualNumber && actualNumber !== "-") {
        operation += actualNumber + "*";
        stringToView += "*"
    }
    if (actualNumber === "-") operation += actualNumber
    stringToView += `${cur}()`;
    actualNumber = ""
    operation += `${pric}*`;
    currencyWrite = true;
    comma = false;
    operationWindow.innerHTML = stringToView;
}

//usuwanie ostatniego znaku/ znaku operacji
function clearNumber() {
    const lastOperationSymb = operation[operation.length - 1]
    if ((!actualNumber && !isNaN(lastOperationSymb)) || special || (lastOperationSymb === ")" && stringToView[stringToView.length - 1] !== ")") || (currencyWrite && !actualNumber)) return;//maksymalnie można cofnąć jedną liczbę i znaki
    if (currencyWrite) stringToView = stringToView.slice(0, stringToView.length - 1);
    if (actualNumber) {
        actualNumber = actualNumber.slice(0, actualNumber.length - 1);
        if (!actualNumber.includes(".")) comma = false;
    }
    else {
        operation = operation.slice(0, operation.length - 1);
        comma = true;
    }
    stringToView = stringToView.slice(0, stringToView.length - 1);
    if (currencyWrite) stringToView += ")"
    operationWindow.innerHTML = stringToView;
}

function add() {
    const len = actualNumber.length;
    stringToView = stringToView.slice(0, ((stringToView.length) - len));
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
    currencyWrite = false;
    root = false;
    result.value = "";
    stringToView = "";
    operationWindow.innerHTML = stringToView;
}

//zwraca true gdy liczba otwartych nawiasów<=zamkniętych
function checkBrackets(where) {
    const numberOfOpenedBrackets = (where + actualNumber).split("(").length - 1;
    const numberOfClosedBrackets = (where + actualNumber).split(")").length - 1;
    if (numberOfOpenedBrackets === numberOfClosedBrackets) return true;
    else return false;
}

//wpisywanie wartości do miejsca na walute
function getCurrencyAmount(val) {
    if (val === "(") return;
    else if (val === ")") {
        if (actualNumber === "") actualNumber = "1";
        operation += actualNumber;
        actualNumber = "";
        currencyWrite = false;
    }
    else stringToView = stringToView.slice(0, stringToView.length - 1);
}

//poprawne działanie przecinków
function putNumber(val) {
    if (!actualNumber && val !== ",") actualNumber = val;
    else if (val !== ",") actualNumber += val;
    else if (val === ",") {
        if (['', '-', '(', '(-'].includes(actualNumber)) {
            actualNumber += "0.";
            val = "0.";
        }
        else {
            actualNumber += ".";
            val = "."
        }
        comma = true;
    }
    return val;
}

//wpisanie stopnia pierwiastku/potęgi
function insertElementalDegree(val) {
    if (val === ")" || val === "(") {
        if (val === "(") val = "*" + val;
        if (root) {
            if (!actualNumber) actualNumber = "2";
            operation += `1 / ${actualNumber})${val}`;
        }
        else if (special) {
            if (!actualNumber) actualNumber = "1";
            operation += `${actualNumber})${val}`;
        }
        stringToView += val;
        special = false;
        root = false;
        actualNumber = "";
        comma = false;
    }
    if (!isNaN(val) || (val === ",")) val = putNumber(val);
    if (special && !root) stringToView += val.sup();
    if (root) {
        const rootIndex = stringToView.lastIndexOf("√");
        stringToView = stringToView.slice(0, rootIndex) + val.sup() + stringToView.slice(rootIndex);
    }
    operationWindow.innerHTML = stringToView
}

//dodanie nawaisów, i ew znaku mnożenia
function brackets(acN, val, symb = "") {
    operation += acN + symb + val
    add()
    stringToView += acN + symb + val
    operationWindow.innerHTML = stringToView;
}
//główna funkcja wpisywania liczb i nawiasów
function write(e) {
    let val = e.target.textContent;
    if (isSolved === true && val !== ")") clearAll();//kontynuacja działania po wyniku
    const lastSymb = actualNumber[actualNumber.length - 1];
    const isNotNumber = isNaN(lastSymb);
    const lastOperationSymb = operation[operation.length - 1];
    if (val === ")" && checkBrackets(stringToView) === true) return;
    if (val === "," && comma === true) return;
    if (currencyWrite) getCurrencyAmount(val);

    if (root || special) {
        insertElementalDegree(val)
        return;
    }

    if (val === "(") {
        if (actualNumber[actualNumber.length - 1] === ".") return;
        //dodanie znaku mnożenia, gdy przed, lub za nawiasem nie wybrano operatora
        if (!isNotNumber || lastOperationSymb === ")") {
            brackets(actualNumber, val, "*")
            return
        }
        brackets(actualNumber, val);
        return
    }
    if (lastOperationSymb === ")" && val !== ")" && val !== "(") {
        operation += "*";
        comma = false;
        stringToView += "*"
        operationWindow.innerHTML = stringToView;
    }
    //zamyknięcie nawiasu możliwe tylko w odpowiednich warunkach
    if (val === ")") {
        //sprawdzenie, czy ostatni nie jest symbol, taki jak w tablicy
        if ((['+', '-', '/', '*', '('].includes(lastOperationSymb) && !actualNumber) || lastSymb === ".") return;
        brackets(actualNumber, val)
        return;
    }
    val = putNumber(val);
    stringToView += val
    if (currencyWrite) stringToView += ")"
    operationWindow.innerHTML = stringToView;
}

function getSymbol(e) {
    symbol = e.target.textContent;
    comma = false;
    const powerAndRoot = e.target.dataset.special;
    const lastSymb = operation[operation.length - 1];
    if (isSolved) {
        stringToView = actualNumber;
        result.value = "";
        isSolved = false;
    }
    if (['.', '-'].includes(actualNumber[actualNumber.length - 1]) && symbol !== "=") return;

    //przeliczenie waluty
    if (currencyWrite) {
        if (typeof (powerAndRoot) === undefined) return;
        //przeliczy kurs waluty razy 1 gdy nie podano jej ilości
        if (!actualNumber) actualNumber = "1";
        if (stringToView[stringToView.length - 1] !== ")") stringToView += ")"
        currencyWrite = false;
        operation += actualNumber;
        if (symbol === "=") return count();
        operation += symbol;
        stringToView += symbol;
        actualNumber = "";
        operationWindow.innerHTML = stringToView;
        return;
    }

    //opcja pierwiastkowania i potęgowania wcześniej wpisanej wartości
    if ((powerAndRoot === "root" || powerAndRoot === "power")) {
        if (special === true || root === true || !actualNumber || !isNaN(lastSymb)) return;
        operation += `Math.pow(${actualNumber}, `;
        if (powerAndRoot === "root") {
            stringToView = stringToView.slice(0, stringToView.length - actualNumber.length);
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
        operation += `1 / ${actualNumber})`;
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
    if (symbol === "-" && (lastSymb === "(" || !operation) && !actualNumber) {
        actualNumber = symbol;
        stringToView += actualNumber
        operationWindow.innerHTML = stringToView;
        return;
    }

    if (!operation) operation = actualNumber;//pierwsza wpisywana liczba
    else operation += actualNumber;//kolejne liczby

    if (symbol === "=") return count();

    if (!operation || (lastSymb === "(" && !actualNumber)) return;//blok po minusie
    else if (['+', '-', '/', '*'].includes(lastSymb) && !actualNumber) {
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
    add();
    //usuwanie operatora na końcu, gdy nie wpisano liczby
    let lastSymb = operation[operation.length - 1];
    while (['+', '-', '/', '*', '(', '.'].includes(lastSymb)) {
        operation = operation.slice(0, operation.length - 1);
        stringToView = stringToView.slice(0, stringToView.length - 1)
        lastSymb = operation[operation.length - 1];
    }
    //zamykanie niezamkniętych nawiasów
    while (!checkBrackets(operation)) operation += ')';
    while (!checkBrackets(stringToView)) stringToView += ')';
    operationWindow.innerHTML = stringToView;
    //obliczanie
    try {
        operation = (!operation) ? "0" : round(eval(operation), 14);
        operation = operation.toString();
    }
    catch (e) {
        clearAll();
        isSolved = true
        result.value = "błąd";
        return;
    }
    //błąd dzielenia przez 0
    if (operation === "Infinity" || operation === "-Infinity" || operation === 'NaN') {
        clearAll();
        isSolved = true
        result.value = "Nie dziel przez 0";
        if (operation === 'NaN') result.value = "błąd";
        return;
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


