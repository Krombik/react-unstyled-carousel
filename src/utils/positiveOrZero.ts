/** @internal */
const positiveOrZero = (value: number) => (value < 0 ? 0 : value);

/** @internal */
export default positiveOrZero;
