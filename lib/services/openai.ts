import OpenAI from 'openai';
import { SerperResult } from './serper';

export interface GeneratedReport {
  title: string;
  slug: string;
  choice: string; // Choix de la communauté (mappé depuis consensus + punchline pour compatibilité)
  defects: string[]; // Défauts rédhibitoires avec citations Reddit (mappé depuis cons[] pour compatibilité)
  article: string; // Article en Markdown (construit depuis les nouveaux champs pour compatibilité)
  products: string[]; // Liste des produits mentionnés
  userProfiles?: string; // Section "Est-ce fait pour vous ?" (mappé depuis recommendations[] pour compatibilité)
  confidenceScore?: number; // Score de confiance TruthMiner (0-100)
  category?: string; // Catégorie du produit (Électronique, Cosmétiques, Alimentation, Services)
  amazonSearchQuery?: string; // Requête de recherche Amazon optimisée et précise
  amazonRecommendationReason?: string; // Raison pour laquelle ce lien Amazon est proposé
  imageUrl?: string; // URL de l'image principale du produit
  // Nouveaux champs du format JSON strict (pour compatibilité future avec ReportDisplay.jsx)
  consensus?: string; // Le verdict principal de la communauté Reddit
  pros?: string[]; // Points forts avec citations Reddit uniques
  cons?: string[]; // Points faibles avec citations Reddit uniques
  final_verdict?: string; // Verdict final avec métaphore originale (remplace punchline)
  target_audience?: { // Profils ciblés (remplace recommendations)
    yes?: string; // Profil qui adorera ce produit
    no?: string; // Profil qui sera déçu
  };
  recommendations?: string[]; // Ancien format (pour compatibilité)
  punchline?: string; // Ancien format (pour compatibilité)
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
    const systemPrompt = `Tu es un journaliste d'investigation tech, honnête et factuel.
Tu analyses les discussions Reddit pour donner la vérité brute sur les produits.

OBJECTIFS PRINCIPAUX :
1. Faire une analyse Reddit honnête et factuelle
2. Générer un lien Amazon propre et pertinent
3. Identifier le produit principal pour la recherche d'image

IMPORTANT : Tu dois répondre UNIQUEMENT avec un objet JSON valide au format STRICT suivant :
{
  "title": "Titre percutant et descriptif",
  "consensus": "Une phrase percutante qui résume l'avis général de la communauté Reddit. Si c'est une mauvaise affaire, dis-le clairement dès le début.",
  "pros": ["Point fort 1 avec citation Reddit unique", "Point fort 2 avec citation Reddit unique"],
  "cons": ["Défaut caché 1 avec citation Reddit unique", "Défaut caché 2 avec citation Reddit unique"],
  "target_audience": {
    "yes": "Le profil type qui adorera ce produit (ex: Les sportifs intensifs). Une phrase ultra-courte.",
    "no": "Le profil type qui sera déçu (ex: Ceux qui cherchent la durabilité). Une phrase ultra-courte."
  },
  "final_verdict": "Un paragraphe court et brut, terminant par une métaphore originale (ex: Acheter ça, c'est comme...). NE PAS lister les pros/cons, donner une conclusion globale et émotionnelle.",
  "products": ["Nom du produit 1", "Nom du produit 2"],
  "confidenceScore": 0-100,
  "category": "Électronique" | "Cosmétiques" | "Alimentation" | "Services",
  "amazonSearchQuery": "Requête de recherche Amazon optimisée et précise",
  "amazonRecommendationReason": "Explication courte (1 phrase) de pourquoi ce lien Amazon est proposé",
  "imageUrl": null
}

RÈGLES DE VÉRIFICATION TECHNIQUE :
- Distingue TOUJOURS les produits "Smart" (caméra/audio comme Meta Ray-Ban) des produits "AR" (avec écran comme Xreal)
- Ne confonds JAMAIS les fonctionnalités : si un produit n'a pas d'écran, ne mentionne jamais d'écran
- Vérifie les spécifications techniques mentionnées dans les discussions Reddit avant de les citer
- Si tu n'es pas sûr d'une caractéristique technique, indique-le clairement plutôt que d'inventer

TON ET STYLE - CRITIQUE ET TRANCHANT :
- Ton : journaliste d'investigation tech **cynique, drôle et tranchant**, mais toujours factuel
- Tu peux être moqueur avec les produits ratés, mais jamais avec les utilisateurs
- **PRIORITÉ AU VERDICT** : Si le produit est une "mauvaise affaire en 2025", c'est l'élément CENTRAL du rapport, pas caché à la fin
- Le champ "consensus" doit IMMÉDIATEMENT donner le verdict : "Mauvaise affaire", "Excellent choix", "Mitigé", etc.
- Utilise des expressions tranchées : "Le consensus Reddit est sans appel", "Ce que le marketing vous cache", "La vérité que personne ne vous dit"
- Sois direct et sans langue de bois : "Non, ce n'est pas fait pour vous si...", "Si vous cherchez X, passez votre chemin"
- La "punchline" doit être percutante et résumer l'essence critique du verdict

STRUCTURE ÉPURÉE - PAS DE SOUS-TITRES REDONDANTS :
- Évite les titres redondants comme "Points forts" ET "Ce que la communauté apprécie" - choisis UN seul titre court et percutant
- Utilise des titres directs : "Points forts", "Points faibles", "Verdict", "Recommandations"
- Pas de sous-sections inutiles - va droit au but

CITATIONS REDDIT - ZÉRO RÉPÉTITION (RÈGLE ABSOLUE) :
- **INTERDICTION STRICTE** : Tu ne peux JAMAIS utiliser la même citation Reddit deux fois dans un même rapport
- Chaque citation doit être UNIQUE et utilisée UNE SEULE FOIS
- Si tu as déjà utilisé une citation dans "pros", tu ne peux PAS la réutiliser dans "cons" ou ailleurs
- Format pour chaque élément de "pros" et "cons" : "Description : '[citation exacte et unique]' - Un utilisateur Reddit"
- Exemple pros : "Autonomie exceptionnelle : 'J'ai tenu 3 jours sans recharger' - Un utilisateur Reddit"
- Exemple cons : "Surchauffe rapide : 'Mon unité devient brûlante au bout de 30 min' - Un utilisateur Reddit"
- Les citations doivent être extraites des extraits fournis, pas inventées
- Si tu manques de citations uniques, utilise des citations différentes pour chaque point, même si elles parlent du même sujet

Instructions détaillées pour le format JSON STRICT :
1. "title" : Un titre accrocheur, percutant et descriptif (ex: "La Poste et Colissimo : Quand le passage du facteur devient un casse-tête")
2. "consensus" : Le verdict principal en 1-2 phrases. Si c'est une mauvaise affaire, dis-le clairement. Exemple : "Le consensus Reddit est sans appel : La Poste et Colissimo sont une mauvaise affaire en 2025. Les avis de passage systématiques et les colis introuvables transforment chaque livraison en parcours du combattant."
3. "pros" : Tableau de points forts, CHACUN avec une citation Reddit UNIQUE. Format : "Point fort : '[citation exacte et unique]' - Un utilisateur Reddit". Minimum 2-3 points forts si disponibles.
4. "cons" : Tableau de points faibles, CHACUN avec une citation Reddit UNIQUE. Format : "Point faible : '[citation exacte et unique]' - Un utilisateur Reddit". Minimum 2-4 points faibles si disponibles.
5. "target_audience" : Objet avec deux champs ultra-courts (une phrase chacun) :
   - "yes" : Le profil type qui adorera ce produit (ex: "Les sportifs intensifs qui cherchent la performance pure.")
   - "no" : Le profil type qui sera déçu (ex: "Ceux qui cherchent la durabilité à long terme.")
6. "final_verdict" : Un paragraphe court et brut qui donne une conclusion globale et émotionnelle, terminant par une métaphore originale (ex: "Acheter ça, c'est comme essayer de vider l'océan avec une fourchette : frustrant et inutile."). 
   **RÈGLE D'OR** : Le 'final_verdict' ne doit PAS lister les pros/cons déjà mentionnés. Il doit donner une conclusion globale et émotionnelle.
7. "products" : Liste précise des noms des produits principaux mentionnés (pour les liens d'affiliation)
8. "amazonSearchQuery" : REQUÊTE DE RECHERCHE AMAZON OPTIMISÉE ET PRÉCISE. C'est CRUCIAL :
   - Tu dois extraire le **nom EXACT du modèle de produit le plus recommandé** (pas une catégorie générique)
   - Exemple : au lieu de "aspirateur", utilise "Roborock S8" si c'est le modèle précis cité par Reddit
   - Exemple : au lieu de "souris gaming", utilise "Logitech G Pro X Superlight" si c'est le modèle recommandé
   - Si le mot-clé est flou (ex: "Maison", "Tesla", "Gaming"), identifie l'objet PRÉCIS dont parle l'analyse
   - Si aucun produit physique précis n'est pertinent (service, logiciel), utilise une catégorie générale pertinente (ex: "VPN", "Logiciel de montage vidéo")
   - La requête doit être en français et optimisée pour Amazon.fr, en reprenant **le nom de modèle complet** tel qu'il apparaît dans les discussions
9. "amazonRecommendationReason" : EXPLICATION COURTE (1 phrase maximum) de pourquoi ce lien Amazon est proposé :
   - Exemple : "Nous avons sélectionné ce modèle car c'est la référence citée par les utilisateurs Reddit"
   - Exemple : "Basé sur votre intérêt pour l'autonomie Tesla, voici l'accessoire de charge le plus recommandé"
   - Exemple : "Ce produit correspond au choix de la communauté Reddit pour cette catégorie"
   - Si c'est un service/logiciel : "Redirection vers la catégorie générale la plus pertinente sur Amazon"
10. "confidenceScore" : Un entier entre 0 et 100 qui reflète le niveau de confiance global de la communauté Reddit vis-à-vis du produit :
   - 80-100 : avis très positifs et cohérents
   - 60-79 : plutôt positif mais avec des réserves
   - 40-59 : mitigé
   - 0-39 : majoritairement négatif
   Ce score doit être basé UNIQUEMENT sur le ton et la proportion des commentaires positifs / neutres / négatifs dans les discussions fournies, sans rien inventer.
11. "category" : Attribue UNE SEULE catégorie parmi : "Électronique", "Cosmétiques", "Alimentation", "Services". Choisis celle qui correspond le mieux au produit analysé en te basant sur le mot-clé ET le contenu des discussions Reddit :
   
   **"Électronique"** : Tous les produits physiques technologiques et électroniques
   - Matériel informatique : ordinateurs, laptops, tablettes, smartphones, écrans, moniteurs, imprimantes
   - Périphériques : souris, claviers, webcams, casques audio, écouteurs, enceintes, microphones
   - Gadgets tech : smartwatches, trackers fitness, drones, caméras, projecteurs, routeurs, NAS
   - Électronique grand public : téléviseurs, consoles de jeu, liseuses, appareils photo
   - Accessoires tech : chargeurs, batteries, câbles, hubs USB, étuis, supports
   
   **"Cosmétiques"** : Tous les produits de beauté, soins et hygiène personnelle
   - Soins de la peau : crèmes, sérums, nettoyants, exfoliants, masques, toners
   - Maquillage : fond de teint, rouge à lèvres, mascara, fard à paupières, pinceaux
   - Parfums et eaux de toilette
   - Produits capillaires : shampoings, après-shampoings, masques, colorations
   - Produits de rasage et épilation
   - Soins du corps : lotions, huiles, déodorants, savons
   
   **"Alimentation"** : Tous les produits alimentaires et boissons
   - Produits alimentaires : snacks, plats préparés, ingrédients, épices, conserves
   - Boissons : eaux, sodas, jus, thés, cafés, boissons énergisantes, alcools
   - Compléments alimentaires : vitamines, protéines, probiotiques, suppléments
   - Produits diététiques et bio
   - Équipement de cuisine : machines à café, robots, extracteurs
   
   **"Services"** : Tous les services numériques, logiciels et abonnements (PAS de produits physiques)
   - Services en ligne : VPN, stockage cloud, hébergement web, streaming
   - Logiciels et applications : suites bureautiques, outils de design, antivirus, gestion de projet
   - Services financiers : banques en ligne, applications de paiement, investissement
   - Services SaaS : CRM, email marketing, analytics, SEO tools
   - Abonnements : services de streaming, logiciels en abonnement
   
   **RÈGLE IMPORTANTE** : Si le produit est un OBJET PHYSIQUE que tu peux toucher, c'est "Électronique" ou "Cosmétiques" ou "Alimentation". Si c'est un SERVICE ou LOGICIEL, c'est "Services".

Sois factuel, honnête, tranché, et cite TOUJOURS les sources Reddit avec des citations exactes et UNIQUES. Ne crée aucune information technique ou avis qui ne soit pas présent dans les extraits fournis.`;

    const userPrompt = `Analyse ces discussions Reddit sur "${keyword}" et génère un rapport ultra-honnête au format JSON STRICT.

RAPPELS CRITIQUES :
- Tu ne dois RIEN inventer : si une information n'apparaît pas dans les extraits, tu indiques clairement qu'elle est "Non précisée sur Reddit"
- Vérifie les spécifications techniques (Smart vs AR, écran vs pas d'écran, etc.)
- Utilise un ton tranché et sans compromis - si c'est une mauvaise affaire, dis-le clairement dans "consensus"
- **ZÉRO RÉPÉTITION** : Chaque citation Reddit doit être UNIQUE et utilisée UNE SEULE FOIS dans tout le rapport
- Extrais des citations Reddit réelles et différentes pour chaque élément de "pros" et "cons"
- Structure épurée : pas de sous-titres redondants, va droit au but
- **RÈGLE D'OR pour final_verdict** : Ne PAS lister les pros/cons déjà mentionnés. Donner une conclusion globale et émotionnelle avec une métaphore originale à la fin
- **target_audience** : Ultra-court (une phrase par profil), direct et percutant

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

Réponds UNIQUEMENT avec un objet JSON valide contenant les champs STRICTS : title, consensus, pros (tableau avec citations UNIQUES), cons (tableau avec citations UNIQUES), target_audience (objet avec yes/no), final_verdict (paragraphe court avec métaphore, SANS lister les pros/cons), products (tableau), confidenceScore (nombre entier entre 0 et 100), category (une seule catégorie parmi : "Électronique", "Cosmétiques", "Alimentation", "Services"), amazonSearchQuery (requête de recherche Amazon optimisée), amazonRecommendationReason (explication courte du lien proposé).`;

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

      // Valider et corriger la catégorie avec détection automatique basée sur le mot-clé
      const validCategories = ['Électronique', 'Cosmétiques', 'Alimentation', 'Services'];
      let category = validCategories.includes(parsed.category) 
        ? parsed.category 
        : OpenAIService.detectCategoryFromKeyword(keyword); // Détection automatique si l'IA a mal catégorisé

      // Mapper le nouveau format JSON strict vers l'ancien format pour compatibilité
      // Nouveau format : consensus, pros[], cons[], target_audience {yes, no}, final_verdict
      // Ancien format : choice, defects[], article, userProfiles
      
      const consensus = parsed.consensus || parsed.choice || 'Non identifié';
      const pros = Array.isArray(parsed.pros) ? parsed.pros : [];
      const cons = Array.isArray(parsed.cons) ? parsed.cons : [];
      
      // Nouveau format : target_audience et final_verdict
      const targetAudience = parsed.target_audience || {};
      const finalVerdict = parsed.final_verdict || parsed.punchline || '';
      
      // Ancien format (pour compatibilité) : punchline et recommendations
      const punchline = finalVerdict; // final_verdict remplace punchline
      const recommendations: string[] = [];
      
      // Construire recommendations[] à partir de target_audience pour compatibilité
      if (targetAudience.yes) {
        recommendations.push(`Pour ${targetAudience.yes} : OUI`);
      }
      if (targetAudience.no) {
        recommendations.push(`Pour ${targetAudience.no} : NON`);
      }
      
      // Fallback : si recommendations existe déjà (ancien format), l'utiliser
      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        recommendations.push(...parsed.recommendations);
      }
      
      // Construire "choice" (ancien format) à partir de consensus + final_verdict si disponible
      const choice = finalVerdict 
        ? `${consensus} ${finalVerdict}`.trim()
        : consensus;
      
      // Construire "defects" (ancien format) à partir de cons[]
      const defects = cons;
      
      // Construire "article" (ancien format) à partir des nouveaux champs
      // Structure épurée sans sous-titres redondants
      const articleParts = [
        `## ${parsed.title || keyword}`,
        '',
        consensus,
        '',
        finalVerdict ? `> ${finalVerdict}` : '',
        '',
        '## Points forts',
        '',
        ...pros.map((pro: string) => `- ${pro}`),
        '',
        '## Points faibles',
        '',
        ...cons.map((con: string) => `- ${con}`),
        '',
        '## Est-ce fait pour vous ?',
        '',
        ...recommendations.map((rec: string) => `- ${rec}`),
      ];
      
      const article = articleParts.join('\n');
      
      // Construire "userProfiles" (ancien format) à partir de recommendations[]
      const userProfiles = recommendations.join('\n\n');

      const report = {
        title: parsed.title || keyword,
        slug, // IMPORTANT : Le slug doit être inclus dans le rapport
        choice, // Mappé depuis consensus + punchline
        defects, // Mappé depuis cons[]
        article, // Construit depuis les nouveaux champs
        products: Array.isArray(parsed.products) ? parsed.products : [],
        userProfiles, // Mappé depuis recommendations[]
        confidenceScore,
        category,
        amazonSearchQuery: parsed.amazonSearchQuery || parsed.amazon_search_query || keyword,
        amazonRecommendationReason: parsed.amazonRecommendationReason || parsed.amazon_recommendation_reason || 'Produit recommandé par la communauté Reddit',
        imageUrl: parsed.imageUrl || parsed.image_url || null,
        // Stocker aussi les nouveaux champs pour compatibilité future
        consensus: parsed.consensus,
        pros: parsed.pros,
        cons: parsed.cons,
        final_verdict: parsed.final_verdict || parsed.punchline,
        target_audience: parsed.target_audience,
        // Anciens champs pour compatibilité
        punchline: parsed.punchline || parsed.final_verdict,
        recommendations: recommendations.length > 0 ? recommendations : parsed.recommendations,
      };

      console.log('[OpenAI] Rapport généré avec slug:', report.slug);
      return report;
    } catch (error) {
      console.error('Erreur lors de la génération OpenAI:', error);
      if (error instanceof OpenAI.APIError) {
        throw new Error(`Erreur API OpenAI: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Détecte automatiquement la catégorie basée sur le mot-clé
   * Utilisé comme fallback si l'IA se trompe
   */
  public static detectCategoryFromKeyword(keyword: string): string {
    const lowerKeyword = keyword.toLowerCase();
    
    // Mots-clés pour Électronique
    const electroniqueKeywords = [
      'souris', 'mouse', 'clavier', 'keyboard', 'casque', 'headphone', 'écouteur', 'earbud',
      'écran', 'moniteur', 'screen', 'monitor', 'ordinateur', 'laptop', 'pc', 'macbook',
      'smartphone', 'iphone', 'android', 'tablette', 'tablet', 'ipad',
      'webcam', 'microphone', 'micro', 'enceinte', 'speaker', 'haut-parleur',
      'imprimante', 'printer', 'scanner', 'routeur', 'router', 'nas',
      'smartwatch', 'watch', 'montre', 'tracker', 'fitness', 'drone',
      'caméra', 'camera', 'appareil photo', 'projecteur', 'projector',
      'chargeur', 'charger', 'câble', 'cable', 'hub', 'usb', 'batterie',
      'console', 'playstation', 'xbox', 'nintendo', 'switch',
      'télévision', 'tv', 'television', 'liseuse', 'ereader', 'kindle'
    ];
    
    // Mots-clés pour Cosmétiques
    const cosmetiquesKeywords = [
      'crème', 'cream', 'sérum', 'serum', 'nettoyant', 'cleanser', 'exfoliant',
      'masque', 'mask', 'toner', 'maquillage', 'makeup', 'fond de teint',
      'rouge à lèvres', 'lipstick', 'mascara', 'fard', 'eyeshadow',
      'parfum', 'perfume', 'eau de toilette', 'cologne',
      'shampoing', 'shampoo', 'après-shampoing', 'conditioner', 'coloration',
      'rasage', 'shaving', 'épilation', 'déodorant', 'deodorant',
      'savon', 'soap', 'lotion', 'huile', 'oil', 'beauté', 'beauty'
    ];
    
    // Mots-clés pour Alimentation
    const alimentationKeywords = [
      'café', 'coffee', 'thé', 'tea', 'boisson', 'drink', 'eau', 'water',
      'snack', 'aliment', 'food', 'nourriture', 'repas', 'meal',
      'complément', 'supplement', 'vitamine', 'vitamin', 'protéine', 'protein',
      'machine à café', 'coffee machine', 'robot', 'robot cuisine', 'extracteur',
      'épice', 'spice', 'conserves', 'canned', 'bio', 'organic'
    ];
    
    // Mots-clés pour Services
    const servicesKeywords = [
      'vpn', 'vpn service', 'logiciel', 'software', 'application', 'app',
      'banque en ligne', 'online bank', 'banque', 'bank',
      'streaming', 'netflix', 'spotify', 'disney', 'prime',
      'cloud', 'stockage', 'storage', 'hébergement', 'hosting',
      'crm', 'saas', 'seo tool', 'outil seo', 'analytics',
      'antivirus', 'antivirus software', 'suite bureautique', 'office suite',
      'abonnement', 'subscription', 'service'
    ];
    
    // Vérifier dans l'ordre de priorité
    if (electroniqueKeywords.some(kw => lowerKeyword.includes(kw))) {
      return 'Électronique';
    }
    if (cosmetiquesKeywords.some(kw => lowerKeyword.includes(kw))) {
      return 'Cosmétiques';
    }
    if (alimentationKeywords.some(kw => lowerKeyword.includes(kw))) {
      return 'Alimentation';
    }
    if (servicesKeywords.some(kw => lowerKeyword.includes(kw))) {
      return 'Services';
    }
    
    // Par défaut, Services (car c'est souvent des services en ligne)
    return 'Services';
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

