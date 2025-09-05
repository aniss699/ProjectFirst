
"""
LOC Uplift - Calcul probabilité d'aboutissement et recommandations
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class LOCResult:
    loc_base: float
    loc_uplift_reco: Dict
    improvement_potential: float
    recommendations: List[str]

class LOCUpliftCalculator:
    def __init__(self):
        # Facteurs de base pour le calcul LOC
        self.base_factors = {
            'brief_quality': 0.25,      # Impact qualité du brief
            'price_competitiveness': 0.20,  # Compétitivité prix
            'category_demand': 0.15,    # Demande de la catégorie
            'client_history': 0.15,     # Historique client
            'market_conditions': 0.10,  # Conditions marché
            'urgency': 0.08,           # Urgence du projet
            'budget_realism': 0.07     # Réalisme du budget
        }
        
        # Coefficients d'amélioration par action
        self.improvement_coefficients = {
            'budget_increase': {
                'low': 0.05,    # +5% LOC pour augmentation modérée
                'medium': 0.12, # +12% LOC pour augmentation significative
                'high': 0.20    # +20% LOC pour budget généreux
            },
            'delay_extension': {
                'low': 0.03,    # +3% LOC pour délai légèrement étendu
                'medium': 0.08, # +8% LOC pour délai plus flexible
                'high': 0.15    # +15% LOC pour délai très flexible
            },
            'brief_enhancement': {
                'details': 0.10,      # +10% LOC pour détails supplémentaires
                'criteria': 0.08,     # +8% LOC pour critères clarifiés
                'deliverables': 0.06  # +6% LOC pour livrables précisés
            }
        }

        # Seuils de performance par catégorie
        self.category_benchmarks = {
            'web_development': {'avg_loc': 0.72, 'top_quartile': 0.85},
            'mobile_development': {'avg_loc': 0.68, 'top_quartile': 0.82},
            'design_graphique': {'avg_loc': 0.78, 'top_quartile': 0.90},
            'marketing_digital': {'avg_loc': 0.70, 'top_quartile': 0.84},
            'construction': {'avg_loc': 0.65, 'top_quartile': 0.80},
            'services_personne': {'avg_loc': 0.82, 'top_quartile': 0.92}
        }

    def calculate_loc_with_uplift(self,
                                 project_data: Dict,
                                 standardization_data: Dict,
                                 market_context: Dict) -> LOCResult:
        """Calcule le LOC de base et les recommandations d'amélioration"""
        
        # 1. Calcul LOC de base
        loc_base = self._calculate_base_loc(project_data, standardization_data, market_context)
        
        # 2. Analyse du potentiel d'amélioration
        improvement_potential = self._analyze_improvement_potential(loc_base, project_data, standardization_data)
        
        # 3. Génération des recommandations d'uplift
        uplift_recommendations = self._generate_uplift_recommendations(
            loc_base, project_data, standardization_data, improvement_potential
        )
        
        # 4. Recommandations textuelles
        text_recommendations = self._generate_text_recommendations(
            loc_base, uplift_recommendations, improvement_potential
        )
        
        return LOCResult(
            loc_base=loc_base,
            loc_uplift_reco=uplift_recommendations,
            improvement_potential=improvement_potential,
            recommendations=text_recommendations
        )

    def _calculate_base_loc(self, project_data: Dict, standardization_data: Dict, market_context: Dict) -> float:
        """Calcule le LOC de base selon multiples facteurs"""
        
        loc_components = {}
        
        # 1. Qualité du brief (0-1)
        brief_quality = standardization_data.get('brief_quality_score', 0.5)
        loc_components['brief_quality'] = brief_quality * self.base_factors['brief_quality']
        
        # 2. Compétitivité prix
        price_competitiveness = self._assess_price_competitiveness(project_data, market_context)
        loc_components['price_competitiveness'] = price_competitiveness * self.base_factors['price_competitiveness']
        
        # 3. Demande de catégorie
        category_demand = self._assess_category_demand(project_data.get('category', ''))
        loc_components['category_demand'] = category_demand * self.base_factors['category_demand']
        
        # 4. Historique client (simulé)
        client_history = self._assess_client_history(project_data.get('client_id'))
        loc_components['client_history'] = client_history * self.base_factors['client_history']
        
        # 5. Conditions marché
        market_conditions = market_context.get('heat_score', 0.5)
        loc_components['market_conditions'] = market_conditions * self.base_factors['market_conditions']
        
        # 6. Urgence
        urgency_score = self._assess_urgency(project_data.get('description', ''))
        loc_components['urgency'] = urgency_score * self.base_factors['urgency']
        
        # 7. Réalisme budget
        budget_realism = self._assess_budget_realism(project_data, standardization_data)
        loc_components['budget_realism'] = budget_realism * self.base_factors['budget_realism']
        
        # Calcul final avec pondération
        base_loc = sum(loc_components.values())
        
        # Normalisation et ajustements
        base_loc = max(0.15, min(0.95, base_loc))  # Contraindre entre 15% et 95%
        
        return round(base_loc, 3)

    def _assess_price_competitiveness(self, project_data: Dict, market_context: Dict) -> float:
        """Évalue la compétitivité du prix"""
        budget = float(project_data.get('budget', 0))
        if budget == 0:
            return 0.4  # Pas de budget = compétitivité moyenne-faible
        
        # Comparaison avec prix suggérés
        suggested_med = market_context.get('price_suggested_med', budget)
        if suggested_med > 0:
            ratio = budget / suggested_med
            if ratio >= 1.2:
                return 0.9    # Budget généreux
            elif ratio >= 1.0:
                return 0.7    # Budget correct
            elif ratio >= 0.8:
                return 0.5    # Budget serré
            else:
                return 0.3    # Budget insuffisant
        
        return 0.6  # Défaut

    def _assess_category_demand(self, category: str) -> float:
        """Évalue la demande pour une catégorie"""
        demand_scores = {
            'web_development': 0.8,
            'mobile_development': 0.7,
            'design_graphique': 0.6,
            'marketing_digital': 0.7,
            'construction': 0.9,
            'services_personne': 0.8,
            'default': 0.6
        }
        
        # Mapping des catégories
        category_mapping = {
            'developpement': 'web_development',
            'mobile': 'mobile_development',
            'design': 'design_graphique',
            'marketing': 'marketing_digital',
            'travaux': 'construction',
            'menage': 'services_personne'
        }
        
        mapped_category = category_mapping.get(category, category)
        return demand_scores.get(mapped_category, demand_scores['default'])

    def _assess_client_history(self, client_id: str) -> float:
        """Évalue l'historique du client (simulé)"""
        # Simulation basée sur l'ID client
        if not client_id:
            return 0.5
        
        # Hash simple pour simulation cohérente
        hash_val = sum(ord(c) for c in client_id) % 100
        
        if hash_val > 80:
            return 0.9  # Excellent client
        elif hash_val > 60:
            return 0.7  # Bon client
        elif hash_val > 40:
            return 0.6  # Client moyen
        else:
            return 0.4  # Nouveau client

    def _assess_urgency(self, description: str) -> float:
        """Évalue l'urgence du projet"""
        urgent_keywords = ['urgent', 'rapide', 'vite', 'asap', 'immédiat', 'pressé']
        flexible_keywords = ['flexible', 'pas pressé', 'quand possible']
        
        desc_lower = description.lower()
        
        if any(keyword in desc_lower for keyword in urgent_keywords):
            return 0.8  # Projet urgent = plus attractif
        elif any(keyword in desc_lower for keyword in flexible_keywords):
            return 0.6  # Projet flexible = moyennement attractif
        else:
            return 0.7  # Neutre

    def _assess_budget_realism(self, project_data: Dict, standardization_data: Dict) -> float:
        """Évalue le réalisme du budget"""
        budget = float(project_data.get('budget', 0))
        suggested_min = standardization_data.get('price_suggested_min', 0)
        suggested_max = standardization_data.get('price_suggested_max', 0)
        
        if budget == 0 or suggested_min == 0:
            return 0.4  # Pas d'info = réalisme moyen-faible
        
        if budget >= suggested_min and budget <= suggested_max:
            return 0.9  # Budget dans la fourchette
        elif budget >= suggested_min * 0.8:
            return 0.7  # Budget proche de la fourchette
        else:
            return 0.3  # Budget trop faible

    def _analyze_improvement_potential(self, loc_base: float, project_data: Dict, standardization_data: Dict) -> float:
        """Analyse le potentiel d'amélioration du LOC"""
        
        # Potentiel maximum basé sur le LOC actuel
        max_potential = 0.95 - loc_base
        
        # Facteurs d'amélioration disponibles
        improvement_factors = []
        
        # Budget
        budget = float(project_data.get('budget', 0))
        suggested_med = standardization_data.get('price_suggested_med', 0)
        if suggested_med > 0 and budget < suggested_med:
            budget_gap = (suggested_med - budget) / suggested_med
            improvement_factors.append(min(0.2, budget_gap))
        
        # Délais
        if not any(word in project_data.get('description', '').lower() for word in ['urgent', 'vite', 'rapide']):
            improvement_factors.append(0.08)  # Potentiel d'extension délai
        
        # Brief quality
        brief_quality = standardization_data.get('brief_quality_score', 0.5)
        if brief_quality < 0.8:
            improvement_factors.append((0.8 - brief_quality) * 0.5)
        
        # Calcul du potentiel total
        total_potential = sum(improvement_factors)
        return min(max_potential, total_potential)

    def _generate_uplift_recommendations(self, loc_base: float, project_data: Dict, 
                                       standardization_data: Dict, improvement_potential: float) -> Dict:
        """Génère les recommandations d'uplift concrètes"""
        
        recommendations = {
            'current_loc': loc_base,
            'target_loc': min(0.95, loc_base + improvement_potential),
            'actions': []
        }
        
        # 1. Recommandation budget
        budget = float(project_data.get('budget', 0))
        suggested_med = standardization_data.get('price_suggested_med', 0)
        suggested_max = standardization_data.get('price_suggested_max', 0)
        
        if suggested_med > 0 and budget < suggested_med:
            budget_increase = suggested_med - budget
            loc_improvement = self._calculate_budget_uplift(budget, suggested_med)
            
            recommendations['actions'].append({
                'type': 'budget_increase',
                'current_budget': budget,
                'recommended_budget': suggested_med,
                'increase_amount': budget_increase,
                'expected_loc_improvement': loc_improvement,
                'confidence': 0.85,
                'reason': 'Budget plus attractif pour les prestataires qualifiés'
            })
        
        # 2. Recommandation délai
        current_delay = standardization_data.get('delay_suggested_days', 21)
        if not any(word in project_data.get('description', '').lower() for word in ['urgent', 'vite']):
            extended_delay = int(current_delay * 1.3)
            loc_improvement = self.improvement_coefficients['delay_extension']['medium']
            
            recommendations['actions'].append({
                'type': 'delay_extension',
                'current_delay': current_delay,
                'recommended_delay': extended_delay,
                'extension_days': extended_delay - current_delay,
                'expected_loc_improvement': loc_improvement,
                'confidence': 0.75,
                'reason': 'Délai plus flexible attire plus de candidatures'
            })
        
        # 3. Recommandation amélioration brief
        brief_quality = standardization_data.get('brief_quality_score', 0.5)
        missing_info = standardization_data.get('missing_info', [])
        
        if brief_quality < 0.8 or missing_info:
            loc_improvement = self.improvement_coefficients['brief_enhancement']['details']
            
            recommendations['actions'].append({
                'type': 'brief_enhancement',
                'current_quality': brief_quality,
                'target_quality': 0.85,
                'missing_elements': len(missing_info),
                'expected_loc_improvement': loc_improvement,
                'confidence': 0.80,
                'reason': 'Brief détaillé réduit les risques et attire les experts'
            })
        
        # Calcul LOC final si toutes recommandations appliquées
        total_improvement = sum(action['expected_loc_improvement'] for action in recommendations['actions'])
        recommendations['potential_final_loc'] = min(0.95, loc_base + total_improvement)
        
        return recommendations

    def _calculate_budget_uplift(self, current_budget: float, recommended_budget: float) -> float:
        """Calcule l'amélioration LOC selon l'augmentation budget"""
        if current_budget == 0:
            return self.improvement_coefficients['budget_increase']['high']
        
        increase_ratio = (recommended_budget - current_budget) / current_budget
        
        if increase_ratio >= 0.5:
            return self.improvement_coefficients['budget_increase']['high']
        elif increase_ratio >= 0.2:
            return self.improvement_coefficients['budget_increase']['medium']
        else:
            return self.improvement_coefficients['budget_increase']['low']

    def _generate_text_recommendations(self, loc_base: float, uplift_reco: Dict, improvement_potential: float) -> List[str]:
        """Génère les recommandations textuelles"""
        recommendations = []
        
        # Évaluation LOC actuel
        if loc_base < 0.5:
            recommendations.append("⚠️ Probabilité d'aboutissement faible - améliorations fortement recommandées")
        elif loc_base < 0.7:
            recommendations.append("📈 Probabilité d'aboutissement moyenne - optimisations possibles")
        else:
            recommendations.append("✅ Bonne probabilité d'aboutissement - fine-tuning recommandé")
        
        # Recommandations spécifiques selon les actions
        for action in uplift_reco.get('actions', []):
            if action['type'] == 'budget_increase':
                improvement_pct = int(action['expected_loc_improvement'] * 100)
                recommendations.append(
                    f"💰 Augmenter le budget à {action['recommended_budget']:.0f}€ "
                    f"(+{improvement_pct}% de réussite)"
                )
            
            elif action['type'] == 'delay_extension':
                improvement_pct = int(action['expected_loc_improvement'] * 100)
                recommendations.append(
                    f"📅 Étendre le délai à {action['recommended_delay']} jours "
                    f"(+{improvement_pct}% de réussite)"
                )
            
            elif action['type'] == 'brief_enhancement':
                improvement_pct = int(action['expected_loc_improvement'] * 100)
                recommendations.append(
                    f"📝 Enrichir le brief avec détails manquants "
                    f"(+{improvement_pct}% de réussite)"
                )
        
        # Potentiel total
        if improvement_potential > 0.1:
            total_improvement = int(improvement_potential * 100)
            recommendations.append(
                f"🎯 Potentiel d'amélioration total : +{total_improvement}% de probabilité de réussite"
            )
        
        return recommendations

# Instance principale
loc_uplift_calculator = LOCUpliftCalculator()
