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
      console.log('[Serper] Recherche d\'image pour:', query);
      
      // Utiliser l'endpoint images de Serper
      const response = await axios.post(
        'https://google.serper.dev/images',
        {
          q: query,
          num: 10, // Récupérer 10 images pour avoir plus de choix
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // Timeout de 15 secondes
        }
      );

      console.log('[Serper] Réponse reçue:', JSON.stringify(response.data, null, 2).substring(0, 500));

      // Gérer différentes structures de réponse possibles
      let images: any[] = [];
      
      if (response.data?.images && Array.isArray(response.data.images)) {
        images = response.data.images;
      } else if (response.data?.imageResults && Array.isArray(response.data.imageResults)) {
        images = response.data.imageResults;
      } else if (Array.isArray(response.data)) {
        images = response.data;
      }

      // Parcourir les images pour trouver la première valide
      for (const image of images) {
        // Essayer différents champs possibles pour l'URL
        const imageUrl = image.imageUrl || image.url || image.link || image.src || image.originalUrl;
        
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
          // Vérifier que ce n'est pas une URL de redirection ou invalide
          if (!imageUrl.includes('googleusercontent.com/imgres') && 
              !imageUrl.includes('gstatic.com') &&
              !imageUrl.includes('google.com/search')) {
            console.log('[Serper] Image valide trouvée:', imageUrl);
            return imageUrl;
          }
        }
      }
      
      console.log('[Serper] Aucune image valide trouvée pour:', query);
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Serper] Erreur API lors de la recherche d\'image:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error('[Serper] Erreur lors de la recherche d\'image:', error);
      }
      // Ne pas faire échouer le processus si la recherche d'image échoue
      return null;
    }
  }
}


