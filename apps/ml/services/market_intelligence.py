
"""
Service d'intelligence de marché pour AppelsPro
Analyse les tendances, prix et disponibilité par domaine
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import json
import os
from pathlib import Path

@dataclass
class MarketData:
    category: str
    avg_price: float
    price_range: Tuple[float, float]
    avg_timeline: int
    provider_count: int
    demand_score: float
    competition_level: str  # low, medium, high

@dataclass
class MarketSuggestion:
    suggested_budget_min: float
    suggested_budget_max: float
    suggested_timeline: int
    available_providers: int
    market_advice: str
    pricing_confidence: float

class MarketIntelligenceService:
    def __init__(self):
        self.data_path = Path("/app/data")
        self.market_data = self._load_market_data()
        
    def _load_market_data(self) -> Dict[str, MarketData]:
        """Charge les données de marché enrichies"""
        market_data = {}
        
        # Données de marché par catégorie (simulées mais réalistes)
        categories_data = {
            "development": {
                "avg_price": 450, "price_range": (250, 800), 
                "avg_timeline": 21, "provider_count": 850,
                "demand_score": 0.92, "competition_level": "high"
            },
            "mobile": {
                "avg_price": 520, "price_range": (300, 900),
                "avg_timeline": 28, "provider_count": 420,
                "demand_score": 0.88, "competition_level": "medium"
            },
            "design": {
                "avg_price": 320, "price_range": (150, 600),
                "avg_timeline": 14, "provider_count": 650,
                "demand_score": 0.85, "competition_level": "high"
            },
            "marketing": {
                "avg_price": 280, "price_range": (120, 500),
                "avg_timeline": 10, "provider_count": 750,
                "demand_score": 0.90, "competition_level": "high"
            },
            "travaux": {
                "avg_price": 380, "price_range": (200, 700),
                "avg_timeline": 7, "provider_count": 1200,
                "demand_score": 0.95, "competition_level": "medium"
            },
            "services_personne": {
                "avg_price": 180, "price_range": (80, 300),
                "avg_timeline": 3, "provider_count": 2100,
                "demand_score": 0.98, "competition_level": "low"
            },
            "jardinage": {
                "avg_price": 220, "price_range": (100, 400),
                "avg_timeline": 5, "provider_count": 950,
                "demand_score": 0.87, "competition_level": "medium"
            },
            "comptabilite": {
                "avg_price": 350, "price_range": (180, 600),
                "avg_timeline": 15, "provider_count": 480,
                "demand_score": 0.82, "competition_level": "medium"
            }
        }
        
        for category, data in categories_data.items():
            market_data[category] = MarketData(
                category=category,
                avg_price=data["avg_price"],
                price_range=data["price_range"],
                avg_timeline=data["avg_timeline"],
                provider_count=data["provider_count"],
                demand_score=data["demand_score"],
                competition_level=data["competition_level"]
            )
            
        return market_data
    
    def get_market_suggestions(self, category: str, description: str, 
                             complexity: str = "medium") -> MarketSuggestion:
        """Génère des suggestions de marché basées sur l'analyse IA"""
        
        if category not in self.market_data:
            return self._get_default_suggestion()
        
        market = self.market_data[category]
        
        # Ajustements basés sur la complexité
        complexity_multipliers = {
            "low": 0.8,
            "medium": 1.0,
            "high": 1.3,
            "very_high": 1.6
        }
        
        multiplier = complexity_multipliers.get(complexity, 1.0)
        
        # Calcul des suggestions
        base_min = market.price_range[0] * multiplier
        base_max = market.price_range[1] * multiplier
        
        # Ajustements contextuels
        if "urgent" in description.lower():
            base_min *= 1.2
            base_max *= 1.4
        
        if "premium" in description.lower() or "haut de gamme" in description.lower():
            base_min *= 1.3
            base_max *= 1.5
        
        # Timeline ajustée
        timeline = max(1, int(market.avg_timeline * multiplier))
        if "urgent" in description.lower():
            timeline = max(1, timeline // 2)
        
        # Estimation des prestataires disponibles
        available_providers = self._estimate_available_providers(market, complexity)
        
        # Conseil de marché
        advice = self._generate_market_advice(market, complexity, multiplier)
        
        # Confiance dans le pricing
        confidence = self._calculate_pricing_confidence(market, complexity)
        
        return MarketSuggestion(
            suggested_budget_min=round(base_min, 0),
            suggested_budget_max=round(base_max, 0),
            suggested_timeline=timeline,
            available_providers=available_providers,
            market_advice=advice,
            pricing_confidence=confidence
        )
    
    def _estimate_available_providers(self, market: MarketData, complexity: str) -> int:
        """Estime le nombre de prestataires disponibles"""
        base_count = market.provider_count
        
        # Ajustement selon la complexité
        complexity_factors = {
            "low": 0.8,
            "medium": 0.6,
            "high": 0.3,
            "very_high": 0.15
        }
        
        factor = complexity_factors.get(complexity, 0.6)
        estimated = int(base_count * factor)
        
        # Ajustement selon la concurrence
        if market.competition_level == "high":
            estimated = int(estimated * 1.2)
        elif market.competition_level == "low":
            estimated = int(estimated * 0.7)
            
        return max(5, estimated)
    
    def _generate_market_advice(self, market: MarketData, complexity: str, multiplier: float) -> str:
        """Génère un conseil de marché personnalisé"""
        advice_parts = []
        
        if market.competition_level == "high":
            advice_parts.append("Marché très concurrentiel - définissez clairement vos critères.")
        elif market.competition_level == "low":
            advice_parts.append("Peu de concurrence - vous avez plus de marge de négociation.")
        
        if multiplier > 1.2:
            advice_parts.append("Projet complexe - prévoyez des délais supplémentaires.")
        
        if market.demand_score > 0.9:
            advice_parts.append("Forte demande sur ce secteur - publiez rapidement.")
        
        return " ".join(advice_parts) if advice_parts else "Marché équilibré pour cette catégorie."
    
    def _calculate_pricing_confidence(self, market: MarketData, complexity: str) -> float:
        """Calcule la confiance dans le pricing"""
        base_confidence = 0.85
        
        # Ajustement selon les données de marché
        if market.provider_count > 500:
            base_confidence += 0.05
        if market.demand_score > 0.9:
            base_confidence += 0.03
        
        # Ajustement selon la complexité
        complexity_adjustments = {
            "low": 0.05,
            "medium": 0.0,
            "high": -0.05,
            "very_high": -0.1
        }
        
        base_confidence += complexity_adjustments.get(complexity, 0.0)
        
        return min(0.95, max(0.60, base_confidence))
    
    def _get_default_suggestion(self) -> MarketSuggestion:
        """Suggestion par défaut pour catégories non reconnues"""
        return MarketSuggestion(
            suggested_budget_min=200,
            suggested_budget_max=500,
            suggested_timeline=14,
            available_providers=50,
            market_advice="Catégorie non analysée - budget estimatif.",
            pricing_confidence=0.60
        )

# Service global
market_service = MarketIntelligenceService()

def get_market_suggestions(category: str, description: str, complexity: str = "medium") -> dict:
    """Interface simple pour l'API"""
    suggestion = market_service.get_market_suggestions(category, description, complexity)
    
    return {
        "suggested_budget": {
            "min": suggestion.suggested_budget_min,
            "max": suggestion.suggested_budget_max
        },
        "suggested_timeline_days": suggestion.suggested_timeline,
        "estimated_providers": suggestion.available_providers,
        "market_advice": suggestion.market_advice,
        "pricing_confidence": suggestion.pricing_confidence
    }
