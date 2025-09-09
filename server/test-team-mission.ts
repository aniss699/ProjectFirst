
import { TeamAnalysisService } from './services/team-analysis.js';

async function createTestPaintingMission() {
  const teamAnalysisService = new TeamAnalysisService();
  
  const testRequest = {
    title: "Rénovation complète : Peinture et carrelage d'un appartement 3 pièces",
    description: `Je souhaite rénover entièrement mon appartement de 70m² situé à Paris. 
    
    Travaux nécessaires :
    - Peinture de toutes les pièces (salon, 2 chambres, cuisine, salle de bain)
    - Préparation des murs (rebouchage, ponçage, sous-couche)
    - Pose de carrelage dans la salle de bain (15m²) et la cuisine (12m²)
    - Dépose de l'ancien carrelage
    - Étanchéité et joints
    - Fourniture des matériaux (peinture haut de gamme, carrelage moderne)
    
    L'appartement est habité, il faut donc organiser les travaux par phases.
    Délai souhaité : 3 semaines maximum.
    
    Je recherche des artisans qualifiés avec références et assurance décennale.`,
    category: "renovation",
    budget: "8500"
  };

  console.log("🎨 Test de création d'une mission équipe : Peinture et Carrelage");
  console.log("=" .repeat(60));
  
  try {
    const analysis = await teamAnalysisService.analyzeTeamRequirements(testRequest);
    
    console.log("📋 MISSION ANALYSÉE :");
    console.log(`Titre: ${testRequest.title}`);
    console.log(`Budget total: ${testRequest.budget}€`);
    console.log(`Catégorie: ${testRequest.category}`);
    console.log("");
    
    console.log("👥 ÉQUIPE RECOMMANDÉE :");
    console.log(`Nombre de spécialistes: ${analysis.professions.length}`);
    console.log(`Complexité: ${analysis.complexity}/10`);
    console.log(`Durée estimée: ${analysis.totalEstimatedDays} jours`);
    console.log("");
    
    analysis.professions.forEach((prof, index) => {
      console.log(`${index + 1}. ${prof.profession.toUpperCase()}`);
      console.log(`   💰 Budget: ${prof.estimated_budget}€`);
      console.log(`   📅 Durée: ${prof.estimated_days} jours`);
      console.log(`   ⭐ Importance: ${prof.importance}`);
      console.log(`   👤 Lead: ${prof.is_lead_role ? 'Oui' : 'Non'}`);
      console.log(`   🛠️ Compétences: ${prof.required_skills.join(', ')}`);
      console.log(`   📝 Description: ${prof.description}`);
      console.log(`   📈 Expérience min: ${prof.min_experience} ans`);
      console.log("");
    });
    
    console.log("🔄 BESOINS DE COORDINATION :");
    analysis.coordination_needs.forEach(need => {
      console.log(`   • ${need}`);
    });
    
    console.log("");
    console.log("✅ Test terminé avec succès !");
    
    return analysis;
    
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
    throw error;
  }
}

// Exécuter le test si le fichier est appelé directement
if (import.meta.url === new URL(import.meta.url).href) {
  createTestPaintingMission()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createTestPaintingMission };
