/**
 * The interface that listeners must adher to.
 */
export interface Listener {
    /**
     * A function that produces a sample.
     */
    sample: () => any;
    /**
     * 
     */
    sampleRaw: string;
    /**
     * The interval to sample at.
     */
    interval: number;

}
