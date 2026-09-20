const API_BASE = "https://api.alquran.cloud/v1";

export async function getSurahListFromApi() {
  const response = await fetch(`${API_BASE}/surah`);

  if (!response.ok) {
    throw new Error("Gagal mengambil daftar surah");
  }

  const result = await response.json();

  return result.data;
}

export async function getSurahAyahsFromApi(number) {
  const response = await fetch(
    `${API_BASE}/surah/${number}/editions/quran-uthmani,id.indonesian,ar.alafasy`
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil ayat surah");
  }

  const result = await response.json();

  return result.data;
}
export async function searchQuranFromApi(keyword) {
  const query = String(keyword || "").trim();

  if (!query) {
    return [];
  }

  const response = await fetch(
    `${API_BASE}/search/${encodeURIComponent(query)}/all/id.indonesian`
  );

  if (!response.ok) {
    throw new Error("Gagal mencari ayat Al-Qur'an");
  }

  const result = await response.json();

  return result.data?.matches || [];
}