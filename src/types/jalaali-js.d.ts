declare module "jalaali-js" {
  export interface JalaaliDate {
    jy: number;
    jm: number;
    jd: number;
  }

  export interface GregorianDate {
    gy: number;
    gm: number;
    gd: number;
  }

  export function toJalaali(date: Date): JalaaliDate;
  export function toJalaali(gy: number, gm: number, gd: number): JalaaliDate;

  export function toGregorian(
    jy: number,
    jm: number,
    jd: number
  ): GregorianDate;
  export function toGregorian(jdate: JalaaliDate): GregorianDate;

  export function isValidJalaaliDate(
    jy: number,
    jm: number,
    jd: number
  ): boolean;
  export function isLeapJalaaliYear(jy: number): boolean;

  export function jalaaliMonthLength(jy: number, jm: number): number;

  export function jalCal(jy: number): number[];
  export function j2d(jy: number, jm: number, jd: number): number;
  export function d2j(jdn: number): JalaaliDate;
  export function g2d(gy: number, gm: number, gd: number): number;
  export function d2g(jdn: number): GregorianDate;
}
