const API_BASE = "https://api.alquran.cloud/v1";

export async function getSurahListFromApi() {
  const response = await fetch(`${API_BASE}/surah`);

  if (!response.ok) {
    throw new Error("Gagal mengambil daftar surah");
  }

  const result = await response.json();

  return result.data;
}
