/**
 * returns the floating point precision of a decimal number or 0
 */
export function getPrecision(value) {
    const string = `${value}`;
    const index = string.indexOf(".");
    return index === -1 ? 0 : string.length - (index + 1);
}
