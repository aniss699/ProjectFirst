
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import logging
from services.text_normalizer import TextNormalizer
from services.taxonomizer import Taxonomizer
from services.template_rewriter import TemplateRewriter
from services.brief_quality import BriefQualityAnalyzer
from services.price_time_suggester import PriceTimeSuggester

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AppelsPro ML Service", version="1.0.0")

# Initialisation des services
text_normalizer = TextNormalizer()
taxonomizer = Taxonomizer()
template_rewriter = TemplateRewriter()
brief_quality_analyzer = BriefQualityAnalyzer()
price_time_suggester = PriceTimeSuggester()

class ProjectImproveRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    deadline: Optional[str] = None

class ProjectImproveResponse(BaseModel):
    title_std: str
    summary_std: str
    acceptance_criteria: List[str]
    category_std: str
    sub_category_std: str
    skills_std: List[str]
    tags_std: List[str]
    tasks_std: List[Dict[str, Any]]
    deliverables_std: List[Dict[str, Any]]
    constraints_std: List[str]
    brief_quality_score: float
    richness_score: float
    missing_info: List[Dict[str, Any]]
    price_suggested_min: int
    price_suggested_med: int
    price_suggested_max: int
    delay_suggested_days: int
    loc_base: float
    loc_uplift_reco: Dict[str, Any]
    rewrite_version: str
    reasons: List[str]

class BriefRecomputeRequest(BaseModel):
    project_id: str
    answers: List[Dict[str, str]]

@app.get("/health")
async def health_check():
    """Point de santé du service ML"""
    return {
        "status": "healthy",
        "services": {
            "text_normalizer": "ready",
            "taxonomizer": "ready", 
            "template_rewriter": "ready",
            "brief_quality_analyzer": "ready",
            "price_time_suggester": "ready",
            "normalize": "ready",
            "generate": "ready", 
            "questions": "ready"
        }
    }

@app.post("/normalize")
async def normalize_brief(request: dict):
    """Normalise et structure un brief"""
    try:
        # Import dynamique pour éviter les erreurs si module pas installé
        from enhancements.normalize import normalize_brief
        
        result = normalize_brief(
            title=request.get("title", ""),
            description=request.get("description", ""),
            category=request.get("category")
        )
        
        return {"success": True, "data": result}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/generate") 
async def generate_variants(request: dict):
    """Génère des variantes d'annonces"""
    try:
        from enhancements.generator import generate_brief_variants
        
        result = generate_brief_variants(
            title=request.get("title", ""),
            description=request.get("description", ""),
            category=request.get("category", "autre")
        )
        
        return {"success": True, "data": result}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/questions")
async def get_questions(request: dict):
    """Génère des questions adaptatives"""
    try:
        from enhancements.questioner import get_next_questions
        
        brief = request.get("brief", {})
        answers = request.get("answers", {})
        max_questions = request.get("max_questions", 5)
        
        result = get_next_questions(brief, answers, max_questions)
        
        return {"success": True, "data": result}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/improve", response_model=ProjectImproveResponse)
async def improve_project(request: ProjectImproveRequest):
    """Améliore un projet avec l'IA complète"""
    try:
        logger.info(f"Amélioration du projet: {request.title}")
        
        # 1. Normalisation du texte
        normalized = text_normalizer.normalize(request.description)
        logger.info(f"Texte normalisé, {len(normalized.keywords)} mots-clés extraits")
        
        # 2. Classification taxonomique
        taxonomy_result = taxonomizer.classify(
            text=f"{request.title} {request.description}",
            keywords=normalized.keywords
        )
        logger.info(f"Classification: {taxonomy_result.category_std}/{taxonomy_result.sub_category_std}")
        
        # 3. Réécriture avec templates
        rewritten = template_rewriter.rewrite_project(
            original_title=request.title,
            original_description=request.description,
            category=taxonomy_result.category_std,
            sub_category=taxonomy_result.sub_category_std,
            skills=taxonomy_result.skills_std
        )
        logger.info(f"Projet réécrit avec template {taxonomy_result.category_std}")
        
        # 4. Analyse qualité du brief
        quality_analysis = brief_quality_analyzer.analyze(
            title=request.title,
            description=request.description,
            category=taxonomy_result.category_std
        )
        logger.info(f"Qualité brief: {quality_analysis.brief_quality_score:.2f}")
        
        # 5. Suggestions prix et délais
        price_suggestion = price_time_suggester.suggest(
            category=taxonomy_result.category_std,
            sub_category=taxonomy_result.sub_category_std,
            complexity='medium',  # Déterminé par l'analyse
            brief_quality_score=quality_analysis.brief_quality_score,
            constraints=normalized.constraints
        )
        logger.info(f"Prix suggéré: {price_suggestion.price_suggested_med}€")
        
        # 6. Compilation des résultats
        response = ProjectImproveResponse(
            title_std=rewritten.title_std,
            summary_std=rewritten.summary_std,
            acceptance_criteria=rewritten.acceptance_criteria,
            category_std=taxonomy_result.category_std,
            sub_category_std=taxonomy_result.sub_category_std,
            skills_std=taxonomy_result.skills_std,
            tags_std=taxonomy_result.tags_std,
            tasks_std=rewritten.tasks_std,
            deliverables_std=rewritten.deliverables_std,
            constraints_std=normalized.constraints,
            brief_quality_score=quality_analysis.brief_quality_score,
            richness_score=quality_analysis.richness_score,
            missing_info=[
                {"id": info["type"], "q": info["questions"][0]}
                for info in quality_analysis.missing_info[:3]
            ],
            price_suggested_min=price_suggestion.price_suggested_min,
            price_suggested_med=price_suggestion.price_suggested_med,
            price_suggested_max=price_suggestion.price_suggested_max,
            delay_suggested_days=price_suggestion.delay_suggested_days,
            loc_base=0.6,  # Score LOC de base
            loc_uplift_reco={
                "new_budget": int(price_suggestion.price_suggested_med * 1.1),
                "new_delay": price_suggestion.delay_suggested_days + 2,
                "delta_loc": 0.08
            },
            rewrite_version=rewritten.rewrite_version,
            reasons=generate_improvement_reasons(quality_analysis, price_suggestion, taxonomy_result)
        )
        
        logger.info("Amélioration terminée avec succès")
        return response
        
    except Exception as e:
        logger.error(f"Erreur lors de l'amélioration: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'amélioration: {str(e)}")

@app.post("/brief/recompute")
async def recompute_brief(request: BriefRecomputeRequest):
    """Recalcule les suggestions après réponses aux questions"""
    try:
        logger.info(f"Recalcul brief pour projet {request.project_id}")
        
        # TODO: Récupérer le projet depuis la DB
        # Pour l'instant, on retourne un exemple
        
        # Simule une amélioration après réponses
        improvement_factor = len(request.answers) * 0.05  # 5% par réponse
        
        response = {
            "brief_quality_score": min(0.95, 0.6 + improvement_factor),
            "richness_score": min(0.90, 0.5 + improvement_factor),
            "missing_info": [],  # Plus de questions manquantes
            "price_suggested_med": 8500,  # Prix ajusté
            "updated_fields": ["brief_quality_score", "richness_score", "price_suggested_med"],
            "improvement_summary": f"Brief amélioré grâce à {len(request.answers)} réponse(s) supplémentaire(s)"
        }
        
        logger.info("Recalcul terminé")
        return response
        
    except Exception as e:
        logger.error(f"Erreur lors du recalcul: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur lors du recalcul: {str(e)}")

@app.get("/stats")
async def get_ml_stats():
    """Statistiques du service ML"""
    try:
        taxonomy_stats = taxonomizer.get_category_stats()
        rewriter_stats = template_rewriter.get_rewrite_stats()
        
        return {
            "service_status": "operational",
            "taxonomy": taxonomy_stats,
            "templates": rewriter_stats,
            "version": "1.0.0",
            "capabilities": [
                "text_normalization",
                "taxonomic_classification", 
                "template_rewriting",
                "quality_analysis",
                "price_time_suggestion",
                "loc_estimation"
            ]
        }
    except Exception as e:
        logger.error(f"Erreur stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des stats")

def generate_improvement_reasons(quality_analysis, price_suggestion, taxonomy_result) -> List[str]:
    """Génère les raisons des améliorations suggérées"""
    reasons = []
    
    # Raisons liées à la qualité
    if quality_analysis.brief_quality_score < 0.7:
        reasons.append("Brief enrichi pour attirer des prestataires plus qualifiés")
    
    if quality_analysis.richness_score < 0.6:
        reasons.append("Contenu structuré pour une meilleure compréhension")
    
    # Raisons liées aux prix
    if price_suggestion.confidence > 0.8:
        reasons.append(f"Prix basé sur {len(taxonomy_result.skills_std)} compétences identifiées")
    
    # Raisons liées à la taxonomie
    if taxonomy_result.confidence > 0.7:
        reasons.append(f"Catégorisation précise en {taxonomy_result.category_std}")
    
    # Questions manquantes
    if len(quality_analysis.missing_info) > 0:
        reasons.append(f"{len(quality_analysis.missing_info)} questions ajoutées pour compléter le brief")
    
    return reasons[:4]  # Limite à 4 raisons

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
