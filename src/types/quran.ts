export interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  translated_name: {
    name: string;
  };
}

export interface Reciter {
  id: number;
  slug: string;
  name: string;
  style: string;
  image: string;
  color: string;
  server: string;
  folder?: string;
}

export interface Recitation {
  audio_url: string;
}
