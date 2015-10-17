function debug(obj) {
    var str = '------------- matrix info ----------------\n';
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (j !== 0) {
                str += "\t\t";
            }
            str += obj[i * 4 + j].toFixed(10);
        }
        str += "\n";
    }
    console.log(str);
}