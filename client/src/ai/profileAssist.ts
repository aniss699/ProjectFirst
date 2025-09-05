
import { AnyProfile } from "../../shared/types/profile";
import { normalizeTags, expandSynonyms, suggestKeywords, getSkillSuggestions } from "../../shared/utils/keywords";

type AIResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function callExistingAICore<T>(fn: string, payload: unknown): Promise<AIResult<T>> {
  // 1) Si une fonction globale/SDK existe déjà, l'utiliser prudemment (try/catch)
  // 2) Sinon, fallback local déterministe
  try {
    // @ts-ignore
    if (typeof window !== "undefined" && typeof window.aiCore?.[fn] === "function") {
      // @ts-ignore
      const data = await window.aiCore[fn](payload);
      return { ok: true, data };
    }
  } catch (e: any) {
    return { ok: false, error: e?.message || "AI core error" };
  }
  return { ok: false, error: "AI core unavailable" };
}

export async function aiEnhanceText(input: string): Promise<string> {
  const res = await callExistingAICore<string>("enhanceText", { input });
  if (res.ok) return res.data;
  
  // Fallback simple : capitalisation + suppression doublons espaces
  const enhanced = input
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^\w|\.\s+\w)/g, s => s.toUpperCase());
    
  // Ajouter quelques améliorations basiques
  if (enhanced.length < 50) {
    return enhanced + " Expert dans mon domaine, je m'engage à livrer des résultats de qualité dans les délais convenus.";
  }
  
  return enhanced;
}

export async function aiSuggestProfileImprovements(p: Partial<AnyProfile>): Promise<Partial<AnyProfile>> {
  const res = await callExistingAICore<Partial<AnyProfile>>("suggestProfile", p);
  if (res.ok) return res.data;
  
  // Fallback heuristique local : ajoute headline si vide, propose tags depuis bio
  const out: Partial<AnyProfile> = { ...p };
  
  if (!out.headline && p.role === "provider") {
    out.headline = "Prestataire expérimenté — réactif et orienté résultats";
  } else if (!out.headline && p.role === "client") {
    out.headline = "Client sérieux recherchant des prestations de qualité";
  }
  
  if (!out.keywords?.length && p.bio) {
    const suggestedKeywords = suggestKeywords(p.bio);
    out.keywords = expandSynonyms(normalizeTags(suggestedKeywords.slice(0, 8)));
  }
  
  if (!out.skills?.length && out.keywords?.length) {
    out.skills = getSkillSuggestions(p.role || "provider", out.keywords);
  }
  
  return out;
}

export async function aiGenerateKeywordsSkills(texts: { bio?: string; headline?: string }): Promise<{keywords: string[]; skills: string[]}> {
  const res = await callExistingAICore<{keywords: string[]; skills: string[]}>("extractTags", texts);
  if (res.ok) return res.data;
  
  const combinedText = (texts.bio || "" + " " + (texts.headline || "")).toLowerCase();
  const keywords = suggestKeywords(combinedText);
  const normalizedKeywords = expandSynonyms(normalizeTags(keywords));
  
  return { 
    keywords: normalizedKeywords.slice(0, 10), 
    skills: normalizedKeywords.slice(0, 8)
  };
}

export async function aiSuggestHeadline(bio: string, role: "client" | "provider"): Promise<string> {
  const res = await callExistingAICore<string>("generateHeadline", { bio, role });
  if (res.ok) return res.data;
  
  // Fallback basé sur le contenu de la bio
  const keywords = suggestKeywords(bio);
  
  if (role === "provider") {
    if (keywords.some(k => k.includes("développement") || k.includes("web"))) {
      return "Développeur web expérimenté - Solutions sur-mesure";
    }
    if (keywords.some(k => k.includes("design") || k.includes("graphique"))) {
      return "Designer créatif - Identité visuelle & interfaces";
    }
    if (keywords.some(k => k.includes("marketing") || k.includes("seo"))) {
      return "Expert marketing digital - Croissance & visibilité";
    }
    if (keywords.some(k => ["plomberie", "électricité", "peinture"].includes(k))) {
      return "Artisan qualifié - Travaux de qualité & garantis";
    }
    return "Prestataire professionnel - Service de qualité";
  } else {
    return "Entreprise innovante - Partenariats long terme";
  }
}

export async function aiImproveBio(currentBio: string, role: "client" | "provider"): Promise<string> {
  const res = await callExistingAICore<string>("improveBio", { bio: currentBio, role });
  if (res.ok) return res.data;
  
  // Fallback : ajouter des éléments manquants
  let improved = currentBio.trim();
  
  if (role === "provider") {
    if (!improved.includes("expérience") && !improved.includes("ans")) {
      improved += " Fort de plusieurs années d'expérience, je maîtrise parfaitement mon domaine.";
    }
    if (!improved.includes("qualité") && !improved.includes("satisfaction")) {
      improved += " Je m'engage à livrer des prestations de qualité, dans les délais convenus, avec un service client exemplaire.";
    }
  } else {
    if (!improved.includes("recherch") && !improved.includes("besoin")) {
      improved += " Nous recherchons des prestataires compétents pour nous accompagner dans nos projets.";
    }
    if (!improved.includes("partenariat") && !improved.includes("collaboration")) {
      improved += " Nous privilégions les relations de confiance et les partenariats durables.";
    }
  }
  
  return improved;
}
