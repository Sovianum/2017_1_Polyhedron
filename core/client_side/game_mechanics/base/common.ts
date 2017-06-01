'use_strict';


export type Point = number[];


export type Vector = number[];


export interface Pair<T> {
    first: T;
    second: T;
}


export function getByCircularIndex<T>(arr: T[], index: number): T {
    let itemIndex = index % arr.length;
    itemIndex = itemIndex >= 0 ? itemIndex : itemIndex + arr.length;
    return arr[itemIndex];
}
