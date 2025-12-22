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
 * Nettoie et normalise un mot-clé pour la recherche
 */
export function normalizeKeyword(keyword: string): string {
  return keyword
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .trim();
}


