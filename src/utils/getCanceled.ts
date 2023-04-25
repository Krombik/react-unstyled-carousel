/** @internal */
const getCanceled = (): Promise<-1> => Promise.resolve(-1);

/** @internal */
export default getCanceled;
