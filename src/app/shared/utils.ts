import { Injectable } from '@angular/core';

export class Utils {

  constructor() { }

  public static isNull(value: any): boolean {
    return value === null;
  }

  public static isUndefined(value: any): boolean {
    return value === undefined;
  }

  public static nullOrUndefined(value: any) {
    return this.isNull(value) || this.isUndefined(value);
  }

  public static notNullOrUndefined(value: any) {
    return !this.nullOrUndefined(value);
  }

  public static orElse<T>(value: T | null, def: T | (() => T)): T {
    if (typeof def == "function")
      return this.notNullOrUndefined(value) ? value : (def as () => T)();
    else
      return this.notNullOrUndefined(value) ? value : def;
  }

  public static findIndices<T>(array: T[], pred: (value: T, index?: number) => boolean): number[] {
    return [...array.entries()].filter(([index, value]) => pred(value, index)).map(([index, _]) => index);
  }

  public static computeIfAbsent<K extends string | number | symbol, V>(map: Record<K, V>, key: K, producer: () => V) {
    if (!(key in map)) {
      map[key] = producer();
    }
    return map[key];
  }

  public static sameWordsPrefix(str1: string, str2: string): boolean {
    str1 = str1.toLowerCase()
    str2 = str2.toLowerCase()
    if (str1 === str2) return true;

    const words1 = str1.split('-')[0].trim().split(' ').filter(word => word.trim() !== '');
    const words2 = str2.split('-')[0].trim().split(' ').filter(word => word.trim() !== '');

    const isPrefix = (sourceWords: string[], targetWords: string[]) => {
      if (targetWords.length > sourceWords.length) return false;
      for (let i = 0; i < targetWords.length; i++) {
        if (sourceWords[i] !== targetWords[i]) {
          return false;
        }
      }
      return true;
    };

    return isPrefix(words1, words2) || isPrefix(words2, words1);
  }

}
