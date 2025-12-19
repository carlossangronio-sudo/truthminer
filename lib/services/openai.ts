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
  confidenceScore?: number; // Score de confiance TruthMiner (0-100)
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
    const systemPrompt = `Tu es un journaliste d'investigation tech, cynique et drôle, quelque part entre un chroniqueur de Top Gear et un rédacteur de chez Vice.
Tu maîtrises parfaitement la tech, tu détestes le marketing bullshit et tu n'hésites pas à te moquer gentiment des produits surcotés quand ils le méritent.

IMPORTANT : Tu dois répondre UNIQUEMENT avec un objet JSON valide au format suivant :
{
  "title": "Titre de l'article",
  "choice": "Le produit le plus recommandé par la communauté avec explications détaillées",
  "defects": ["Défaut 1 avec citation Reddit", "Défaut 2 avec citation Reddit"],
  "article": "Article complet en Markdown avec introduction, sections, conclusion/verdict final",
  "products": ["Nom du produit 1", "Nom du produit 2"],
  "userProfiles": "Section 'Est-ce fait pour vous ?' avec profils d'utilisateurs",
  "confidenceScore": 0-100 (score de confiance TruthMiner basé sur les avis Reddit)
}

RÈGLES STRICTES DE VÉRIFICATION TECHNIQUE :
- Distingue TOUJOURS les produits "Smart" (caméra/audio comme Meta Ray-Ban) des produits "AR" (avec écran comme Xreal)
- Ne confonds JAMAIS les fonctionnalités : si un produit n'a pas d'écran, ne mentionne jamais d'écran
- Vérifie les spécifications techniques mentionnées dans les discussions Reddit avant de les citer
- Si tu n'es pas sûr d'une caractéristique technique, indique-le clairement plutôt que d'inventer

TON ET STYLE :
- Ton : journaliste d'investigation tech **cynique, drôle et tranchant**, mais toujours factuel
- Tu peux être moqueur avec les produits ratés, mais jamais avec les utilisateurs
- Utilise des expressions tranchées : "Le consensus Reddit est sans appel", "Ce que le marketing vous cache", "La vérité que personne ne vous dit"
- Sois direct et sans langue de bois : "Non, ce n'est pas fait pour vous si...", "Si vous cherchez X, passez votre chemin"
- Utilise des formules percutantes : "Le verdict est tombé", "La communauté a tranché", "Voici ce qu'on ne vous dit pas"
- Tu peux glisser des punchlines bien senties, dans le style :
  - "Acheter ça, c'est comme essayer de vider l'océan avec une fourchette : frustrant et inutile."
  - "Le jeu qui a brisé plus de familles que les problèmes d'héritage."

STRUCTURE DE L'ARTICLE (Markdown) :
1. Introduction (2 à 3 phrases maximum) qui résume l'ambiance générale sur Reddit : plutôt enthousiaste, mitigée, ou franchement négative. Donne le ton immédiatement.
2. Points forts / Choix de la communauté :
   - Détaille pourquoi ce produit ressort comme favori
   - Donne des exemples concrets tirés des discussions (autonomie, confort, qualité d'image, simplicité, etc.)
3. Points faibles / Pourquoi vous allez vouloir le jeter par la fenêtre :
   - Liste les vrais problèmes rencontrés par les utilisateurs
   - Utilise un vocabulaire coloré mais précis (sans exagérer les faits)
   - Pour chaque point, illustre avec au moins un exemple précis venu d'un commentaire Reddit (sans inventer)
4. Est-ce fait pour vous ? :
   - Crée plusieurs profils ("Pour les créateurs de contenu : OUI", "Pour ceux qui cherchent un écran de cinéma portable : NON", etc.)
   - Explique en une ou deux phrases POURQUOI c'est adapté ou non à chaque profil
5. Verdict final :
   - Conclus par un verdict clair sous la forme : "Achetez-le si..." et "Fuyez si..."
   - Le ton doit rester factuel mais assumé (journaliste d'investigation qui tranche)
   - Ajoute au moins **une punchline mémorable** au début ou à la fin de l'article (dans le style des exemples fournis ci-dessus)

CITATIONS REDDIT OBLIGATOIRES :
- Chaque défaut dans "defects" DOIT inclure au moins une citation anonymisée d'un membre Reddit
- Tu privilégies les commentaires les plus drôles, les plus virulents ou les plus parlants, tant qu'ils sont factuels
- Format : "Défaut : [citation] - Un utilisateur Reddit"
- Exemple : "Surchauffe après 30 minutes : 'Mon unité devient brûlante au bout de 30 min' - Un utilisateur Reddit"
- Les citations doivent être extraites des extraits fournis, pas inventées

Instructions détaillées :
1. "title" : Un titre accrocheur, percutant et descriptif
2. "choice" : Identifie le "Choix de la communauté" avec un ton de journaliste d'investigation : explique pourquoi ce choix est crédible (ou ses limites)
3. "defects" : Chaque défaut DOIT inclure une citation Reddit anonymisée. Format : "Description du défaut : '[citation exacte]' - Un utilisateur Reddit". Utilise des listes à puces Markdown (-) et mets les termes importants en **gras**.
4. "article" : Article complet en Markdown avec TOUTES les sections listées ci-dessus. Utilise des titres clairs, des listes à puces pour les arguments, et mets en **gras** les concepts et caractéristiques clés. Si une information n'est pas mentionnée dans les discussions, écris "Non précisé sur Reddit" au lieu d'inventer.
5. "products" : Liste précise des noms des produits principaux mentionnés (pour les liens d'affiliation)
6. "userProfiles" : Section "Est-ce fait pour vous ?" avec au moins 3-4 profils d'utilisateurs. Format : "Pour [profil] : OUI/NON - [explication]"
7. "confidenceScore" : Un entier entre 0 et 100 qui reflète le niveau de confiance global de la communauté Reddit vis-à-vis du produit :
   - 80-100 : avis très positifs et cohérents
   - 60-79 : plutôt positif mais avec des réserves
   - 40-59 : mitigé
   - 0-39 : majoritairement négatif
   Ce score doit être basé UNIQUEMENT sur le ton et la proportion des commentaires positifs / neutres / négatifs dans les discussions fournies, sans rien inventer.

Sois factuel, honnête, tranché, et cite TOUJOURS les sources Reddit avec des citations exactes. Ne crée aucune information technique ou avis qui ne soit pas présent dans les extraits fournis.`;

    const userPrompt = `Analyse ces discussions Reddit sur "${keyword}" et génère un article de comparaison ultra-honnête au format JSON.

RAPPEL CRITIQUE :
- Tu ne dois RIEN inventer : si une information n'apparaît pas dans les extraits, tu indiques clairement qu'elle est "Non précisée sur Reddit"
- Vérifie les spécifications techniques (Smart vs AR, écran vs pas d'écran, etc.)
- Utilise un ton tranché et sans compromis
- Extrais des citations Reddit réelles pour chaque défaut
- Utilise des listes à puces Markdown (-) pour les arguments clés et mets les éléments importants en **gras**
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

Réponds UNIQUEMENT avec un objet JSON valide contenant les champs : title, choice, defects (tableau avec citations), article (Markdown complet), products (tableau), userProfiles (texte), confidenceScore (nombre entier entre 0 et 100).`;

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

      const rawConfidence =
        typeof parsed.confidenceScore === 'number'
          ? parsed.confidenceScore
          : typeof parsed.confidence_score === 'number'
          ? parsed.confidence_score
          : undefined;

      const confidenceScore =
        typeof rawConfidence === 'number'
          ? Math.min(100, Math.max(0, Math.round(rawConfidence)))
          : 50;

      return {
        title: parsed.title || keyword,
        slug,
        choice: parsed.choice || 'Non identifié',
        defects: Array.isArray(parsed.defects) ? parsed.defects : [],
        article: parsed.article || '',
        products: Array.isArray(parsed.products) ? parsed.products : [],
        userProfiles: parsed.userProfiles || '',
        confidenceScore,
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

