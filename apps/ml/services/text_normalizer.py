
import re
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class NormalizedText:
    clean_text: str
    quantities: Dict[str, float]
    constraints: List[str]
    keywords: List[str]

class TextNormalizer:
    def __init__(self):
        self.surface_patterns = [
            (r'(\d+(?:[.,]\d+)?)\s*m²?', 'surface_m2'),
            (r'(\d+(?:[.,]\d+)?)\s*mètres?\s*carrés?', 'surface_m2'),
            (r'(\d+(?:[.,]\d+)?)\s*hectares?', 'surface_hectare'),
        ]
        
        self.time_patterns = [
            (r'(\d+(?:[.,]\d+)?)\s*heures?', 'duration_hours'),
            (r'(\d+(?:[.,]\d+)?)\s*jours?', 'duration_days'),
            (r'(\d+(?:[.,]\d+)?)\s*semaines?', 'duration_weeks'),
            (r'(\d+(?:[.,]\d+)?)\s*mois', 'duration_months'),
        ]
        
        self.distance_patterns = [
            (r'(\d+(?:[.,]\d+)?)\s*km', 'distance_km'),
            (r'(\d+(?:[.,]\d+)?)\s*kilomètres?', 'distance_km'),
            (r'(\d+(?:[.,]\d+)?)\s*m(?:\s|$)', 'distance_m'),
        ]
        
        self.constraint_patterns = [
            r'(?:sur\s+site|en\s+présentiel|physiquement)',
            r'(?:à\s+distance|en\s+remote|télétravail)',
            r'(?:urgent|rapidement|immédiatement)',
            r'(?:budget\s+serré|petit\s+budget)',
        ]

    def normalize(self, text: str) -> NormalizedText:
        """Normalise le texte français et extrait les informations structurées"""
        
        # Nettoyage du texte
        clean_text = self._clean_text(text)
        
        # Extraction des quantités
        quantities = self._extract_quantities(clean_text)
        
        # Extraction des contraintes
        constraints = self._extract_constraints(clean_text)
        
        # Extraction des mots-clés
        keywords = self._extract_keywords(clean_text)
        
        return NormalizedText(
            clean_text=clean_text,
            quantities=quantities,
            constraints=constraints,
            keywords=keywords
        )

    def _clean_text(self, text: str) -> str:
        """Nettoie et normalise le texte"""
        # Suppression des caractères spéciaux
        text = re.sub(r'[^\w\s.,!?;:-]', ' ', text)
        
        # Normalisation des espaces
        text = re.sub(r'\s+', ' ', text)
        
        # Conversion en minuscules
        text = text.lower().strip()
        
        return text

    def _extract_quantities(self, text: str) -> Dict[str, float]:
        """Extrait les quantités du texte"""
        quantities = {}
        
        all_patterns = self.surface_patterns + self.time_patterns + self.distance_patterns
        
        for pattern, key in all_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                value_str = match.group(1).replace(',', '.')
                try:
                    value = float(value_str)
                    quantities[key] = value
                except ValueError:
                    continue
        
        return quantities

    def _extract_constraints(self, text: str) -> List[str]:
        """Extrait les contraintes du texte"""
        constraints = []
        
        constraint_mapping = {
            r'(?:sur\s+site|en\s+présentiel|physiquement)': 'on_site_required',
            r'(?:à\s+distance|en\s+remote|télétravail)': 'remote_ok',
            r'(?:urgent|rapidement|immédiatement)': 'urgent',
            r'(?:budget\s+serré|petit\s+budget)': 'tight_budget',
            r'(?:expérience\s+requise|expérimenté)': 'experience_required',
            r'(?:certification|certifié|agréé)': 'certification_required',
        }
        
        for pattern, constraint in constraint_mapping.items():
            if re.search(pattern, text, re.IGNORECASE):
                constraints.append(constraint)
        
        return constraints

    def _extract_keywords(self, text: str) -> List[str]:
        """Extrait les mots-clés pertinents"""
        # Mots vides français
        stop_words = {
            'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais',
            'car', 'si', 'ce', 'se', 'que', 'qui', 'quoi', 'dont', 'où', 'quand',
            'comment', 'pourquoi', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils',
            'elles', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
            'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'dans', 'sur', 'avec',
            'par', 'pour', 'sans', 'sous', 'vers', 'chez', 'contre', 'entre',
            'pendant', 'avant', 'après', 'depuis', 'jusqu', 'avoir', 'être',
            'faire', 'aller', 'venir', 'voir', 'savoir', 'pouvoir', 'vouloir',
            'devoir', 'falloir', 'très', 'plus', 'moins', 'bien', 'mal', 'beaucoup'
        }
        
        # Tokenisation simple
        words = re.findall(r'\b\w{3,}\b', text.lower())
        
        # Filtrage des mots vides et extraction des mots-clés
        keywords = [word for word in words if word not in stop_words]
        
        # Déduplication en gardant l'ordre
        seen = set()
        unique_keywords = []
        for keyword in keywords:
            if keyword not in seen:
                seen.add(keyword)
                unique_keywords.append(keyword)
        
        return unique_keywords[:20]  # Limite à 20 mots-clés

    def extract_price_indicators(self, text: str) -> List[Dict[str, any]]:
        """Extrait les indicateurs de prix du texte"""
        price_patterns = [
            (r'(\d+(?:[.,]\d+)?)\s*€?\s*(?:/\s*h|par\s+heure|de\s+l[\'']heure)', 'hourly'),
            (r'(\d+(?:[.,]\d+)?)\s*€?\s*(?:/\s*jour|par\s+jour)', 'daily'),
            (r'(\d+(?:[.,]\d+)?)\s*€?\s*(?:forfait|global|total)', 'fixed'),
            (r'budget\s*:?\s*(\d+(?:[.,]\d+)?)\s*€?', 'budget_max'),
            (r'à\s+partir\s+de\s+(\d+(?:[.,]\d+)?)\s*€?', 'price_from'),
        ]
        
        price_indicators = []
        
        for pattern, price_type in price_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                value_str = match.group(1).replace(',', '.')
                try:
                    value = float(value_str)
                    price_indicators.append({
                        'type': price_type,
                        'value': value,
                        'currency': 'EUR'
                    })
                except ValueError:
                    continue
        
        return price_indicators
