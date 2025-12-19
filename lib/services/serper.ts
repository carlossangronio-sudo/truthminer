import axios from 'axios';

export interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

export interface SerperResponse {
  organic: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
}

/**
 * Service pour rechercher des discussions Reddit via Serper.dev API
 */
export class SerperService {
  private apiKey: string;
  private baseUrl = 'https://google.serper.dev/search';

  constructor() {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error('SERPER_API_KEY is not defined in environment variables');
    }
    this.apiKey = apiKey;
  }

  /**
   * Recherche des discussions Reddit pour un mot-clé donné
   * @param keyword - Le mot-clé de recherche (ex: "Meilleure souris gaming")
   * @returns Liste des résultats Reddit avec titre, lien et extrait
   */
  async searchReddit(keyword: string): Promise<SerperResult[]> {
    const query = `site:reddit.com ${keyword} "avis"`;
    
    try {
      const response = await axios.post<SerperResponse>(
        this.baseUrl,
        {
          q: query,
          num: 10, // Nombre de résultats à récupérer
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.organic.map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche Serper:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Erreur API Serper: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }
}


