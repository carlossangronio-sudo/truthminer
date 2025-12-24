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
  private accountUrl = 'https://google.serper.dev/account';

  constructor() {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error('SERPER_API_KEY is not defined in environment variables');
    }
    this.apiKey = apiKey;
  }

  /**
   * Récupère les crédits restants sur le compte Serper
   */
  async getAccountCredits(): Promise<number | null> {
    try {
      const response = await axios.get(this.accountUrl, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      const credits =
        (response.data && (response.data as any).credits) !== undefined
          ? Number((response.data as any).credits)
          : null;

      if (credits !== null && !Number.isNaN(credits)) {
        console.log('[Serper] 💳 Solde de crédits (account):', credits);
        return credits;
      }

      console.warn('[Serper] ⚠️ Impossible de lire le champ "credits" dans la réponse account:', response.data);
      return null;
    } catch (error) {
      console.error('[Serper] ❌ Erreur lors de la récupération du compte Serper:', error);
      return null;
    }
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

      // Capturer les crédits Serper depuis les headers
      const creditsHeader = response.headers['x-serper-credits'] || response.headers['X-Serper-Credits'];
      if (creditsHeader) {
        const credits = parseInt(creditsHeader, 10);
        console.log('[Serper] 💳 Crédits restants:', credits);
        // TODO: Stocker les crédits dans Supabase ou un cache
      }

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
      console.log('[Serper] 🔍 Recherche d\'image pour:', query);
      
      // Utiliser l'endpoint images de Serper
      const response = await axios.post(
        'https://google.serper.dev/images',
        {
          q: query,
          num: 1, // Optimisation : ne chercher qu'une seule image pour économiser les crédits
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // Timeout de 15 secondes
        }
      );

      // Logger la structure complète de la réponse pour déboguer
      console.log('[Serper] 📦 Structure complète de la réponse:', JSON.stringify(response.data, null, 2).substring(0, 1000));
      console.log('[Serper] 🔑 Clés de la réponse:', Object.keys(response.data || {}));
      
      // Gérer différentes structures de réponse possibles
      let images: any[] = [];
      
      // Essayer toutes les structures possibles
      if (response.data?.images && Array.isArray(response.data.images)) {
        images = response.data.images;
        console.log('[Serper] ✅ Images trouvées dans response.data.images:', images.length);
      } else if (response.data?.imageResults && Array.isArray(response.data.imageResults)) {
        images = response.data.imageResults;
        console.log('[Serper] ✅ Images trouvées dans response.data.imageResults:', images.length);
      } else if (response.data?.organic && Array.isArray(response.data.organic)) {
        images = response.data.organic;
        console.log('[Serper] ✅ Images trouvées dans response.data.organic:', images.length);
      } else if (Array.isArray(response.data)) {
        images = response.data;
        console.log('[Serper] ✅ Images trouvées dans response.data (array):', images.length);
      } else {
        // Essayer de trouver n'importe quel tableau dans la réponse
        for (const key in response.data) {
          if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
            images = response.data[key];
            console.log(`[Serper] ✅ Images trouvées dans response.data.${key}:`, images.length);
            break;
          }
        }
        
        if (images.length === 0) {
          console.warn('[Serper] ⚠️ Structure de réponse inattendue. Clés disponibles:', Object.keys(response.data || {}));
          // Logger un échantillon complet
          console.log('[Serper] 📄 Échantillon de la réponse:', JSON.stringify(response.data, null, 2).substring(0, 500));
        }
      }

      // Parcourir les images pour trouver la première valide
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`[Serper] 🔎 Analyse de l'image ${i + 1}/${images.length}:`, JSON.stringify(image, null, 2).substring(0, 200));
        
        // Essayer différents champs possibles pour l'URL
        let imageUrl = 
          image.imageUrl || 
          image.url || 
          image.link || 
          image.src || 
          image.originalUrl || 
          image.image ||
          image.original ||
          image.thumbnail ||
          image.media ||
          image.contentUrl;
        
        // Si c'est un objet, essayer d'extraire l'URL
        if (typeof imageUrl === 'object' && imageUrl !== null) {
          imageUrl = (imageUrl as any).url || (imageUrl as any).src || (imageUrl as any).link || (imageUrl as any).href;
        }
        
        console.log(`[Serper] 🖼️ URL extraite pour l'image ${i + 1}:`, imageUrl);
        
        if (imageUrl && typeof imageUrl === 'string') {
          // Nettoyer l'URL (enlever les espaces, etc.)
          imageUrl = imageUrl.trim();
          
          // Vérifier que c'est une URL valide
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            // Vérifier que ce n'est pas une URL de redirection ou invalide
            const invalidPatterns = [
              'googleusercontent.com/imgres',
              'gstatic.com',
              'google.com/search',
              'google.com/imgres',
              'tbn:',
              'data:image', // Exclure les images base64
            ];
            
            const isValid = !invalidPatterns.some(pattern => imageUrl.toLowerCase().includes(pattern.toLowerCase()));
            
            if (isValid) {
              console.log('[Serper] ✅ Image valide trouvée:', imageUrl);
              return imageUrl;
            } else {
              console.log('[Serper] ❌ Image invalide (redirection Google ou base64):', imageUrl);
            }
          } else {
            console.log('[Serper] ❌ URL invalide (ne commence pas par http):', imageUrl);
          }
        } else {
          console.log('[Serper] ❌ Aucune URL trouvée dans l\'image:', typeof imageUrl);
        }
      }
      
      console.log('[Serper] ❌ Aucune image valide trouvée pour:', query);
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Serper] ❌ Erreur API lors de la recherche d\'image:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data ? JSON.stringify(error.response.data).substring(0, 500) : 'Pas de données',
          message: error.message,
        });
      } else {
        console.error('[Serper] ❌ Erreur lors de la recherche d\'image:', error);
      }
      // Ne pas faire échouer le processus si la recherche d'image échoue
      return null;
    }
  }
}


