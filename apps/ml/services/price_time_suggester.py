
import csv
import logging
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass
import statistics

logger = logging.getLogger(__name__)

@dataclass
class PriceTimeSuggestion:
    price_suggested_min: int
    price_suggested_med: int
    price_suggested_max: int
    delay_suggested_days: int
    rationale: Dict[str, any]
    confidence: float

class PriceTimeSuggester:
    def __init__(self, data_path: str = "/infra/data"):
        self.data_path = Path(data_path)
        self.price_data = {}
        self.time_factors = {}
        self._load_pricing_data()

    def _load_pricing_data(self):
        """Charge les données de prix depuis les fichiers CSV"""
        try:
            price_file = self.data_path / "price_terms_fr.csv"
            if price_file.exists():
                with open(price_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        category = row['category']
                        sub_category = row['sub_category']
                        
                        if category not in self.price_data:
                            self.price_data[category] = {}
                        
                        self.price_data[category][sub_category] = {
                            'hourly_min': float(row.get('hourly_min', 25)),
                            'hourly_med': float(row.get('hourly_med', 45)),
                            'hourly_max': float(row.get('hourly_max', 80)),
                            'daily_min': float(row.get('daily_min', 200)),
                            'daily_med': float(row.get('daily_med', 350)),
                            'daily_max': float(row.get('daily_max', 600)),
                            'complexity_factor': float(row.get('complexity_factor', 1.0)),
                            'avg_days': int(row.get('avg_days', 15))
                        }
            
            self._init_time_factors()
            logger.info(f"Données de prix chargées pour {len(self.price_data)} catégories")
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement des prix: {e}")
            self._init_default_pricing()

    def _init_default_pricing(self):
        """Initialise une grille de prix par défaut"""
        self.price_data = {
            'développement': {
                'web': {
                    'hourly_min': 30, 'hourly_med': 50, 'hourly_max': 90,
                    'daily_min': 240, 'daily_med': 400, 'daily_max': 720,
                    'complexity_factor': 1.2, 'avg_days': 20
                },
                'mobile': {
                    'hourly_min': 35, 'hourly_med': 60, 'hourly_max': 100,
                    'daily_min': 280, 'daily_med': 480, 'daily_max': 800,
                    'complexity_factor': 1.4, 'avg_days': 30
                }
            },
            'design': {
                'ui_ux': {
                    'hourly_min': 25, 'hourly_med': 45, 'hourly_max': 80,
                    'daily_min': 200, 'daily_med': 360, 'daily_max': 640,
                    'complexity_factor': 1.1, 'avg_days': 12
                },
                'graphique': {
                    'hourly_min': 20, 'hourly_med': 35, 'hourly_max': 60,
                    'daily_min': 160, 'daily_med': 280, 'daily_max': 480,
                    'complexity_factor': 0.9, 'avg_days': 8
                }
            },
            'marketing': {
                'digital': {
                    'hourly_min': 30, 'hourly_med': 55, 'hourly_max': 100,
                    'daily_min': 240, 'daily_med': 440, 'daily_max': 800,
                    'complexity_factor': 1.0, 'avg_days': 15
                },
                'contenu': {
                    'hourly_min': 20, 'hourly_med': 35, 'hourly_max': 65,
                    'daily_min': 160, 'daily_med': 280, 'daily_max': 520,
                    'complexity_factor': 0.8, 'avg_days': 10
                }
            },
            'conseil': {
                'stratégie': {
                    'hourly_min': 50, 'hourly_med': 80, 'hourly_max': 150,
                    'daily_min': 400, 'daily_med': 640, 'daily_max': 1200,
                    'complexity_factor': 1.3, 'avg_days': 25
                }
            }
        }

    def _init_time_factors(self):
        """Initialise les facteurs d'ajustement temporel"""
        self.time_factors = {
            'urgency': {
                'urgent': 0.6,      # -40% de temps mais +prix
                'normal': 1.0,
                'flexible': 1.4     # +40% de temps mais -prix
            },
            'complexity': {
                'simple': 0.7,
                'medium': 1.0,
                'complex': 1.6,
                'very_complex': 2.2
            },
            'team_size': {
                'solo': 1.0,
                'small_team': 0.8,  # Plus efficace
                'large_team': 1.2   # Coordination overhead
            },
            'quality_level': {
                'basic': 0.8,
                'professional': 1.0,
                'premium': 1.3,
                'enterprise': 1.6
            }
        }

    def suggest(self, 
                category: str,
                sub_category: str = None,
                estimated_hours: int = None,
                complexity: str = 'medium',
                urgency: str = 'normal',
                quality_level: str = 'professional',
                brief_quality_score: float = 0.5,
                market_heat: float = 1.0,
                constraints: List[str] = None) -> PriceTimeSuggestion:
        """Suggère des prix et délais optimaux"""
        
        # Récupération des données de base
        base_pricing = self._get_base_pricing(category, sub_category)
        
        # Estimation des heures si non fournie
        if estimated_hours is None:
            estimated_hours = self._estimate_hours(category, sub_category, complexity)
        
        # Calcul des facteurs d'ajustement
        adjustments = self._calculate_adjustments(
            complexity, urgency, quality_level, 
            brief_quality_score, market_heat, constraints
        )
        
        # Calcul des prix
        prices = self._calculate_prices(base_pricing, estimated_hours, adjustments)
        
        # Calcul des délais
        delay_days = self._calculate_delay(base_pricing, estimated_hours, adjustments)
        
        # Génération de la justification
        rationale = self._generate_rationale(
            base_pricing, estimated_hours, adjustments, 
            category, sub_category, complexity, urgency
        )
        
        # Calcul de la confiance
        confidence = self._calculate_confidence(brief_quality_score, category, sub_category)
        
        return PriceTimeSuggestion(
            price_suggested_min=int(prices['min']),
            price_suggested_med=int(prices['med']),
            price_suggested_max=int(prices['max']),
            delay_suggested_days=delay_days,
            rationale=rationale,
            confidence=confidence
        )

    def _get_base_pricing(self, category: str, sub_category: str = None) -> Dict[str, any]:
        """Récupère les données de prix de base"""
        category_lower = category.lower()
        
        # Mapping des catégories
        category_mapping = {
            'développement': 'développement',
            'dev': 'développement',
            'web': 'développement',
            'mobile': 'développement',
            'design': 'design',
            'marketing': 'marketing',
            'conseil': 'conseil'
        }
        
        mapped_category = category_mapping.get(category_lower, 'développement')
        
        if mapped_category in self.price_data:
            # Sélection de la sous-catégorie
            if sub_category and sub_category.lower() in self.price_data[mapped_category]:
                return self.price_data[mapped_category][sub_category.lower()]
            else:
                # Prendre la première sous-catégorie disponible
                first_sub = next(iter(self.price_data[mapped_category].values()))
                return first_sub
        
        # Valeurs par défaut
        return {
            'hourly_min': 25, 'hourly_med': 45, 'hourly_max': 75,
            'daily_min': 200, 'daily_med': 360, 'daily_max': 600,
            'complexity_factor': 1.0, 'avg_days': 15
        }

    def _estimate_hours(self, category: str, sub_category: str = None, complexity: str = 'medium') -> int:
        """Estime le nombre d'heures nécessaires"""
        base_hours = {
            'développement': {'web': 40, 'mobile': 60, 'api': 30},
            'design': {'ui_ux': 25, 'graphique': 15, 'logo': 8},
            'marketing': {'digital': 20, 'contenu': 15, 'strategy': 30},
            'conseil': {'stratégie': 35, 'audit': 20}
        }
        
        category_lower = category.lower()
        sub_category_lower = sub_category.lower() if sub_category else None
        
        # Récupération des heures de base
        hours = 30  # Défaut
        if category_lower in base_hours:
            category_hours = base_hours[category_lower]
            if sub_category_lower and sub_category_lower in category_hours:
                hours = category_hours[sub_category_lower]
            else:
                hours = list(category_hours.values())[0]
        
        # Ajustement par complexité
        complexity_multipliers = {
            'simple': 0.6,
            'medium': 1.0,
            'complex': 1.8,
            'very_complex': 2.5
        }
        
        multiplier = complexity_multipliers.get(complexity, 1.0)
        return int(hours * multiplier)

    def _calculate_adjustments(self, 
                             complexity: str,
                             urgency: str,
                             quality_level: str,
                             brief_quality_score: float,
                             market_heat: float,
                             constraints: List[str] = None) -> Dict[str, float]:
        """Calcule les facteurs d'ajustement"""
        adjustments = {
            'complexity_factor': self.time_factors['complexity'].get(complexity, 1.0),
            'urgency_factor': self.time_factors['urgency'].get(urgency, 1.0),
            'quality_factor': self.time_factors['quality_level'].get(quality_level, 1.0),
            'brief_quality_bonus': max(0.8, min(1.2, brief_quality_score * 1.5)),
            'market_heat_factor': market_heat,
            'constraint_penalty': 1.0
        }
        
        # Pénalités pour contraintes spéciales
        constraints = constraints or []
        if 'on_site_required' in constraints:
            adjustments['constraint_penalty'] *= 1.15
        if 'urgent' in constraints:
            adjustments['urgency_factor'] *= 0.8  # Moins de temps
        if 'tight_budget' in constraints:
            adjustments['brief_quality_bonus'] *= 0.9  # Signal de budget serré
        if 'certification_required' in constraints:
            adjustments['quality_factor'] *= 1.2
        
        return adjustments

    def _calculate_prices(self, base_pricing: Dict, estimated_hours: int, adjustments: Dict) -> Dict[str, float]:
        """Calcule les prix min/med/max ajustés"""
        
        # Calcul du prix horaire ajusté
        hourly_rates = {
            'min': base_pricing['hourly_min'],
            'med': base_pricing['hourly_med'],
            'max': base_pricing['hourly_max']
        }
        
        # Application des ajustements
        total_adjustment = (
            adjustments['complexity_factor'] * 
            adjustments['quality_factor'] * 
            adjustments['brief_quality_bonus'] * 
            adjustments['market_heat_factor'] * 
            adjustments['constraint_penalty']
        )
        
        # Ajustement urgence (augmente le prix si urgent)
        if adjustments['urgency_factor'] < 1.0:  # Urgent
            urgency_price_boost = 1.3
        else:
            urgency_price_boost = adjustments['urgency_factor']
        
        total_adjustment *= urgency_price_boost
        
        # Calcul des prix finaux
        prices = {}
        for level, rate in hourly_rates.items():
            adjusted_rate = rate * total_adjustment
            prices[level] = adjusted_rate * estimated_hours
        
        # Arrondissement intelligent
        for level in prices:
            price = prices[level]
            if price < 500:
                prices[level] = round(price / 50) * 50  # Arrondi à 50€
            elif price < 2000:
                prices[level] = round(price / 100) * 100  # Arrondi à 100€
            else:
                prices[level] = round(price / 250) * 250  # Arrondi à 250€
        
        return prices

    def _calculate_delay(self, base_pricing: Dict, estimated_hours: int, adjustments: Dict) -> int:
        """Calcule le délai en jours"""
        
        # Heures de travail par jour (moyenne 6h productives)
        hours_per_day = 6
        
        # Calcul de base
        base_days = estimated_hours / hours_per_day
        
        # Application des ajustements temporels
        time_adjustment = (
            adjustments['complexity_factor'] * 
            adjustments['urgency_factor'] * 
            adjustments['quality_factor']
        )
        
        # Bonus brief de qualité (réduit l'incertitude donc le temps)
        brief_bonus = 2 - adjustments['brief_quality_bonus']  # Plus le brief est bon, moins d'aller-retours
        
        adjusted_days = base_days * time_adjustment * brief_bonus
        
        # Minimum 1 jour, maximum raisonnable
        return max(1, min(int(adjusted_days), 90))

    def _generate_rationale(self, 
                          base_pricing: Dict,
                          estimated_hours: int,
                          adjustments: Dict,
                          category: str,
                          sub_category: str,
                          complexity: str,
                          urgency: str) -> Dict[str, any]:
        """Génère la justification des prix et délais"""
        
        rationale = {
            'base_info': {
                'category': category,
                'sub_category': sub_category,
                'estimated_hours': estimated_hours,
                'base_hourly_rate': f"{base_pricing['hourly_min']}-{base_pricing['hourly_max']}€/h"
            },
            'adjustments_applied': [],
            'market_factors': [],
            'recommendations': []
        }
        
        # Explication des ajustements
        if adjustments['complexity_factor'] > 1.2:
            rationale['adjustments_applied'].append(f"Complexité {complexity} : +{int((adjustments['complexity_factor']-1)*100)}%")
        elif adjustments['complexity_factor'] < 0.8:
            rationale['adjustments_applied'].append(f"Projet simple : {int((1-adjustments['complexity_factor'])*100)}% de réduction")
        
        if adjustments['urgency_factor'] < 1.0:
            rationale['adjustments_applied'].append(f"Urgence : délai réduit, prix majoré de 30%")
        
        if adjustments['quality_factor'] > 1.1:
            rationale['adjustments_applied'].append(f"Qualité premium demandée : +{int((adjustments['quality_factor']-1)*100)}%")
        
        if adjustments['brief_quality_bonus'] > 1.1:
            rationale['adjustments_applied'].append("Brief de qualité : moins d'aller-retours, prix optimisé")
        elif adjustments['brief_quality_bonus'] < 0.9:
            rationale['adjustments_applied'].append("Brief à améliorer : majoration risque d'incompréhension")
        
        # Facteurs de marché
        if adjustments['market_heat_factor'] > 1.1:
            rationale['market_factors'].append("Marché tendu : tarifs légèrement majorés")
        elif adjustments['market_heat_factor'] < 0.9:
            rationale['market_factors'].append("Marché détendu : tarifs compétitifs")
        
        # Recommandations
        if urgency == 'urgent':
            rationale['recommendations'].append("Considérer une équipe plus large pour respecter les délais")
        
        if complexity == 'complex':
            rationale['recommendations'].append("Prévoir des jalons intermédiaires pour validation")
        
        if adjustments['brief_quality_bonus'] < 0.9:
            rationale['recommendations'].append("Améliorer le brief pour optimiser les coûts et délais")
        
        return rationale

    def _calculate_confidence(self, brief_quality_score: float, category: str, sub_category: str = None) -> float:
        """Calcule la confiance dans l'estimation"""
        
        # Confiance de base selon la qualité du brief
        base_confidence = brief_quality_score
        
        # Bonus selon la précision des données disponibles
        category_bonus = 0.1 if category.lower() in ['développement', 'design', 'marketing'] else 0.0
        subcategory_bonus = 0.1 if sub_category else 0.0
        
        # Confiance finale
        confidence = min(base_confidence + category_bonus + subcategory_bonus, 0.95)
        
        return max(confidence, 0.3)  # Minimum 30% de confiance

    def get_market_insights(self, category: str, sub_category: str = None) -> Dict[str, any]:
        """Retourne des insights sur le marché"""
        base_pricing = self._get_base_pricing(category, sub_category)
        
        return {
            'category': category,
            'sub_category': sub_category,
            'market_range': {
                'hourly': f"{base_pricing['hourly_min']}-{base_pricing['hourly_max']}€/h",
                'daily': f"{base_pricing['daily_min']}-{base_pricing['daily_max']}€/jour"
            },
            'typical_duration': f"{base_pricing['avg_days']} jours",
            'complexity_impact': f"×{base_pricing['complexity_factor']} pour projets complexes",
            'recommendations': [
                "Spécifier le niveau de qualité attendu",
                "Détailler les contraintes techniques",
                "Préciser l'urgence et la flexibilité",
                "Fournir un brief complet pour optimiser les coûts"
            ]
        }
