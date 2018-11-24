Array.prototype.hasMin = function (attrib) {
    return this.reduce(function (prev, curr) {
        return prev[attrib] < curr[attrib] ? prev : curr;
    });
}

x = [{
        a: 1,
        b: 2,
        c: 13
    },
    {
        a: 11,
        b: 12,
        c: 13
    }
]

q= x.hasMin('c')
console.log(q)