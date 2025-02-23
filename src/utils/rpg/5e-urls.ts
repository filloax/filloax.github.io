import type {Entry5e} from "@/utils/rpg/5e-common.ts";

export function encodeHash(obj: Entry5e) {
    return encodeArrayForHash(obj.name, obj.source);
}

const SEP = "_"

function encodeArrayForHash(...toEncodes: any[]) {
    return toEncodes.map(encodeForHash).join(SEP);
}

function encodeForHash(toEncode: any) {
    if (toEncode instanceof Array) return toEncode.map(it => urlify(`${it}`)).join(SEP);
    else return urlify(`${toEncode}`);
}

function urlify(str: any) {
    return encodeURIComponent(str.toLowerCase()).toLowerCase();
}