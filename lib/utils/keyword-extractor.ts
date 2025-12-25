/**
 * Extrait le nom principal d'une phrase longue pour optimiser la recherche
 * Exemple: "Quel est le meilleur iPhone 15 Pro Max" -> "iPhone 15 Pro Max"
 */
export function extractMainKeyword(fullQuery: string): string {
  const query = fullQuery.trim();
  
  // Si la requête est déjà courte (< 30 caractères), la retourner telle quelle
  if (query.length < 30) {
    return query;
  }

  // Mots-clés à supprimer (questions, articles, etc.)
  const stopWords = [
    'quel', 'quelle', 'quels', 'quelles',
    'le', 'la', 'les', 'un', 'une', 'des',
    'meilleur', 'meilleure', 'meilleurs', 'meilleures',
    'bon', 'bonne', 'bons', 'bonnes',
    'top', 'tendance', 'recommandé', 'recommandée',
    'avis', 'test', 'comparaison', 'guide',
    'acheter', 'achetez', 'achat',
    'est', 'sont', 'être',
    'pour', 'avec', 'sans', 'sur', 'dans',
    'comment', 'pourquoi', 'quand', 'où',
    'vraiment', 'vraie', 'vrai',
    'vérité', 'honnête', 'honnêtes',
    'reddit', 'avis reddit', 'discussion reddit',
  ];

  // Nettoyer la requête : minuscules, supprimer ponctuation excessive
  let cleaned = query.toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, ' ')
    .trim();

  // Extraire les mots
  const words = cleaned.split(' ').filter(w => w.length > 0);

  // Supprimer les stop words en début et fin
  let startIndex = 0;
  let endIndex = words.length;

  // Supprimer les stop words au début
  while (startIndex < words.length && stopWords.includes(words[startIndex])) {
    startIndex++;
  }

  // Supprimer les stop words à la fin
  while (endIndex > startIndex && stopWords.includes(words[endIndex - 1])) {
    endIndex--;
  }

  // Extraire le nom principal
  const mainWords = words.slice(startIndex, endIndex);

  // Si on a encore trop de mots, prendre les 3-5 premiers mots significatifs
  if (mainWords.length > 5) {
    // Prioriser les mots qui ressemblent à des noms de produits (majuscules, chiffres, etc.)
    const significantWords = mainWords.filter((word, index) => {
      // Garder les mots avec chiffres (ex: "iPhone 15")
      if (/\d/.test(word)) return true;
      // Garder les mots en majuscules dans l'original (marques)
      const originalWord = query.split(' ')[index + startIndex];
      if (originalWord && originalWord[0] === originalWord[0].toUpperCase()) return true;
      // Garder les premiers mots significatifs
      return index < 5;
    });

    return significantWords.slice(0, 5).join(' ');
  }

  return mainWords.join(' ') || query; // Fallback vers la requête originale si vide
}

/**
 * Nettoie et normalise un mot-clé pour la recherche anti-duplication
 * Gère les variations : 'iphone 13' = 'iPhone 13' = 'IPHONE 13'
 * Supprime les accents, normalise les espaces, uniformise la casse
 * 
 * Cette fonction est CRITIQUE pour éviter le contenu dupliqué Google :
 * - Normalise toutes les variations de casse (majuscules/minuscules)
 * - Supprime les accents pour unifier les caractères
 * - Normalise les espaces multiples et la ponctuation
 * - Permet de détecter que 'iphone 13' = 'iPhone 13' = 'IPHONE 13'
 */
export function normalizeKeyword(keyword: string): string {
  if (!keyword || typeof keyword !== 'string') {
    return '';
  }
  
  return keyword
    .trim()
    .toLowerCase()
    // Normaliser les accents (é -> e, à -> a, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Normaliser les espaces multiples en un seul espace
    .replace(/\s+/g, ' ')
    // Supprimer la ponctuation sauf tirets et espaces
    .replace(/[^\w\s-]/g, '')
    // Supprimer les espaces en début/fin
    .trim();
}

/**
 * Normalisation avancée pour la détection de doublons
 * Transforme "L'iPhone 17 Pro !" en "iphone 17 pro"
 * Supprime les articles au début (le, la, l', les, the, un, une, a, an)
 * Supprime toute la ponctuation
 * Utilisée pour détecter que "iPhone 17" = "l'iPhone 17" = "Le iPhone 17"
 */
export function normalizeProductName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  return name
    .toLowerCase()
    // Supprimer les articles au début
    .replace(/^(l'|le |la |les |the |un |une |a |an )/i, '')
    // Supprimer toute la ponctuation
    .replace(/[^\w\s]/gi, '')
    // Enlever les espaces en trop
    .trim()
    // Remplacer les doubles espaces par un seul
    .replace(/\s+/g, ' ');
}

/**
 * Génère un slug normalisé à partir d'un titre ou mot-clé
 * Utilisé pour créer des URLs cohérentes et détecter les doublons
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}




