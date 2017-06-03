const HEX_TABLE = '0123456789abcdef';

/**
 * 生成UUID
 * @return {String}
 */
export function uuid() {
    let s = new Array(35);
    for (let i = 0; i < 36; i++) {
        s[i] = i > 7 && ( (i - 8) % 5 === 0 ) ? '-' : HEX_TABLE[(Math.random() * 0x10) | 0];
    }
    s[14] = '4';
    s[19] = HEX_TABLE[(s[19] & 0x3) | 0x8];
    return s.join('');
}
