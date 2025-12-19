import OpenAI from 'openai';
import { SerperResult } from './serper';

export interface GeneratedReport {
  title: string;
  slug: string;
  choice: string; // Choix de la communauté
  defects: string[]; // Défauts rédhibitoires avec citations Reddit
  article: string; // Article en Markdown
  products: string[]; // Liste des produits mentionnés
  userProfiles?: string; // Section "Est-ce fait pour vous ?"
}

/**
 * Service pour analyser les discussions Reddit et générer un article avec OpenAI
 */
export class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Génère un article de comparaison basé sur les discussions Reddit
   * @param keyword - Le mot-clé de recherche original
   * @param redditResults - Les résultats de recherche Reddit
   * @returns Rapport généré avec article structuré
   */
  async generateReport(
    keyword: string,
    redditResults: SerperResult[]
  ): Promise<GeneratedReport> {
    const systemPrompt = `Tu es un journaliste spécialisé dans les comparaisons de produits ultra-honnêtes avec un ton tranché et sans compromis. 
Ton rôle est d'analyser les discussions Reddit pour identifier la vérité sur les produits, au-delà du marketing.

IMPORTANT : Tu dois répondre UNIQUEMENT avec un objet JSON valide au format suivant :
{
  "title": "Titre de l'article",
  "choice": "Le produit le plus recommandé par la communauté avec explications détaillées",
  "defects": ["Défaut 1 avec citation Reddit", "Défaut 2 avec citation Reddit"],
  "article": "Article complet en Markdown avec introduction, sections, conclusion",
  "products": ["Nom du produit 1", "Nom du produit 2"],
  "userProfiles": "Section 'Est-ce fait pour vous ?' avec profils d'utilisateurs"
}

RÈGLES STRICTES DE VÉRIFICATION TECHNIQUE :
- Distingue TOUJOURS les produits "Smart" (caméra/audio comme Meta Ray-Ban) des produits "AR" (avec écran comme Xreal)
- Ne confonds JAMAIS les fonctionnalités : si un produit n'a pas d'écran, ne mentionne jamais d'écran
- Vérifie les spécifications techniques mentionnées dans les discussions Reddit avant de les citer
- Si tu n'es pas sûr d'une caractéristique technique, indique-le clairement plutôt que d'inventer

TON ET STYLE :
- Utilise des expressions tranchées : "Le consensus Reddit est sans appel", "Ce que le marketing vous cache", "La vérité que personne ne vous dit"
- Sois direct et sans langue de bois : "Non, ce n'est pas fait pour vous si..."
- Utilise des formules percutantes : "Le verdict est tombé", "La communauté a tranché", "Voici ce qu'on ne vous dit pas"

STRUCTURE DE L'ARTICLE :
L'article DOIT contenir ces sections en Markdown :
1. Introduction percutante (2-3 paragraphes)
2. Le choix de la communauté (section dédiée avec ton tranché)
3. Les défauts rédhibitoires (section dédiée avec citations)
4. Est-ce fait pour vous ? (profils d'utilisateurs : "Pour les créateurs de contenu : OUI", "Pour ceux qui cherchent X : NON")
5. Conclusion honnête et sans compromis

CITATIONS REDDIT OBLIGATOIRES :
- Chaque défaut dans "defects" DOIT inclure au moins une citation anonymisée d'un membre Reddit
- Format : "Défaut : [citation] - Un utilisateur Reddit"
- Exemple : "Surchauffe après 30 minutes : 'Mon unité devient brûlante au bout de 30 min' - Un utilisateur Reddit"
- Les citations doivent être extraites des extraits fournis, pas inventées

Instructions détaillées :
1. "title" : Un titre accrocheur, percutant et descriptif
2. "choice" : Identifie le "Choix de la communauté" avec un ton tranché. Utilise "Le consensus Reddit est sans appel" ou équivalent
3. "defects" : Chaque défaut DOIT inclure une citation Reddit anonymisée. Format : "Description du défaut : '[citation exacte]' - Un utilisateur Reddit"
4. "article" : Article complet en Markdown avec TOUTES les sections listées ci-dessus. Ton tranché et sans compromis.
5. "products" : Liste précise des noms des produits principaux mentionnés (pour les liens d'affiliation)
6. "userProfiles" : Section "Est-ce fait pour vous ?" avec au moins 3-4 profils d'utilisateurs. Format : "Pour [profil] : OUI/NON - [explication]"

Sois factuel, honnête, tranché, et cite TOUJOURS les sources Reddit avec des citations exactes.`;

    const userPrompt = `Analyse ces discussions Reddit sur "${keyword}" et génère un article de comparaison ultra-honnête au format JSON.

RAPPEL CRITIQUE :
- Vérifie les spécifications techniques (Smart vs AR, écran vs pas d'écran, etc.)
- Utilise un ton tranché et sans compromis
- Extrais des citations Reddit réelles pour chaque défaut
- Inclus la section "Est-ce fait pour vous ?" avec des profils d'utilisateurs

Discussions Reddit à analyser :

${redditResults
  .map(
    (result, index) => `
[Discussion ${index + 1}]
Titre: ${result.title}
Lien: ${result.link}
Extrait: ${result.snippet}
`
  )
  .join('\n')}

Réponds UNIQUEMENT avec un objet JSON valide contenant les champs : title, choice, defects (tableau avec citations), article (Markdown complet), products (tableau), userProfiles (texte).`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Aucune réponse générée par OpenAI');
      }

      // Parse la réponse JSON
      const parsed = JSON.parse(content);
      
      // Générer un slug à partir du titre
      const slug = this.generateSlug(parsed.title || keyword);

      return {
        title: parsed.title || keyword,
        slug,
        choice: parsed.choice || 'Non identifié',
        defects: Array.isArray(parsed.defects) ? parsed.defects : [],
        article: parsed.article || '',
        products: Array.isArray(parsed.products) ? parsed.products : [],
        userProfiles: parsed.userProfiles || '',
      };
    } catch (error) {
      console.error('Erreur lors de la génération OpenAI:', error);
      if (error instanceof OpenAI.APIError) {
        throw new Error(`Erreur API OpenAI: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Génère un slug URL-friendly à partir d'un titre
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

