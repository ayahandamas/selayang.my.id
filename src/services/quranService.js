import { ayahData } from "../data/ayah.js";
import { surahList } from "../data/surah.js";

export function getAllSurah() {
  return surahList;
}
export function getSurahByNumber(number) {
    return surahList.find(
        s => s.number === Number(number)
    );
}
export function getAyahBySurah(number) {

  return ayahData[number] || [];

}
