// import fs from 'fs';

// function namefix() {
//     var filter = /(\w+\$+\d+)/g;
//     return {
//         name: 'namefix',
//         // banner() {
//         //     return `/**\n @author lonphy\n @version 2.0\n **/\n\n`;
//         // },
//         onwrite(bundle, data) {
//             var result = data.code.replace(filter, m => m.split('$')[0])
//             fs.unlinkSync(bundle.dest);
//             fs.writeFileSync(bundle.dest, result, 'utf8');
//         }
// 	};
// }

export default {
    entry: 'src/L5.js',
    // format: 'cjs',
    plugins: [
        // namefix()
    ],
    indent: '\t',
    targets: [
        {
            format: 'umd',
            moduleName: 'L5',
            dest: 'dist/l5gl.js'
        }
        ,{
            format: 'es',
            dest: 'dist/l5gl.module.js'
        }
    ],
    sourceMap: true
};