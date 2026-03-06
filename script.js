function processConversion(toBase) {
    const inputVal = document.getElementById('userInput').value.trim().toUpperCase();
    const fromBase = parseInt(document.getElementById('fromBase').value);
    const stepsContainer = document.getElementById('stepsContainer');
    const resultCard = document.getElementById('resultCard');
    const finalResultSpan = document.getElementById('finalResult');

    if (!inputVal) return alert("الرجاء إدخال رقم أولاً");
    if (fromBase === toBase) return alert("الرجاء اختيار نظامين مختلفين");

    stepsContainer.innerHTML = "";
    let stepsHTML = "";
    let [intPart, fracPart] = inputVal.split('.');
    fracPart = fracPart || "";

    // --- 1. التحويل المباشر (طريقة المجموعات 3 بت أو 4 بت)  ---
    const isDirect = (fromBase === 2 && [8, 16].includes(toBase)) || ([8, 16].includes(fromBase) && toBase === 2);

    if (isDirect) {
        let bitCount = (toBase === 8 || fromBase === 8) ? 3 : 4;
        let weights = (toBase === 8 || fromBase === 8) ? "421" : "8421";
        
        if (fromBase === 2) {
            // من ثنائي إلى (8 أو 16)
            while (intPart.length % bitCount !== 0) intPart = "0" + intPart;
            while (fracPart.length % bitCount !== 0) fracPart += "0";

            let resInt = "", resFrac = "";
            let htmlInt = "", htmlFrac = "";

            for (let i = 0; i < intPart.length; i += bitCount) {
                let gp = intPart.substr(i, bitCount);
                let v = parseInt(gp, 2).toString(toBase).toUpperCase();
                htmlInt += `<div class="group-box"><small>${weights}</small><br><b>${gp}</b><br><span>→ ${v}</span></div>`;
                resInt += v;
            }
            for (let i = 0; i < fracPart.length; i += bitCount) {
                let gp = fracPart.substr(i, bitCount);
                let v = parseInt(gp, 2).toString(toBase).toUpperCase();
                htmlFrac += `<div class="group-box"><small>${weights}</small><br><b>${gp}</b><br><span>→ ${v}</span></div>`;
                resFrac += v;
            }
            stepsHTML = `<p>تقسيم لمجموعات (${bitCount} بت):</p>${htmlInt} ${fracPart ? ' . ' + htmlFrac : ''}`;
            finalResultSpan.innerText = resInt + (resFrac ? "." + resFrac : "");
        } else {
            // من (8 أو 16) إلى ثنائي
            let res = "";
            for (let char of inputVal) {
                if (char === '.') { res += "."; continue; }
                let bin = parseInt(char, fromBase).toString(2).padStart(bitCount, '0');
                stepsHTML += `<div class="group-box"><b>${char}</b><br><small>${weights}</small><br><span>${bin}</span></div>`;
                res += bin;
            }
            finalResultSpan.innerText = res;
        }
    } 
    // --- 2. التحويل إلى العشري (قوى العدد الموجبة والسالبة) ---
    else if (toBase === 10) {
        let total = 0;
        stepsHTML += `<table><tr><th>الخانة</th><th>الحساب</th><th>الناتج</th></tr>`;
        
        // الجزء الصحيح (أسس موجبة)
        for (let i = 0; i < intPart.length; i++) {
            let p = intPart.length - 1 - i;
            let val = parseInt(intPart[i], fromBase);
            let res = val * Math.pow(fromBase, p);
            stepsHTML += `<tr><td>${intPart[i]}</td><td>${val} × ${fromBase}<sup>${p}</sup></td><td>${res}</td></tr>`;
            total += res;
        }
        // الجزء الكسري (أسس سالبة)
        for (let i = 0; i < fracPart.length; i++) {
            let p = -(i + 1);
            let val = parseInt(fracPart[i], fromBase);
            let res = val * Math.pow(fromBase, p);
            stepsHTML += `<tr style="color:#00d2ff"><td>${fracPart[i]}</td><td>${val} × ${fromBase}<sup>${p}</sup></td><td>${res.toFixed(4)}</td></tr>`;
            total += res;
        }
        stepsHTML += `</table>`;
        finalResultSpan.innerText = total;
    }
    // --- 3. من عشري إلى أي نظام (قسمة للصحيح وضرب للكسر) ---
    else if (fromBase === 10) {
        // الجزء الصحيح (قسمة)
        let num = parseInt(intPart);
        let resInt = (num === 0) ? "0" : "";
        stepsHTML += `<p><b>1. الجزء الصحيح (قسمة متكررة):</b></p>`;
        while (num > 0) {
            let rem = num % toBase;
            let char = rem.toString(toBase).toUpperCase();
            stepsHTML += `<div>${num} ÷ ${toBase} = ${Math.floor(num/toBase)} | الباقي: <b class="highlight">${char}</b></div>`;
            resInt = char + resInt;
            num = Math.floor(num / toBase);
        }

        // الجزء الكسري (ضرب متكرر)
        let resFrac = "";
        if (fracPart) {
            stepsHTML += `<p><b>2. الجزء الكسري (ضرب متكرر في ${toBase}):</b></p>`;
            let f = parseFloat("0." + fracPart);
            for (let i = 0; i < 5; i++) { // بحد أقصى 5 خانات
                let multi = f * toBase;
                let integerBit = Math.floor(multi);
                let char = integerBit.toString(toBase).toUpperCase();
                stepsHTML += `<div>${f.toFixed(3)} × ${toBase} = <b class="highlight">${multi.toFixed(3)}</b> → نأخذ ${char}</div>`;
                resFrac += char;
                f = multi - integerBit;
                if (f === 0) break;
            }
        }
         finalResultSpan.innerText = "\u200E" + resInt + (resFrac ? "." + resFrac : "");
    }

    stepsContainer.innerHTML = stepsHTML;
    resultCard.style.display = "block";
}
function clearAll() {
    document.getElementById('userInput').value = "";
    document.getElementById('stepsContainer').innerHTML = "";
    document.getElementById('resultCard').style.display = "none";
    document.getElementById('finalResult').innerText = "";

}
