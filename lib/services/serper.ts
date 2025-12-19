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

export interface SerperImageResponse {
  images?: Array<{
    title?: string;
    imageUrl?: string;
    link?: string;
    url?: string; // Certaines versions de l'API utilisent 'url' au lieu de 'imageUrl'
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

  /**
   * Recherche une image Google pour un produit donné
   * @param productName - Le nom du produit (ex: "Souris gaming Logitech G Pro")
   * @returns URL de l'image la plus pertinente, ou null si aucune trouvée
   */
  async searchImage(productName: string): Promise<string | null> {
    const query = productName;
    
    try {
      // Utiliser l'endpoint images de Serper
      const response = await axios.post<SerperImageResponse>(
        'https://google.serper.dev/images',
        {
          q: query,
          num: 5, // Récupérer 5 images pour choisir la meilleure
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // Timeout de 10 secondes
        }
      );

      // Retourner la première image trouvée (la plus pertinente)
      if (response.data && response.data.images && response.data.images.length > 0) {
        const firstImage = response.data.images[0];
        // Vérifier que l'URL de l'image est valide (essayer imageUrl ou url)
        const imageUrl = firstImage.imageUrl || firstImage.url;
        if (imageUrl && imageUrl.startsWith('http')) {
          console.log('[Serper] Image trouvée:', imageUrl);
          return imageUrl;
        }
      }
      
      console.log('[Serper] Aucune image trouvée pour:', query);
      return null;
    } catch (error) {
      console.warn('Erreur lors de la recherche d\'image Serper (non bloquant):', error instanceof Error ? error.message : error);
      // Ne pas faire échouer le processus si la recherche d'image échoue
      return null;
    }
  }
}


