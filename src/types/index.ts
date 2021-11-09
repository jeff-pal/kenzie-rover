export type ReadLineCallback= (
    line          : string,
    remainingData?: boolean,
    writeStream  ?: null | NodeJS.WriteStream
) => void;

export type Coordinate = [number, number];