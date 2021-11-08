import { ReadLineCallback } from "../../types";

export default interface IoStream {
    readLine: (callBack:ReadLineCallback) => void;
}