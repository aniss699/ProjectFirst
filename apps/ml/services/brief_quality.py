
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import re
from text_normalizer import TextNormalizer

logger = logging.getLogger(__name__)

@dataclass
class QualityAnalysis:
    brief_quality_score: float
    richness_score: float
    missing_info: List[Dict[str, any]]
    strengths: List[str]
    improvements: List[str]
    completeness_percentage: float

class BriefQualityAnalyzer:
    def __init__(self):
        self.text_normalizer = TextNormalizer()
        self._init_quality_criteria()

    def _init_quality_criteria(self):
        """Initialise les critères de qualité"""
        self.quality_criteria = {
            'essential_info': {
                'objective': {
                    'weight': 0.25,
                    'keywords': ['objectif', 'but', 'goal', 'finalité', 'pourquoi'],
                    'questions': [
                        'Quel est l\'objectif principal de ce projet ?',
                        'Quels résultats attendez-vous ?',
                        'À quoi servira cette réalisation ?'
                    ]
                },
                'scope': {
                    'weight': 0.20,
                    'keywords': ['périmètre', 'inclus', 'exclus', 'limites', 'scope'],
                    'questions': [
                        'Quel est le périmètre exact du projet ?',
                        'Que doit-on inclure/exclure ?',
                        'Quelles sont les limites à respecter ?'
                    ]
                },
                'requirements': {
                    'weight': 0.20,
                    'keywords': ['exigences', 'requis', 'nécessaire', 'obligatoire', 'contraintes'],
                    'questions': [
                        'Quelles sont vos exigences techniques ?',
                        'Y a-t-il des contraintes particulières ?',
                        'Quels standards devons-nous respecter ?'
                    ]
                },
                'deliverables': {
                    'weight': 0.15,
                    'keywords': ['livrable', 'résultat', 'produit', 'fichier', 'format'],
                    'questions': [
                        'Quels sont les livrables attendus ?',
                        'Dans quels formats souhaitez-vous les recevoir ?',
                        'Quelles sont vos attentes de qualité ?'
                    ]
                },
                'timeline': {
                    'weight': 0.10,
                    'keywords': ['délai', 'planning', 'échéance', 'timing', 'quand'],
                    'questions': [
                        'Quelle est votre échéance souhaitée ?',
                        'Y a-t-il des dates clés à respecter ?',
                        'Le projet est-il urgent ?'
                    ]
                },
                'budget': {
                    'weight': 0.10,
                    'keywords': ['budget', 'prix', 'coût', 'tarif', 'combien'],
                    'questions': [
                        'Quel est votre budget prévisionnel ?',
                        'Avez-vous une enveloppe budgétaire définie ?',
                        'Préférez-vous un forfait ou du temps passé ?'
                    ]
                }
            },
            'quality_indicators': {
                'specificity': {
                    'weight': 0.3,
                    'min_score': 3,  # Minimum de détails spécifiques
                    'keywords': ['précisément', 'exactement', 'spécifiquement', 'notamment']
                },
                'clarity': {
                    'weight': 0.2,
                    'min_words': 50,  # Minimum de mots pour être clair
                    'structure_bonus': 0.1  # Bonus si bien structuré
                },
                'completeness': {
                    'weight': 0.3,
                    'min_sections': 3  # Minimum de sections couvertes
                },
                'technical_depth': {
                    'weight': 0.2,
                    'tech_keywords': ['api', 'database', 'frontend', 'backend', 'responsive', 'mobile']
                }
            }
        }

    def analyze(self, title: str, description: str, category: str = None) -> QualityAnalysis:
        """Analyse la qualité d'un brief"""
        
        # Normalisation du texte
        normalized = self.text_normalizer.normalize(description)
        full_text = f"{title} {description}".lower()
        
        # Analyse des informations essentielles
        essential_scores = self._analyze_essential_info(full_text)
        
        # Analyse des indicateurs de qualité
        quality_scores = self._analyze_quality_indicators(title, description, normalized)
        
        # Calcul des scores globaux
        brief_quality_score = self._calculate_brief_quality_score(essential_scores, quality_scores)
        richness_score = self._calculate_richness_score(normalized, quality_scores)
        
        # Identification des informations manquantes
        missing_info = self._identify_missing_info(essential_scores, full_text)
        
        # Identification des forces et améliorations
        strengths = self._identify_strengths(essential_scores, quality_scores)
        improvements = self._identify_improvements(essential_scores, quality_scores, missing_info)
        
        # Calcul du pourcentage de complétude
        completeness_percentage = self._calculate_completeness(essential_scores)
        
        return QualityAnalysis(
            brief_quality_score=brief_quality_score,
            richness_score=richness_score,
            missing_info=missing_info,
            strengths=strengths,
            improvements=improvements,
            completeness_percentage=completeness_percentage
        )

    def _analyze_essential_info(self, text: str) -> Dict[str, float]:
        """Analyse la présence des informations essentielles"""
        scores = {}
        
        for info_type, criteria in self.quality_criteria['essential_info'].items():
            score = 0.0
            keywords = criteria['keywords']
            
            # Recherche des mots-clés
            keyword_matches = sum(1 for keyword in keywords if keyword in text)
            if keyword_matches > 0:
                score += min(keyword_matches / len(keywords), 1.0) * 0.6
            
            # Bonus pour phrases complètes sur le sujet
            if info_type == 'objective' and any(word in text for word in ['pour', 'afin', 'objectif']):
                score += 0.3
            elif info_type == 'scope' and any(word in text for word in ['inclure', 'périmètre', 'comprend']):
                score += 0.3
            elif info_type == 'requirements' and any(word in text for word in ['doit', 'exige', 'nécessaire']):
                score += 0.3
            elif info_type == 'deliverables' and any(word in text for word in ['livrer', 'fournir', 'remettre']):
                score += 0.3
            elif info_type == 'timeline' and any(word in text for word in ['avant', 'délai', 'échéance']):
                score += 0.3
            elif info_type == 'budget' and any(word in text for word in ['€', 'euro', 'budget', 'prix']):
                score += 0.4
            
            scores[info_type] = min(score, 1.0)
        
        return scores

    def _analyze_quality_indicators(self, title: str, description: str, normalized) -> Dict[str, float]:
        """Analyse les indicateurs de qualité"""
        scores = {}
        
        # Spécificité
        specific_details = len([word for word in normalized.keywords if len(word) > 5])
        specificity_score = min(specific_details / 10, 1.0)  # Normalisation sur 10 détails
        scores['specificity'] = specificity_score
        
        # Clarté
        word_count = len(description.split())
        clarity_score = min(word_count / 100, 1.0)  # Normalisation sur 100 mots
        
        # Bonus pour structure (phrases courtes, paragraphes)
        sentences = len([s for s in description.split('.') if len(s.strip()) > 10])
        if sentences >= 3:
            clarity_score += 0.1
        
        scores['clarity'] = min(clarity_score, 1.0)
        
        # Complétude
        sections_covered = sum(1 for score in self._analyze_essential_info(f"{title} {description}".lower()).values() if score > 0.3)
        completeness_score = sections_covered / len(self.quality_criteria['essential_info'])
        scores['completeness'] = completeness_score
        
        # Profondeur technique
        tech_keywords = self.quality_criteria['quality_indicators']['technical_depth']['tech_keywords']
        tech_mentions = sum(1 for keyword in tech_keywords if keyword in description.lower())
        tech_score = min(tech_mentions / 3, 1.0)  # Normalisation sur 3 mentions
        scores['technical_depth'] = tech_score
        
        return scores

    def _calculate_brief_quality_score(self, essential_scores: Dict[str, float], quality_scores: Dict[str, float]) -> float:
        """Calcule le score global de qualité du brief"""
        
        # Score pondéré des informations essentielles
        essential_weight_sum = sum(self.quality_criteria['essential_info'][key]['weight'] for key in essential_scores.keys())
        essential_score = sum(
            score * self.quality_criteria['essential_info'][key]['weight'] 
            for key, score in essential_scores.items()
        ) / essential_weight_sum if essential_weight_sum > 0 else 0
        
        # Score pondéré des indicateurs de qualité
        quality_weight_sum = sum(self.quality_criteria['quality_indicators'][key]['weight'] for key in quality_scores.keys())
        quality_score = sum(
            score * self.quality_criteria['quality_indicators'][key]['weight']
            for key, score in quality_scores.items()
        ) / quality_weight_sum if quality_weight_sum > 0 else 0
        
        # Moyenne pondérée (70% essentiel, 30% qualité)
        return essential_score * 0.7 + quality_score * 0.3

    def _calculate_richness_score(self, normalized, quality_scores: Dict[str, float]) -> float:
        """Calcule le score de richesse du contenu"""
        
        # Facteurs de richesse
        factors = {
            'keyword_diversity': min(len(set(normalized.keywords)) / 15, 1.0),  # Diversité des mots-clés
            'constraint_specificity': min(len(normalized.constraints) / 5, 1.0),  # Spécificité des contraintes
            'quantity_precision': min(len(normalized.quantities) / 3, 1.0),  # Précision quantitative
            'technical_depth': quality_scores.get('technical_depth', 0)
        }
        
        # Moyenne pondérée
        weights = [0.3, 0.3, 0.2, 0.2]
        return sum(score * weight for score, weight in zip(factors.values(), weights))

    def _identify_missing_info(self, essential_scores: Dict[str, float], text: str) -> List[Dict[str, any]]:
        """Identifie les informations manquantes importantes"""
        missing = []
        
        for info_type, score in essential_scores.items():
            if score < 0.5:  # Seuil de présence insuffisante
                criteria = self.quality_criteria['essential_info'][info_type]
                missing.append({
                    'type': info_type,
                    'importance': 'high' if criteria['weight'] > 0.15 else 'medium',
                    'questions': criteria['questions'],
                    'current_score': score
                })
        
        # Tri par importance (poids décroissant)
        missing.sort(key=lambda x: self.quality_criteria['essential_info'][x['type']]['weight'], reverse=True)
        
        return missing[:5]  # Limite à 5 questions prioritaires

    def _identify_strengths(self, essential_scores: Dict[str, float], quality_scores: Dict[str, float]) -> List[str]:
        """Identifie les points forts du brief"""
        strengths = []
        
        # Points forts sur les informations essentielles
        for info_type, score in essential_scores.items():
            if score >= 0.8:
                if info_type == 'objective':
                    strengths.append('Objectifs clairement définis')
                elif info_type == 'scope':
                    strengths.append('Périmètre bien délimité')
                elif info_type == 'requirements':
                    strengths.append('Exigences techniques précises')
                elif info_type == 'deliverables':
                    strengths.append('Livrables explicites')
                elif info_type == 'timeline':
                    strengths.append('Planning clairement exprimé')
                elif info_type == 'budget':
                    strengths.append('Budget transparent')
        
        # Points forts sur la qualité
        if quality_scores.get('clarity', 0) >= 0.8:
            strengths.append('Expression claire et détaillée')
        if quality_scores.get('technical_depth', 0) >= 0.7:
            strengths.append('Bon niveau technique')
        if quality_scores.get('specificity', 0) >= 0.8:
            strengths.append('Informations très spécifiques')
        
        return strengths

    def _identify_improvements(self, essential_scores: Dict[str, float], quality_scores: Dict[str, float], missing_info: List[Dict]) -> List[str]:
        """Identifie les améliorations recommandées"""
        improvements = []
        
        # Améliorations basées sur les informations manquantes
        if len(missing_info) > 0:
            improvements.append(f"Préciser {len(missing_info)} éléments essentiels manquants")
        
        # Améliorations basées sur la qualité
        if quality_scores.get('clarity', 0) < 0.6:
            improvements.append("Structurer davantage la description (paragraphes, listes)")
        
        if quality_scores.get('specificity', 0) < 0.5:
            improvements.append("Ajouter des détails techniques et fonctionnels spécifiques")
        
        if quality_scores.get('technical_depth', 0) < 0.4:
            improvements.append("Préciser les aspects techniques (technologies, contraintes)")
        
        # Améliorations spécifiques par catégorie manquante
        for info_type, score in essential_scores.items():
            if score < 0.3:
                if info_type == 'budget':
                    improvements.append("Indiquer une fourchette budgétaire même approximative")
                elif info_type == 'timeline':
                    improvements.append("Mentionner une échéance ou urgence du projet")
                elif info_type == 'deliverables':
                    improvements.append("Lister précisément les livrables attendus")
        
        return improvements[:4]  # Limite à 4 améliorations

    def _calculate_completeness(self, essential_scores: Dict[str, float]) -> float:
        """Calcule le pourcentage de complétude"""
        total_weight = sum(self.quality_criteria['essential_info'][key]['weight'] for key in essential_scores.keys())
        weighted_score = sum(
            score * self.quality_criteria['essential_info'][key]['weight']
            for key, score in essential_scores.items()
        )
        
        return (weighted_score / total_weight * 100) if total_weight > 0 else 0

    def suggest_questions(self, missing_info: List[Dict[str, any]], category: str = None) -> List[Dict[str, any]]:
        """Suggère des questions personnalisées selon la catégorie"""
        suggestions = []
        
        for missing in missing_info:
            base_questions = missing['questions']
            
            # Personnalisation selon la catégorie
            if category:
                personalized_questions = self._personalize_questions(base_questions, category, missing['type'])
                suggestions.append({
                    'type': missing['type'],
                    'importance': missing['importance'],
                    'questions': personalized_questions[:2]  # Max 2 questions par type
                })
            else:
                suggestions.append({
                    'type': missing['type'],
                    'importance': missing['importance'],
                    'questions': base_questions[:2]
                })
        
        return suggestions

    def _personalize_questions(self, base_questions: List[str], category: str, info_type: str) -> List[str]:
        """Personnalise les questions selon la catégorie"""
        category_lower = category.lower()
        
        if 'développement' in category_lower or 'web' in category_lower:
            if info_type == 'requirements':
                return [
                    "Quelles technologies préférez-vous (React, Vue, PHP...) ?",
                    "Le site doit-il être responsive/mobile-friendly ?",
                    "Avez-vous des contraintes d'hébergement ?"
                ]
            elif info_type == 'deliverables':
                return [
                    "Souhaitez-vous les codes sources ?",
                    "Faut-il prévoir une documentation technique ?",
                    "Avez-vous besoin d'une formation à l'utilisation ?"
                ]
        
        elif 'design' in category_lower:
            if info_type == 'requirements':
                return [
                    "Avez-vous une charte graphique existante ?",
                    "Quels formats de fichiers souhaitez-vous ?",
                    "Y a-t-il des contraintes de couleurs/polices ?"
                ]
            elif info_type == 'deliverables':
                return [
                    "Souhaitez-vous les fichiers sources (PSD, AI...) ?",
                    "Faut-il des déclinaisons (print, web, mobile) ?",
                    "Avez-vous besoin d'une charte graphique ?"
                ]
        
        elif 'marketing' in category_lower:
            if info_type == 'objective':
                return [
                    "Quels sont vos KPIs prioritaires ?",
                    "Quelle est votre cible principale ?",
                    "Sur quels canaux souhaitez-vous communiquer ?"
                ]
        
        return base_questions
