
"""
Service de normalisation et structuration des briefs
Sert à rendre les annonces comparables et exploitables
"""

import re
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import spacy
from fuzzywuzzy import fuzz

@dataclass
class NormalizedBrief:
    title_std: str
    summary_std: str
    category_std: str
    sub_category_std: str
    tags_std: List[str]
    skills_std: List[str]
    constraints_std: List[str]
    completeness_score: int
    missing_info: List[str]
    ambiguities: List[str]
    structured: Dict

class NormalizeService:
    """Normalise et structure un brief client"""
    
    def __init__(self):
        self.taxonomies = self._load_taxonomies()
        self.skills_db = self._load_skills()
        
    def _load_taxonomies(self) -> Dict:
        """Charge la taxonomie depuis la DB ou fichier"""
        # V0: taxonomie simple en dur
        return {
            "développement web": ["site", "web", "react", "vue", "javascript", "php"],
            "design graphique": ["logo", "graphisme", "photoshop", "illustrator", "figma"],
            "marketing digital": ["seo", "adwords", "facebook", "social", "publicité"],
            "rédaction": ["article", "blog", "contenu", "copywriting", "texte"],
            "e-commerce": ["boutique", "vente", "prestashop", "woocommerce"]
        }
    
    def _load_skills(self) -> List[str]:
        """Base de compétences pour extraction"""
        return [
            "React", "Vue.js", "Angular", "JavaScript", "TypeScript", "Python",
            "PHP", "Node.js", "WordPress", "Photoshop", "Illustrator", "Figma",
            "SEO", "Google Ads", "Facebook Ads", "Instagram", "TikTok"
        ]
    
    def normalize(self, title: str, description: str, category: str = None) -> NormalizedBrief:
        """Normalise un brief complet"""
        
        # Nettoyage de base
        title_clean = self._clean_text(title)
        desc_clean = self._clean_text(description)
        
        # Détection catégorie si pas fournie
        if not category:
            category = self._detect_category(title_clean + " " + desc_clean)
        
        # Extraction skills
        skills = self._extract_skills(desc_clean)
        
        # Tags automatiques
        tags = self._generate_tags(title_clean, desc_clean, category)
        
        # Score complétude
        completeness, missing = self._calculate_completeness(title, description)
        
        # Détection ambiguïtés
        ambiguities = self._detect_ambiguities(description)
        
        # Structure enrichie
        structured = {
            "original_title": title,
            "original_description": description,
            "detected_skills": skills,
            "estimated_complexity": self._estimate_complexity(description),
            "word_count": len(description.split()),
            "has_technical_terms": len(skills) > 0,
            "urgency_detected": self._detect_urgency(description)
        }
        
        return NormalizedBrief(
            title_std=title_clean,
            summary_std=desc_clean[:500] + "..." if len(desc_clean) > 500 else desc_clean,
            category_std=category,
            sub_category_std="general",
            tags_std=tags,
            skills_std=skills,
            constraints_std=self._extract_constraints(description),
            completeness_score=completeness,
            missing_info=missing,
            ambiguities=ambiguities,
            structured=structured
        )
    
    def _clean_text(self, text: str) -> str:
        """Nettoyage basique du texte"""
        if not text:
            return ""
        
        # Supprime caractères spéciaux
        text = re.sub(r'[^\w\s\-.,!?]', ' ', text)
        # Normalise espaces
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def _detect_category(self, text: str) -> str:
        """Détecte la catégorie principale"""
        text_lower = text.lower()
        
        best_match = "autre"
        best_score = 0
        
        for category, keywords in self.taxonomies.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > best_score:
                best_score = score
                best_match = category
        
        return best_match
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extrait les compétences mentionnées"""
        found_skills = []
        text_lower = text.lower()
        
        for skill in self.skills_db:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def _generate_tags(self, title: str, description: str, category: str) -> List[str]:
        """Génère des tags automatiques"""
        tags = [category]
        
        # Mots-clés fréquents
        keywords = ["urgent", "pro", "qualité", "rapide", "budget", "délai"]
        text = (title + " " + description).lower()
        
        for keyword in keywords:
            if keyword in text:
                tags.append(keyword)
        
        return list(set(tags))
    
    def _calculate_completeness(self, title: str, description: str) -> Tuple[int, List[str]]:
        """Calcule le score de complétude"""
        score = 0
        missing = []
        
        # Titre présent et descriptif
        if title and len(title) > 10:
            score += 20
        else:
            missing.append("Titre trop court")
        
        # Description détaillée
        if description and len(description.split()) > 20:
            score += 30
        else:
            missing.append("Description trop courte")
        
        # Informations techniques
        if any(word in description.lower() for word in ["délai", "budget", "livrable"]):
            score += 25
        else:
            missing.append("Contraintes (délai, budget, livrables)")
        
        # Contexte
        if any(word in description.lower() for word in ["pour", "afin", "objectif", "but"]):
            score += 15
        else:
            missing.append("Contexte et objectifs")
        
        # Critères qualité
        if any(word in description.lower() for word in ["qualité", "expérience", "référence"]):
            score += 10
        else:
            missing.append("Critères de sélection")
        
        return min(score, 100), missing
    
    def _detect_ambiguities(self, description: str) -> List[str]:
        """Détecte les ambiguïtés potentielles"""
        ambiguities = []
        desc_lower = description.lower()
        
        if "quelque chose" in desc_lower or "truc" in desc_lower:
            ambiguities.append("Termes vagues utilisés")
        
        if "pas cher" in desc_lower and "qualité" in desc_lower:
            ambiguities.append("Contradiction budget/qualité")
        
        if len(description.split()) < 15:
            ambiguities.append("Description trop courte")
        
        return ambiguities
    
    def _estimate_complexity(self, description: str) -> int:
        """Estime la complexité (1-10)"""
        complexity = 3  # Base
        
        # Facteurs de complexité
        tech_words = ["api", "base de données", "intégration", "migration", "sécurité"]
        complexity += sum(1 for word in tech_words if word in description.lower())
        
        # Longueur
        word_count = len(description.split())
        if word_count > 100:
            complexity += 2
        elif word_count > 50:
            complexity += 1
        
        return min(complexity, 10)
    
    def _extract_constraints(self, description: str) -> List[str]:
        """Extrait les contraintes mentionnées"""
        constraints = []
        desc_lower = description.lower()
        
        if "urgent" in desc_lower:
            constraints.append("Délai urgent")
        
        if "budget" in desc_lower or "€" in description:
            constraints.append("Budget limité")
        
        if "responsive" in desc_lower or "mobile" in desc_lower:
            constraints.append("Compatible mobile")
        
        return constraints
    
    def _detect_urgency(self, description: str) -> bool:
        """Détecte si la mission est urgente"""
        urgent_words = ["urgent", "rapidement", "vite", "asap", "immédiat"]
        return any(word in description.lower() for word in urgent_words)

# Service global
normalize_service = NormalizeService()

def normalize_brief(title: str, description: str, category: str = None) -> dict:
    """Interface simple pour l'API"""
    result = normalize_service.normalize(title, description, category)
    
    return {
        "title_std": result.title_std,
        "summary_std": result.summary_std,
        "category_std": result.category_std,
        "sub_category_std": result.sub_category_std,
        "tags_std": result.tags_std,
        "skills_std": result.skills_std,
        "constraints_std": result.constraints_std,
        "completeness_score": result.completeness_score,
        "missing_info": result.missing_info,
        "ambiguities": result.ambiguities,
        "structured": result.structured
    }
