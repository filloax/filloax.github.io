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
}
