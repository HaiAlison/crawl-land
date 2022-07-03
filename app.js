function hex2bin(hex, isKey = false) {
    hex = hex.replace("0x", "").toLowerCase();
    let out = "";
    let x = 0;
    for (let c of hex) {
        if (x === hex.length / 2 && !isKey) {
            out += " ";
        } else if (isKey && x % 2 === 0) {
        }
        switch (c) {
            case '0':
                out += "0000";
                break;
            case '1':
                out += "0001";
                break;
            case '2':
                out += "0010";
                break;
            case '3':
                out += "0011";
                break;
            case '4':
                out += "0100";
                break;
            case '5':
                out += "0101";
                break;
            case '6':
                out += "0110";
                break;
            case '7':
                out += "0111";
                break;
            case '8':
                out += "1000";
                break;
            case '9':
                out += "1001";
                break;
            case 'a':
                out += "1010";
                break;
            case 'b':
                out += "1011";
                break;
            case 'c':
                out += "1100";
                break;
            case 'd':
                out += "1101";
                break;
            case 'e':
                out += "1110";
                break;
            case 'f':
                out += "1111";
                break;
            default:
                return "";
        }
        x++;

    }

    return out;
}

function getKPlus(k, PC) {
    let string = '';
    for (const [index, val] of Object.entries(k)) {
        // if (index >= 56) {
        //     continue;
        // }
        string += k[PC[index] - 1];
        if (parseInt(index) === 27) {
            string += ' '
        }
    }
    return string?.replace(/[undefined]/g, '');
}

function getCD(c, d) {
    const x = c.split('');
    const y = x.shift();
    x.push(y);
    let C1 = '';
    x.map(t => {
        C1 += t;
    })
    const z = d.split('');
    const m = z.shift();
    z.push(m);
    let D1 = '';
    z.map(t => {
        D1 += t;
    })
    return C1 + D1;
}

function getXor(er0, k1) {
    let A = '';
    for (const index in er0) {
        const num = (er0[index] * 1 + k1[index] * 1);
        if (num > 1 || num === 0) {
            A += 0;
        } else if (num === 1) {
            A += 1;
        }
        if ((index * 1 + 1) % 6 === 0) {
            A += ' ';
        }
    }
    return A;
}

let message = '';
let key = '';

'0123456789ABCDEF'.split(' ').forEach(str => {
    message += hex2bin(str)
})

// '0123456789AB3504'
'0123456789AB3929'.split(' ').forEach(str => {
    key += hex2bin(str, true)
});

const left = message.split(' ')[0];
const right = message.split(' ')[1];

const PC1 = [
    57, 49, 41, 33, 25, 17, 9,
    1, 58, 50, 42, 34, 26, 18,
    10, 2, 59, 51, 43, 35, 27,
    19, 11, 3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15,
    7, 62, 54, 46, 38, 30, 22,
    14, 6, 61, 53, 45, 37, 29,
    21, 13, 5, 28, 20, 12, 4];
const PC2 = [
    14, 17, 11, 24, 1, 5,
    3, 28, 15, 6, 21, 10,
    23, 19, 12, 4, 26, 8,
    16, 7, 27, 20, 13, 2,
    41, 52, 31, 37, 47, 55,
    30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53,
    46, 42, 50, 36, 29, 32,
]
const kPlus = getKPlus(key.split(''), PC1)
console.log(kPlus)
const C0 = kPlus.split(' ')[0];
const D0 = kPlus.split(' ')[1];
const C1D1 = getCD(C0, D0);
const k1 = getKPlus(C1D1, PC2).replace(' ', '');
console.log(k1, "K1")
const IT = [
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6,
    64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17, 9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7,
];
let m = [];
for (const x in message.replace(' ', '')) {
    m.push(message.replace(' ', '')[x])
}
let itPlus = [];
for (const [index, val] of Object.entries(key.split(''))) {
    if (index * 1 + 1 % 8 === 0 && parseInt(index) !== 0) {
        itPlus += m[index - 1];
        continue;
    }
    itPlus += m[IT[index] - 1];
    if (parseInt(index) === 31) {
        itPlus += ' '
    }
}

const L0 = itPlus.split(' ')[0];
const R0 = itPlus.split(' ')[1];
console.log("L0:", itPlus.split(' ')[0], "\nR0", itPlus.split(' ')[1]);
const E = [
    32, 1, 2, 3, 4, 5,
    4, 5, 6, 7, 8, 9,
    8, 9, 10, 11, 12, 13,
    12, 13, 14, 15, 16, 17,
    16, 17, 18, 19, 20, 21,
    20, 21, 22, 23, 24, 25,
    24, 25, 26, 27, 28, 29,
    28, 29, 30, 31, 32, 1,
];
let ER0 = '';
for (const [key, number] of Object.entries(E)) {
    ER0 += R0.split('')[number - 1];
    if (parseInt(key * 1 + 1) % 6 === 0) {
        ER0 += ' ';
    }
}
// ER0.replace(/\s/g, '');
console.log(ER0)
let A = getXor(ER0, k1);

console.log(A)

const S1 = "14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7-0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8-4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0-15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13";

const S2 = "15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10-3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5-0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15-13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9";

const S3 = "10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8-13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1-13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7-1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12";

const S4 = "7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15-13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9-10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4-3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14";

const S5 = "2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9-14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6-4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14-11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3";

const S6 = "12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11-10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8-9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6-4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13";

const S7 = "4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1-13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6-1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2-6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12";

const S8 = "13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7-1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2-7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8-2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11";

const P = [
    16, 7, 20, 21,
    29, 12, 28, 17,
    1, 15, 23, 26,
    5, 18, 31, 10,
    2, 8, 24, 14,
    32, 27, 3, 9,
    19, 13, 30, 6,
    22, 11, 4, 25,
]
let l = getKPlus('010000101100000100001011101000000', P)
console.log("L:", l)
console.log(getXor(l.replace(' ', ''), L0).replace(/\s/g, ''))

let IPMinus1 = [40, 8, 48, 16, 56, 24, 64, 32, 39,
    7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54,
    22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36,
    4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51,
    19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33,
    1, 41, 9, 49, 17, 57, 25];
// console.log(getKPlus(R0 + L0, IPMinus1))
console.log(getKPlus('0000101001001100110110011001010101000011010000100011001000110100', IPMinus1))
