
import csv
import logging
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass
import re
from collections import defaultdict

logger = logging.getLogger(__name__)

@dataclass
class TaxonomyResult:
    category_std: str
    sub_category_std: str
    skills_std: List[str]
    tags_std: List[str]
    confidence: float

class Taxonomizer:
    def __init__(self, data_path: str = "/infra/data"):
        self.data_path = Path(data_path)
        self.taxonomy_data = {}
        self.skills_mapping = {}
        self.category_keywords = defaultdict(list)
        self._load_taxonomy_data()

    def _load_taxonomy_data(self):
        """Charge les données de taxonomie depuis les fichiers CSV"""
        try:
            # Chargement de la taxonomie des compétences
            taxonomy_file = self.data_path / "taxonomy_skills_fr.csv"
            if taxonomy_file.exists():
                with open(taxonomy_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        category = row['category']
                        sub_category = row['sub_category']
                        skill = row['skill']
                        keywords = row.get('keywords', '').split(',')
                        
                        if category not in self.taxonomy_data:
                            self.taxonomy_data[category] = {}
                        if sub_category not in self.taxonomy_data[category]:
                            self.taxonomy_data[category][sub_category] = []
                        
                        self.taxonomy_data[category][sub_category].append({
                            'skill': skill,
                            'keywords': [k.strip().lower() for k in keywords if k.strip()]
                        })
                        
                        # Index pour la recherche par mots-clés
                        for keyword in keywords:
                            if keyword.strip():
                                self.category_keywords[keyword.strip().lower()].append({
                                    'category': category,
                                    'sub_category': sub_category,
                                    'skill': skill
                                })
            
            logger.info(f"Taxonomie chargée: {len(self.taxonomy_data)} catégories")
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement de la taxonomie: {e}")
            self._init_default_taxonomy()

    def _init_default_taxonomy(self):
        """Initialise une taxonomie par défaut"""
        self.taxonomy_data = {
            "développement": {
                "web": [
                    {"skill": "React", "keywords": ["react", "reactjs", "jsx"]},
                    {"skill": "Vue.js", "keywords": ["vue", "vuejs", "nuxt"]},
                    {"skill": "Node.js", "keywords": ["node", "nodejs", "express"]},
                    {"skill": "PHP", "keywords": ["php", "laravel", "symfony"]},
                    {"skill": "Python", "keywords": ["python", "django", "flask"]},
                ],
                "mobile": [
                    {"skill": "React Native", "keywords": ["react native", "rn"]},
                    {"skill": "Flutter", "keywords": ["flutter", "dart"]},
                    {"skill": "iOS", "keywords": ["ios", "swift", "objective-c"]},
                    {"skill": "Android", "keywords": ["android", "kotlin", "java"]},
                ]
            },
            "design": {
                "ui_ux": [
                    {"skill": "Figma", "keywords": ["figma", "design"]},
                    {"skill": "Adobe XD", "keywords": ["xd", "adobe xd"]},
                    {"skill": "Sketch", "keywords": ["sketch"]},
                ],
                "graphique": [
                    {"skill": "Photoshop", "keywords": ["photoshop", "ps"]},
                    {"skill": "Illustrator", "keywords": ["illustrator", "ai"]},
                ]
            },
            "marketing": {
                "digital": [
                    {"skill": "SEO", "keywords": ["seo", "référencement", "google", "ranking"]},
                    {"skill": "Google Ads", "keywords": ["google ads", "adwords", "ppc", "sem"]},
                    {"skill": "Facebook Ads", "keywords": ["facebook ads", "fb ads", "meta ads"]},
                    {"skill": "Analytics", "keywords": ["analytics", "tracking", "métriques"]},
                ],
                "contenu": [
                    {"skill": "Rédaction", "keywords": ["rédaction", "contenu", "blog", "articles"]},
                    {"skill": "Copywriting", "keywords": ["copywriting", "copy", "conversion"]},
                    {"skill": "Social Media", "keywords": ["social media", "réseaux sociaux", "community"]},
                ]
            },
            "data-science": {
                "analyse": [
                    {"skill": "Python", "keywords": ["python", "pandas", "numpy"]},
                    {"skill": "Machine Learning", "keywords": ["ml", "ai", "algorithme", "modèle"]},
                    {"skill": "SQL", "keywords": ["sql", "base de données", "requêtes"]},
                ],
                "visualisation": [
                    {"skill": "Tableau", "keywords": ["tableau", "dashboard", "viz"]},
                    {"skill": "Power BI", "keywords": ["power bi", "microsoft", "business intelligence"]},
                ]
            },
            "consulting": {
                "stratégie": [
                    {"skill": "Business Plan", "keywords": ["business plan", "stratégie", "conseil"]},
                    {"skill": "Audit", "keywords": ["audit", "analyse", "diagnostic"]},
                ],
                "formation": [
                    {"skill": "Formation", "keywords": ["formation", "coaching", "accompagnement"]},
                ]
            }
        }

    def classify(self, text: str, keywords: List[str] = None) -> TaxonomyResult:
        """Classifie un texte selon la taxonomie"""
        text_lower = text.lower()
        all_keywords = keywords or []
        
        # Extraction des mots-clés du texte
        text_keywords = self._extract_keywords_from_text(text_lower)
        all_keywords.extend(text_keywords)
        
        # Scoring par catégorie/sous-catégorie
        category_scores = defaultdict(lambda: defaultdict(float))
        matched_skills = defaultdict(list)
        matched_tags = []
        
        for keyword in all_keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in self.category_keywords:
                for match in self.category_keywords[keyword_lower]:
                    category = match['category']
                    sub_category = match['sub_category']
                    skill = match['skill']
                    
                    category_scores[category][sub_category] += 1.0
                    if skill not in matched_skills[(category, sub_category)]:
                        matched_skills[(category, sub_category)].append(skill)
                    
                    if keyword not in matched_tags:
                        matched_tags.append(keyword)
        
        # Recherche directe dans le texte
        for category, sub_categories in self.taxonomy_data.items():
            for sub_category, skills in sub_categories.items():
                for skill_info in skills:
                    skill_name = skill_info['skill']
                    skill_keywords = skill_info['keywords']
                    
                    # Vérification de la présence des mots-clés dans le texte
                    for keyword in skill_keywords:
                        if keyword in text_lower:
                            category_scores[category][sub_category] += 0.8
                            if skill_name not in matched_skills[(category, sub_category)]:
                                matched_skills[(category, sub_category)].append(skill_name)
                            if keyword not in matched_tags:
                                matched_tags.append(keyword)
        
        # Sélection de la meilleure catégorie/sous-catégorie
        best_category = None
        best_sub_category = None
        best_score = 0.0
        
        for category, sub_cats in category_scores.items():
            for sub_category, score in sub_cats.items():
                if score > best_score:
                    best_score = score
                    best_category = category
                    best_sub_category = sub_category
        
        # Résultat par défaut si aucune correspondance
        if not best_category:
            best_category = "services"
            best_sub_category = "généraliste"
            confidence = 0.1
        else:
            confidence = min(best_score / 5.0, 1.0)  # Normalisation
        
        # Compétences correspondantes
        skills_std = matched_skills.get((best_category, best_sub_category), [])
        
        return TaxonomyResult(
            category_std=best_category,
            sub_category_std=best_sub_category,
            skills_std=skills_std[:10],  # Limite à 10 compétences
            tags_std=matched_tags[:15],  # Limite à 15 tags
            confidence=confidence
        )

    def _extract_keywords_from_text(self, text: str) -> List[str]:
        """Extrait les mots-clés techniques du texte"""
        # Patterns pour identifier les technologies/compétences
        tech_patterns = [
            r'\b(?:react|vue|angular|node|php|python|java|javascript|typescript)\b',
            r'\b(?:html|css|sass|scss|bootstrap|tailwind)\b',
            r'\b(?:mysql|postgresql|mongodb|redis|elasticsearch)\b',
            r'\b(?:aws|azure|gcp|docker|kubernetes)\b',
            r'\b(?:figma|sketch|photoshop|illustrator|xd)\b',
            r'\b(?:seo|sem|google ads|facebook ads|instagram)\b',
        ]
        
        keywords = []
        for pattern in tech_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            keywords.extend(matches)
        
        return list(set(keywords))  # Déduplication

    def suggest_improvements(self, current_category: str, current_skills: List[str]) -> Dict[str, any]:
        """Suggère des améliorations pour la classification"""
        suggestions = {
            'missing_skills': [],
            'related_categories': [],
            'skill_alternatives': {}
        }
        
        # Recherche des compétences manquantes dans la même catégorie
        if current_category in self.taxonomy_data:
            for sub_category, skills in self.taxonomy_data[current_category].items():
                for skill_info in skills:
                    skill_name = skill_info['skill']
                    if skill_name not in current_skills:
                        suggestions['missing_skills'].append({
                            'skill': skill_name,
                            'sub_category': sub_category,
                            'keywords': skill_info['keywords']
                        })
        
        # Catégories liées
        for category in self.taxonomy_data.keys():
            if category != current_category:
                suggestions['related_categories'].append(category)
        
        return suggestions

    def get_category_stats(self) -> Dict[str, any]:
        """Retourne les statistiques de la taxonomie"""
        stats = {
            'total_categories': len(self.taxonomy_data),
            'total_subcategories': 0,
            'total_skills': 0,
            'categories': {}
        }
        
        for category, sub_categories in self.taxonomy_data.items():
            sub_count = len(sub_categories)
            skill_count = sum(len(skills) for skills in sub_categories.values())
            
            stats['total_subcategories'] += sub_count
            stats['total_skills'] += skill_count
            
            stats['categories'][category] = {
                'subcategories': sub_count,
                'skills': skill_count
            }
        
        return stats
