
"""
Service de questions adaptatives basées sur la Value of Information
Sert à compléter les données manquantes de manière ciblée
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import math

@dataclass
class Question:
    text: str
    type: str  # 'choice', 'text', 'number', 'range'
    options: Optional[List[str]]
    importance: float  # 0-1
    voi: float  # Value of Information
    category: str

class QuestionerService:
    """Génère des questions optimales par Value of Information"""
    
    def __init__(self):
        self.question_bank = self._build_question_bank()
        self.voi_weights = {
            "budget": 0.9,
            "timeline": 0.8,
            "quality": 0.7,
            "tech_constraints": 0.6,
            "context": 0.5
        }
    
    def _build_question_bank(self) -> List[Question]:
        """Base de questions avec importance"""
        return [
            Question(
                text="Quel est votre budget approximatif ?",
                type="range",
                options=["< 500€", "500-1500€", "1500-5000€", "5000-15000€", "> 15000€"],
                importance=0.9,
                voi=0.9,
                category="budget"
            ),
            Question(
                text="Dans quels délais souhaitez-vous livraison ?",
                type="choice",
                options=["Urgent (< 1 semaine)", "Rapide (1-2 semaines)", "Standard (1 mois)", "Flexible (> 1 mois)"],
                importance=0.8,
                voi=0.8,
                category="timeline"
            ),
            Question(
                text="Avez-vous des références visuelles ou exemples inspirants ?",
                type="text",
                options=None,
                importance=0.7,
                voi=0.6,
                category="quality"
            ),
            Question(
                text="Ce projet a-t-il des contraintes techniques spécifiques ?",
                type="text",
                options=None,
                importance=0.6,
                voi=0.7,
                category="tech_constraints"
            ),
            Question(
                text="Qui sera votre interlocuteur principal ?",
                type="choice",
                options=["Moi-même", "Mon équipe", "Prestataire externe", "À définir"],
                importance=0.5,
                voi=0.4,
                category="context"
            ),
            Question(
                text="Quels sont vos critères de sélection prioritaires ?",
                type="choice",
                options=["Prix le plus bas", "Qualité maximale", "Délai le plus court", "Équilibre prix/qualité"],
                importance=0.8,
                voi=0.8,
                category="quality"
            ),
            Question(
                text="Avez-vous déjà travaillé sur un projet similaire ?",
                type="choice",
                options=["Oui, plusieurs fois", "Oui, une fois", "Non, c'est ma première fois"],
                importance=0.4,
                voi=0.5,
                category="context"
            ),
            Question(
                text="Souhaitez-vous un suivi/maintenance post-projet ?",
                type="choice",
                options=["Oui, indispensable", "Oui, si possible", "Non, livraison uniquement"],
                importance=0.6,
                voi=0.6,
                category="quality"
            )
        ]
    
    def select_next_questions(
        self, 
        current_brief: Dict, 
        answers_so_far: Dict = None,
        max_questions: int = 5
    ) -> List[Question]:
        """Sélectionne les meilleures questions selon VoI"""
        
        if answers_so_far is None:
            answers_so_far = {}
        
        # Calcule la VoI pour chaque question
        scored_questions = []
        
        for question in self.question_bank:
            # Skip si déjà répondu
            if question.category in answers_so_far:
                continue
                
            # Calcule VoI spécifique au contexte
            voi = self._calculate_contextual_voi(question, current_brief, answers_so_far)
            
            scored_questions.append((question, voi))
        
        # Trie par VoI décroissante
        scored_questions.sort(key=lambda x: x[1], reverse=True)
        
        # Retourne les top questions
        return [q for q, _ in scored_questions[:max_questions]]
    
    def _calculate_contextual_voi(
        self, 
        question: Question, 
        brief: Dict, 
        answers: Dict
    ) -> float:
        """Calcule la Value of Information contextuelle"""
        
        base_voi = question.voi
        
        # Ajustements contextuels
        adjustments = 0.0
        
        # Budget : priorité si pas de mention prix
        if question.category == "budget":
            if not self._has_budget_info(brief):
                adjustments += 0.3
            else:
                adjustments -= 0.5  # Déjà des infos budget
        
        # Timeline : priorité si urgent mentionné
        elif question.category == "timeline":
            if "urgent" in brief.get("description", "").lower():
                adjustments += 0.2
        
        # Tech : priorité si projet complexe
        elif question.category == "tech_constraints":
            complexity = brief.get("structured", {}).get("estimated_complexity", 5)
            if complexity > 7:
                adjustments += 0.3
        
        # Qualité : priorité si projet premium
        elif question.category == "quality":
            if any(word in brief.get("description", "").lower() for word in ["qualité", "haut de gamme", "premium"]):
                adjustments += 0.2
        
        # Synergie avec réponses existantes
        synergy = self._calculate_synergy(question, answers)
        
        final_voi = base_voi + adjustments + synergy
        return max(0.0, min(1.0, final_voi))
    
    def _has_budget_info(self, brief: Dict) -> bool:
        """Vérifie si le brief contient des infos budget"""
        description = brief.get("description", "").lower()
        return any(word in description for word in ["€", "budget", "prix", "coût", "tarif"])
    
    def _calculate_synergy(self, question: Question, answers: Dict) -> float:
        """Calcule la synergie avec les réponses existantes"""
        synergy = 0.0
        
        # Si on a le budget, les questions qualité deviennent plus importantes
        if "budget" in answers and question.category == "quality":
            budget_range = answers["budget"]
            if "15000€" in budget_range or "> 15000€" in budget_range:
                synergy += 0.2  # Budget élevé → qualité importante
        
        # Si urgent, les questions tech deviennent moins importantes
        if "timeline" in answers and question.category == "tech_constraints":
            if "Urgent" in answers["timeline"]:
                synergy -= 0.1  # Urgent → moins de détails tech
        
        return synergy
    
    def estimate_completion_gain(self, questions: List[Question]) -> Dict:
        """Estime le gain de complétude si ces questions sont répondues"""
        
        total_voi = sum(q.voi for q in questions)
        
        return {
            "current_score": 60,  # Score actuel estimé
            "potential_score": min(100, 60 + int(total_voi * 40)),
            "key_improvements": [
                f"Clarification {q.category}" for q in questions if q.voi > 0.7
            ],
            "time_to_complete": len(questions) * 30  # 30 sec par question
        }

# Service global
questioner_service = QuestionerService()

def get_next_questions(brief: Dict, answers: Dict = None, max_questions: int = 5) -> dict:
    """Interface simple pour l'API"""
    questions = questioner_service.select_next_questions(brief, answers, max_questions)
    completion_gain = questioner_service.estimate_completion_gain(questions)
    
    return {
        "questions": [
            {
                "text": q.text,
                "type": q.type,
                "options": q.options,
                "importance": q.importance,
                "category": q.category
            }
            for q in questions
        ],
        "completion_gain": completion_gain,
        "total_questions": len(questions)
    }
