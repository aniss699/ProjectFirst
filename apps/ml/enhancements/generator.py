
"""
Service de génération d'annonces optimisées
Sert à réduire l'effort utilisateur et améliorer la qualité
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
import random

@dataclass
class BriefVariant:
    type: str  # 'clair', 'pro', 'premium'
    title: str
    description: str
    explanation: str
    estimated_appeal: int  # 1-10

@dataclass
class GeneratedBrief:
    variants: List[BriefVariant]
    sow: Dict
    questions: List[str]
    templates: Dict

class GeneratorService:
    """Génère des variantes d'annonces optimisées"""
    
    def __init__(self):
        self.templates = self._load_templates()
        self.sow_templates = self._load_sow_templates()
    
    def _load_templates(self) -> Dict:
        """Templates par catégorie"""
        return {
            "développement web": {
                "title_patterns": [
                    "Développement de {type_site} {tech_stack}",
                    "Création {type_site} avec {features}",
                    "{type_site} sur mesure - {tech_stack}"
                ],
                "intro_patterns": [
                    "Nous recherchons un développeur expérimenté pour créer {description}.",
                    "Projet de développement : {description}.",
                    "Mission : développer {description} avec les technologies {tech_stack}."
                ]
            },
            "design graphique": {
                "title_patterns": [
                    "Création {type_design} pour {secteur}",
                    "Design {type_design} - {style}",
                    "{type_design} professionnel {secteur}"
                ],
                "intro_patterns": [
                    "Nous cherchons un designer pour créer {description}.",
                    "Projet de design : {description}.",
                    "Mission graphique : {description} dans l'esprit {style}."
                ]
            }
        }
    
    def _load_sow_templates(self) -> Dict:
        """Templates SOW par catégorie"""
        return {
            "développement web": {
                "livrables": [
                    "Code source complet et documenté",
                    "Site web responsive et testé",
                    "Documentation technique",
                    "Formation utilisateur (optionnel)"
                ],
                "criteres_acceptance": [
                    "Compatibilité navigateurs (Chrome, Firefox, Safari)",
                    "Responsive design mobile et tablette",
                    "Temps de chargement < 3 secondes",
                    "Code validé W3C"
                ],
                "jalons": [
                    "Maquette et wireframes (20%)",
                    "Développement front-end (40%)",
                    "Intégration back-end (30%)",
                    "Tests et livraison (10%)"
                ]
            },
            "design graphique": {
                "livrables": [
                    "Fichiers sources (AI, PSD, Sketch)",
                    "Exports haute résolution (PNG, JPG)",
                    "Versions web optimisées",
                    "Charte graphique (si applicable)"
                ],
                "criteres_acceptance": [
                    "Qualité print 300 DPI minimum",
                    "Versions couleur et noir/blanc",
                    "Formats vectoriels modifiables",
                    "Respect de l'identité visuelle"
                ],
                "jalons": [
                    "Concepts et premières pistes (30%)",
                    "Développement créatif (40%)",
                    "Finalisation et déclinaisons (30%)"
                ]
            }
        }
    
    def generate_variants(self, title: str, description: str, category: str) -> GeneratedBrief:
        """Génère 3 variantes optimisées"""
        
        # Analyse du brief original
        context = self._analyze_context(title, description, category)
        
        # Génération des 3 variantes
        variants = [
            self._generate_clear_variant(context),
            self._generate_pro_variant(context),
            self._generate_premium_variant(context)
        ]
        
        # SOW adaptée
        sow = self._generate_sow(category, context)
        
        # Questions de clarification
        questions = self._generate_questions(context)
        
        # Template personnalisé
        templates = self._get_category_template(category)
        
        return GeneratedBrief(
            variants=variants,
            sow=sow,
            questions=questions,
            templates=templates
        )
    
    def _analyze_context(self, title: str, description: str, category: str) -> Dict:
        """Analyse le contexte pour adaptation"""
        return {
            "original_title": title,
            "original_description": description,
            "category": category,
            "complexity": self._estimate_complexity(description),
            "urgency": "urgent" in description.lower(),
            "budget_mentioned": any(word in description.lower() for word in ["€", "budget", "prix"]),
            "tech_stack": self._extract_tech_stack(description),
            "tone": self._detect_tone(description)
        }
    
    def _generate_clear_variant(self, context: Dict) -> BriefVariant:
        """Variante claire et accessible"""
        title = f"{context['category'].title()} - {context['original_title']}"
        
        description = f"""
**Projet :** {context['original_description'][:100]}...

**Ce que nous recherchons :**
• Un professionnel expérimenté en {context['category']}
• Approche collaborative et communication claire
• Respect des délais et de la qualité

**Livrables attendus :**
• Solution fonctionnelle et testée
• Documentation simple
• Support post-livraison

**Prochaines étapes :**
Présentez-nous votre approche et vos références similaires.
        """.strip()
        
        return BriefVariant(
            type="clair",
            title=title,
            description=description,
            explanation="Version accessible, met l'accent sur la clarté et la collaboration",
            estimated_appeal=7
        )
    
    def _generate_pro_variant(self, context: Dict) -> BriefVariant:
        """Variante professionnelle détaillée"""
        title = f"Mission {context['category']} - {context['original_title']}"
        
        tech_details = f" Technologies : {', '.join(context['tech_stack'])}" if context['tech_stack'] else ""
        
        description = f"""
**Contexte du projet :**
{context['original_description']}

**Spécifications techniques :**{tech_details}
• Complexité estimée : {context['complexity']}/10
• Approche méthodologique requise
• Standards industriels respectés

**Profil recherché :**
• Expertise confirmée ({context['category']})
• Portfolio de références similaires
• Capacité de conseil et d'optimisation

**Modalités :**
• Méthodologie transparente
• Points d'étape réguliers
• Garantie de résultat

Merci de détailler votre méthodologie et timeline.
        """.strip()
        
        return BriefVariant(
            type="pro",
            title=title,
            description=description,
            explanation="Version professionnelle, détaille les aspects techniques et méthodologiques",
            estimated_appeal=8
        )
    
    def _generate_premium_variant(self, context: Dict) -> BriefVariant:
        """Variante premium avec valeur ajoutée"""
        title = f"Projet stratégique {context['category']} - {context['original_title']}"
        
        description = f"""
**Vision du projet :**
{context['original_description']}

**Ambition :**
Créer une solution d'excellence qui dépasse les attentes et génère de la valeur à long terme.

**Approche premium :**
• Analyse stratégique préalable
• Solution sur-mesure et évolutive  
• Optimisations performance et UX
• Accompagnement post-projet

**Partenaire recherché :**
• Expert reconnu avec vision stratégique
• Approche consultative et proactive
• Engagement qualité et innovation
• Références de projets d'envergure

**Engagement mutuel :**
• Collaboration étroite et transparente
• Investissement dans l'excellence
• Relation de confiance long terme

Présentez votre vision et proposition de valeur unique.
        """.strip()
        
        return BriefVariant(
            type="premium",
            title=title,
            description=description,
            explanation="Version premium, positionne le projet comme stratégique avec forte valeur ajoutée",
            estimated_appeal=9
        )
    
    def _generate_sow(self, category: str, context: Dict) -> Dict:
        """Génère une SOW adaptée"""
        template = self.sow_templates.get(category, self.sow_templates["développement web"])
        
        return {
            "livrables": template["livrables"],
            "criteres_acceptance": template["criteres_acceptance"],
            "jalons": template["jalons"],
            "garanties": [
                "Correction des bugs pendant 30 jours",
                "Code source et documentation remis",
                "Formation utilisateur incluse"
            ],
            "clauses_specifiques": self._generate_specific_clauses(context)
        }
    
    def _generate_questions(self, context: Dict) -> List[str]:
        """Génère des questions de clarification ciblées"""
        questions = []
        
        if not context["budget_mentioned"]:
            questions.append("Quel est votre budget approximatif pour ce projet ?")
        
        if context["complexity"] > 6:
            questions.append("Avez-vous des contraintes techniques spécifiques ?")
        
        if context["urgency"]:
            questions.append("Quelle est votre deadline absolue ?")
        
        questions.extend([
            "Avez-vous des références visuelles ou exemples inspirants ?",
            "Qui sera votre interlocuteur principal pour ce projet ?"
        ])
        
        return questions[:5]  # Max 5 questions
    
    def _estimate_complexity(self, description: str) -> int:
        """Estime la complexité (1-10)"""
        complexity = 3
        
        complex_terms = ["api", "intégration", "migration", "sécurité", "performance"]
        complexity += sum(1 for term in complex_terms if term in description.lower())
        
        if len(description.split()) > 100:
            complexity += 2
        
        return min(complexity, 10)
    
    def _extract_tech_stack(self, description: str) -> List[str]:
        """Extrait les technologies mentionnées"""
        tech_keywords = ["react", "vue", "angular", "node", "php", "python", "wordpress"]
        desc_lower = description.lower()
        
        return [tech for tech in tech_keywords if tech in desc_lower]
    
    def _detect_tone(self, description: str) -> str:
        """Détecte le ton du brief"""
        if any(word in description.lower() for word in ["professionnel", "entreprise", "stratégique"]):
            return "professionnel"
        elif any(word in description.lower() for word in ["simple", "basique", "petit"]):
            return "décontracté"
        else:
            return "neutre"
    
    def _get_category_template(self, category: str) -> Dict:
        """Retourne le template de la catégorie"""
        return self.templates.get(category, self.templates.get("développement web", {}))
    
    def _generate_specific_clauses(self, context: Dict) -> List[str]:
        """Génère des clauses spécifiques au contexte"""
        clauses = []
        
        if context["urgency"]:
            clauses.append("Délai prioritaire avec bonus performance")
        
        if context["complexity"] > 7:
            clauses.append("Phases de validation intermédiaires obligatoires")
        
        return clauses

# Service global
generator_service = GeneratorService()

def generate_brief_variants(title: str, description: str, category: str) -> dict:
    """Interface simple pour l'API"""
    result = generator_service.generate_variants(title, description, category)
    
    return {
        "variants": [
            {
                "type": v.type,
                "title": v.title,
                "description": v.description,
                "explanation": v.explanation,
                "estimated_appeal": v.estimated_appeal
            }
            for v in result.variants
        ],
        "sow": result.sow,
        "questions": result.questions,
        "templates": result.templates
    }
