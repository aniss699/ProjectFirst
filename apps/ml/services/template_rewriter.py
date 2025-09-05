
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
import re

logger = logging.getLogger(__name__)

@dataclass
class RewrittenProject:
    title_std: str
    summary_std: str
    acceptance_criteria: List[str]
    tasks_std: List[Dict[str, any]]
    deliverables_std: List[Dict[str, any]]
    rewrite_version: str

class TemplateRewriter:
    def __init__(self):
        self.version = "1.0.0"
        self._init_templates()

    def _init_templates(self):
        """Initialise les templates par catégorie"""
        self.templates = {
            'web_development': {
                'title_pattern': 'Développement {type_site} - {purpose}',
                'summary_structure': [
                    'Vision et objectifs du projet web',
                    'Technologies et contraintes techniques',
                    'Fonctionnalités principales attendues',
                    'Design et expérience utilisateur',
                    'Hébergement et mise en production'
                ],
                'acceptance_criteria_base': [
                    'Site web fonctionnel et responsive',
                    'Code propre et documenté',
                    'Tests unitaires et d\'intégration',
                    'Performance optimisée (< 3s de chargement)',
                    'Compatible tous navigateurs récents'
                ],
                'tasks_template': [
                    {'name': 'Analyse et conception', 'estimated_hours': 8},
                    {'name': 'Développement frontend', 'estimated_hours': 24},
                    {'name': 'Développement backend', 'estimated_hours': 16},
                    {'name': 'Intégration et tests', 'estimated_hours': 8},
                    {'name': 'Déploiement et documentation', 'estimated_hours': 4}
                ],
                'deliverables_template': [
                    {'name': 'Code source complet', 'format': 'Repository Git'},
                    {'name': 'Documentation technique', 'format': 'Markdown/PDF'},
                    {'name': 'Guide utilisateur', 'format': 'PDF'},
                    {'name': 'Application déployée', 'format': 'URL de production'}
                ]
            },
            
            'mobile_development': {
                'title_pattern': 'Application Mobile {platform} - {purpose}',
                'summary_structure': [
                    'Vision et objectifs de l\'application mobile',
                    'Plateformes cibles et technologies',
                    'Fonctionnalités et expérience utilisateur',
                    'Performance et optimisation requises',
                    'Publication et distribution'
                ],
                'acceptance_criteria_base': [
                    'Application native/cross-platform fonctionnelle',
                    'Design responsive adapté à tous écrans',
                    'Performance optimale (< 3s de chargement)',
                    'Publication sur stores réussie',
                    'Tests sur appareils multiples validés'
                ],
                'tasks_template': [
                    {'name': 'Conception UX/UI', 'estimated_hours': 12},
                    {'name': 'Développement natif/hybride', 'estimated_hours': 32},
                    {'name': 'Intégration API et services', 'estimated_hours': 16},
                    {'name': 'Tests et optimisation', 'estimated_hours': 12},
                    {'name': 'Publication stores', 'estimated_hours': 8}
                ],
                'deliverables_template': [
                    {'name': 'Application mobile complète', 'format': 'APK/IPA'},
                    {'name': 'Code source', 'format': 'Repository Git'},
                    {'name': 'Documentation technique', 'format': 'Markdown'},
                    {'name': 'Publication sur stores', 'format': 'Liens stores'}
                ]
            },

            'design': {
                'title_pattern': 'Design {type_design} - {purpose}',
                'summary_structure': [
                    'Brief créatif et objectifs visuels',
                    'Identité de marque et guidelines',
                    'Supports et formats requis',
                    'Style et inspirations',
                    'Livraison et utilisation'
                ],
                'acceptance_criteria_base': [
                    'Designs conformes au brief créatif',
                    'Fichiers sources modifiables fournis',
                    'Formats d\'export optimisés',
                    'Charte graphique respectée',
                    'Validation client obtenue'
                ],
                'tasks_template': [
                    {'name': 'Recherche et moodboard', 'estimated_hours': 4},
                    {'name': 'Concepts et esquisses', 'estimated_hours': 8},
                    {'name': 'Réalisation designs finaux', 'estimated_hours': 16},
                    {'name': 'Déclinaisons et exports', 'estimated_hours': 6},
                    {'name': 'Présentation et ajustements', 'estimated_hours': 4}
                ],
                'deliverables_template': [
                    {'name': 'Designs finaux HD', 'format': 'PNG/JPG/SVG'},
                    {'name': 'Fichiers sources', 'format': 'PSD/AI/Figma'},
                    {'name': 'Charte graphique', 'format': 'PDF'},
                    {'name': 'Déclinaisons formats', 'format': 'Archive ZIP'}
                ]
            },

            'marketing': {
                'title_pattern': 'Stratégie Marketing {type_marketing} - {purpose}',
                'summary_structure': [
                    'Objectifs marketing et KPIs',
                    'Cible et personas',
                    'Canaux et stratégies',
                    'Contenus et planning',
                    'Mesure et optimisation'
                ],
                'acceptance_criteria_base': [
                    'Stratégie claire et actionnable',
                    'Contenus créés et programmés',
                    'Campagnes configurées et lancées',
                    'Reporting et suivi mis en place',
                    'Objectifs mesurables atteints'
                ],
                'tasks_template': [
                    {'name': 'Audit et analyse concurrentielle', 'estimated_hours': 8},
                    {'name': 'Définition stratégie et personas', 'estimated_hours': 6},
                    {'name': 'Création contenus et campagnes', 'estimated_hours': 20},
                    {'name': 'Mise en place et lancement', 'estimated_hours': 8},
                    {'name': 'Suivi et optimisation', 'estimated_hours': 8}
                ],
                'deliverables_template': [
                    {'name': 'Stratégie marketing', 'format': 'Document PDF'},
                    {'name': 'Personas et ciblage', 'format': 'Présentation'},
                    {'name': 'Contenus créés', 'format': 'Archive médias'},
                    {'name': 'Reporting mensuel', 'format': 'Dashboard/PDF'}
                ]
            },

            'default': {
                'title_pattern': 'Projet {category} - {purpose}',
                'summary_structure': [
                    'Contexte et objectifs du projet',
                    'Périmètre et contraintes',
                    'Livrables attendus',
                    'Critères de réussite',
                    'Planning et modalités'
                ],
                'acceptance_criteria_base': [
                    'Livrables conformes au cahier des charges',
                    'Qualité professionnelle respectée',
                    'Délais et budget respectés',
                    'Communication régulière maintenue',
                    'Satisfaction client validée'
                ],
                'tasks_template': [
                    {'name': 'Analyse des besoins', 'estimated_hours': 4},
                    {'name': 'Conception et planification', 'estimated_hours': 8},
                    {'name': 'Réalisation principale', 'estimated_hours': 24},
                    {'name': 'Tests et validations', 'estimated_hours': 6},
                    {'name': 'Livraison et documentation', 'estimated_hours': 4}
                ],
                'deliverables_template': [
                    {'name': 'Livrable principal', 'format': 'À définir'},
                    {'name': 'Documentation', 'format': 'PDF'},
                    {'name': 'Code source/fichiers', 'format': 'Archive'},
                    {'name': 'Guide d\'utilisation', 'format': 'Document'}
                ]
            }
        }

    def rewrite_project(self, 
                       original_title: str, 
                       original_description: str,
                       category: str,
                       sub_category: str = None,
                       skills: List[str] = None) -> RewrittenProject:
        """Réécrit un projet selon les templates de qualité"""
        
        # Sélection du template approprié
        template_key = self._select_template(category, sub_category)
        template = self.templates.get(template_key, self.templates['default'])
        
        # Extraction des informations du projet original
        project_info = self._extract_project_info(original_title, original_description)
        
        # Génération du titre standardisé
        title_std = self._generate_title(template, project_info, category)
        
        # Génération du résumé structuré
        summary_std = self._generate_summary(template, project_info, original_description)
        
        # Génération des critères d'acceptation
        acceptance_criteria = self._generate_acceptance_criteria(template, project_info, skills)
        
        # Génération des tâches
        tasks_std = self._generate_tasks(template, project_info)
        
        # Génération des livrables
        deliverables_std = self._generate_deliverables(template, project_info)
        
        return RewrittenProject(
            title_std=title_std,
            summary_std=summary_std,
            acceptance_criteria=acceptance_criteria,
            tasks_std=tasks_std,
            deliverables_std=deliverables_std,
            rewrite_version=self.version
        )

    def _select_template(self, category: str, sub_category: str = None) -> str:
        """Sélectionne le template approprié"""
        category_lower = category.lower()
        
        template_mapping = {
            'développement': 'web_development',
            'dev': 'web_development',
            'web': 'web_development',
            'mobile': 'mobile_development',
            'app': 'mobile_development',
            'design': 'design',
            'graphisme': 'design',
            'ui': 'design',
            'ux': 'design',
            'marketing': 'marketing',
            'communication': 'marketing',
            'seo': 'marketing',
            'publicité': 'marketing'
        }
        
        return template_mapping.get(category_lower, 'default')

    def _extract_project_info(self, title: str, description: str) -> Dict[str, any]:
        """Extrait les informations clés du projet"""
        info = {
            'purpose': 'améliorer la productivité',
            'type_site': 'application web',
            'type_design': 'interface utilisateur',
            'type_marketing': 'digital',
            'platform': 'web',
            'complexity': 'moyenne'
        }
        
        # Analyse du titre et de la description
        text = (title + ' ' + description).lower()
        
        # Détection du type de projet
        if any(word in text for word in ['ecommerce', 'boutique', 'vente', 'shop']):
            info['type_site'] = 'site e-commerce'
            info['purpose'] = 'vendre en ligne'
        elif any(word in text for word in ['vitrine', 'présentation', 'corporate']):
            info['type_site'] = 'site vitrine'
            info['purpose'] = 'présenter l\'entreprise'
        elif any(word in text for word in ['blog', 'actualités', 'news']):
            info['type_site'] = 'blog/magazine'
            info['purpose'] = 'publier du contenu'
        elif any(word in text for word in ['intranet', 'gestion', 'crm', 'erp']):
            info['type_site'] = 'application métier'
            info['purpose'] = 'gérer l\'activité'
        
        # Détection de la plateforme mobile
        if any(word in text for word in ['ios', 'iphone', 'ipad']):
            info['platform'] = 'iOS'
        elif any(word in text for word in ['android']):
            info['platform'] = 'Android'
        elif any(word in text for word in ['react native', 'flutter', 'cross-platform']):
            info['platform'] = 'Cross-platform'
        
        # Détection de la complexité
        if any(word in text for word in ['simple', 'basique', 'léger']):
            info['complexity'] = 'simple'
        elif any(word in text for word in ['complexe', 'avancé', 'sophistiqué']):
            info['complexity'] = 'complexe'
        
        return info

    def _generate_title(self, template: Dict, project_info: Dict, category: str) -> str:
        """Génère un titre standardisé"""
        title_pattern = template.get('title_pattern', 'Projet {category} - {purpose}')
        
        # Remplacement des variables
        title = title_pattern.format(
            category=category.title(),
            purpose=project_info['purpose'],
            type_site=project_info['type_site'],
            type_design=project_info['type_design'],
            type_marketing=project_info['type_marketing'],
            platform=project_info['platform']
        )
        
        return title

    def _generate_summary(self, template: Dict, project_info: Dict, original_description: str) -> str:
        """Génère un résumé structuré"""
        structure = template.get('summary_structure', [])
        
        # Extraction d'informations de la description originale
        description_lower = original_description.lower()
        
        summary_parts = []
        
        for section in structure:
            if 'objectifs' in section.lower():
                summary_parts.append(f"**{section}** : {self._extract_objectives(description_lower)}")
            elif 'technologies' in section.lower() or 'techniques' in section.lower():
                summary_parts.append(f"**{section}** : {self._extract_tech_requirements(description_lower)}")
            elif 'fonctionnalités' in section.lower():
                summary_parts.append(f"**{section}** : {self._extract_features(description_lower)}")
            elif 'design' in section.lower():
                summary_parts.append(f"**{section}** : Interface moderne et intuitive, expérience utilisateur optimisée")
            elif 'planning' in section.lower() or 'modalités' in section.lower():
                summary_parts.append(f"**{section}** : Développement agile avec livraisons incrementales")
            else:
                summary_parts.append(f"**{section}** : À définir selon vos besoins spécifiques")
        
        return '\n\n'.join(summary_parts)

    def _extract_objectives(self, description: str) -> str:
        """Extrait les objectifs de la description"""
        if 'augmenter' in description or 'améliorer' in description:
            return "Améliorer la performance et l'efficacité des processus existants"
        elif 'nouveau' in description or 'créer' in description:
            return "Créer une nouvelle solution adaptée aux besoins métier"
        elif 'moderniser' in description or 'refonte' in description:
            return "Moderniser les outils et processus actuels"
        else:
            return "Répondre aux besoins spécifiques de l'entreprise"

    def _extract_tech_requirements(self, description: str) -> str:
        """Extrait les exigences techniques"""
        tech_found = []
        
        tech_keywords = {
            'react': 'React.js',
            'vue': 'Vue.js',
            'angular': 'Angular',
            'node': 'Node.js',
            'php': 'PHP',
            'python': 'Python',
            'wordpress': 'WordPress',
            'mysql': 'MySQL',
            'postgresql': 'PostgreSQL'
        }
        
        for keyword, tech in tech_keywords.items():
            if keyword in description:
                tech_found.append(tech)
        
        if tech_found:
            return f"Technologies demandées : {', '.join(tech_found)}"
        else:
            return "Technologies modernes et éprouvées, à définir selon les besoins"

    def _extract_features(self, description: str) -> str:
        """Extrait les fonctionnalités mentionnées"""
        features = []
        
        feature_keywords = {
            'authentification': 'Système d\'authentification',
            'paiement': 'Gestion des paiements',
            'admin': 'Interface d\'administration',
            'api': 'API REST',
            'mobile': 'Version mobile responsive',
            'email': 'Notifications par email',
            'search': 'Moteur de recherche',
            'chat': 'Système de messagerie'
        }
        
        for keyword, feature in feature_keywords.items():
            if keyword in description:
                features.append(feature)
        
        if features:
            return ', '.join(features)
        else:
            return "Fonctionnalités essentielles selon le cahier des charges"

    def _generate_acceptance_criteria(self, template: Dict, project_info: Dict, skills: List[str] = None) -> List[str]:
        """Génère les critères d'acceptation SMART"""
        base_criteria = template.get('acceptance_criteria_base', [])
        
        # Critères spécifiques selon les compétences
        specific_criteria = []
        skills = skills or []
        
        if any(skill.lower() in ['react', 'vue', 'angular'] for skill in skills):
            specific_criteria.append('Interface utilisateur moderne et interactive')
        
        if any(skill.lower() in ['seo', 'référencement'] for skill in skills):
            specific_criteria.append('Optimisation SEO complète et mesurable')
        
        if any(skill.lower() in ['security', 'sécurité'] for skill in skills):
            specific_criteria.append('Sécurité renforcée et conformité RGPD')
        
        return base_criteria + specific_criteria

    def _generate_tasks(self, template: Dict, project_info: Dict) -> List[Dict[str, any]]:
        """Génère les tâches avec estimations"""
        base_tasks = template.get('tasks_template', [])
        
        # Ajustement des estimations selon la complexité
        complexity_multiplier = {
            'simple': 0.7,
            'moyenne': 1.0,
            'complexe': 1.5
        }
        
        multiplier = complexity_multiplier.get(project_info['complexity'], 1.0)
        
        adjusted_tasks = []
        for task in base_tasks:
            adjusted_task = task.copy()
            adjusted_task['estimated_hours'] = int(task['estimated_hours'] * multiplier)
            adjusted_tasks.append(adjusted_task)
        
        return adjusted_tasks

    def _generate_deliverables(self, template: Dict, project_info: Dict) -> List[Dict[str, any]]:
        """Génère les livrables attendus"""
        return template.get('deliverables_template', [])

    def get_rewrite_stats(self) -> Dict[str, any]:
        """Retourne les statistiques de réécriture"""
        return {
            'version': self.version,
            'available_templates': list(self.templates.keys()),
            'template_count': len(self.templates),
            'categories_supported': [
                'développement web',
                'développement mobile',
                'design',
                'marketing',
                'services généraux'
            ]
        }
