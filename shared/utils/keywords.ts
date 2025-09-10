
export function normalizeTags(input: string[]): string[] {
  return [...new Set(
    input
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
  )];
}

export function expandSynonyms(tags: string[]): string[] {
  const synonymDict: Record<string, string> = {
    // Développement web
    "dev web": "développement web",
    "webdev": "développement web",
    "frontend": "développement frontend",
    "backend": "développement backend",
    "fullstack": "développement full-stack",
    "full stack": "développement full-stack",
    
    // Technologies
    "js": "javascript",
    "ts": "typescript",
    "react.js": "react",
    "vue.js": "vue",
    "node.js": "nodejs",
    "express.js": "express",
    
    // Marketing digital
    "seo": "référencement naturel",
    "sea": "référencement payant",
    "adwords": "google ads",
    "fb ads": "facebook ads",
    "social media": "réseaux sociaux",
    "community management": "gestion communauté",
    
    // Design
    "ui": "interface utilisateur",
    "ux": "expérience utilisateur",
    "ui/ux": "design interface",
    "webdesign": "design web",
    "graphisme": "design graphique",
    
    // Métiers
    "plombier": "plomberie",
    "electricien": "électricité",
    "peintre": "peinture",
    "menuisier": "menuiserie",
    "carreleur": "carrelage",
    
    // Services
    "nettoyage": "ménage",
    "entretien": "maintenance",
    "dépannage": "réparation",
    "installation": "pose",
    
    // Business
    "compta": "comptabilité",
    "rh": "ressources humaines",
    "commercial": "vente",
    "marketing": "marketing digital",
  };

  const expanded = tags.map(tag => synonymDict[tag] || tag);
  return normalizeTags([...tags, ...expanded]);
}

export function suggestKeywords(text: string): string[] {
  const commonKeywords = [
    // Tech
    "développement web", "react", "nodejs", "typescript", "javascript", "python", "php",
    "wordpress", "prestashop", "magento", "drupal", "symfony", "laravel",
    "mobile", "flutter", "react native", "ios", "android",
    "base de données", "mysql", "postgresql", "mongodb",
    "cloud", "aws", "azure", "google cloud",
    "devops", "docker", "kubernetes", "ci/cd",
    
    // Design
    "design web", "ui/ux", "figma", "adobe", "photoshop", "illustrator",
    "identité visuelle", "logo", "charte graphique", "print",
    
    // Marketing
    "référencement naturel", "seo", "sea", "google ads", "facebook ads",
    "réseaux sociaux", "content marketing", "email marketing",
    "analytics", "google analytics", "conversion",
    
    // Services
    "plomberie", "électricité", "peinture", "menuiserie", "carrelage",
    "ménage", "jardinage", "déménagement", "réparation",
    "formation", "conseil", "audit", "coaching",
    
    // Business
    "comptabilité", "ressources humaines", "vente", "commercial",
    "gestion projet", "stratégie", "innovation"
  ];

  const lowerText = text.toLowerCase();
  return commonKeywords.filter(keyword => 
    lowerText.includes(keyword) || 
    keyword.split(' ').every(word => lowerText.includes(word))
  );
}

export function getSkillSuggestions(role: "client" | "provider", keywords: string[]): Array<{ name: string; level?: 1|2|3|4|5 }> {
  const skillMapping: Record<string, number> = {
    // Tech skills avec niveaux par défaut
    "javascript": 3,
    "typescript": 3,
    "react": 3,
    "nodejs": 3,
    "python": 3,
    "php": 3,
    "wordpress": 4,
    "développement web": 4,
    "design web": 3,
    "seo": 3,
    "marketing digital": 3,
    
    // Métiers artisanaux
    "plomberie": 4,
    "électricité": 4,
    "peinture": 4,
    "menuiserie": 4,
    
    // Services
    "ménage": 4,
    "jardinage": 3,
    "réparation": 3,
    "formation": 3,
    "conseil": 3
  };

  return keywords
    .filter(keyword => skillMapping[keyword])
    .map(keyword => ({
      name: keyword,
      level: (skillMapping[keyword] || 3) as 1|2|3|4|5
    }));
}

// Utilitaires supplémentaires pour la gestion des mots-clés
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 10); // Limiter à 10 mots-clés
}

export function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase().trim();
}

export function matchKeywords(keywords1: string[], keywords2: string[]): number {
  const set1 = new Set(keywords1.map(normalizeKeyword));
  const set2 = new Set(keywords2.map(normalizeKeyword));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}
