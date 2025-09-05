// Types
interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'PRO' | 'ADMIN';
  rating_mean?: number;
  rating_count?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED';
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
  deadline?: string | null;
  location?: string;
  tags?: string[];
}

interface Bid {
  id: string;
  projectId: string;
  providerId: string;
  amount: number;
  timeline_days: number;
  message: string;
  score_breakdown?: any;
  is_leading: boolean;
  flagged: boolean;
  createdAt: Date;
}

export const storage = {
  users: [] as User[],
  projects: [] as Project[],
  bids: [] as Bid[],
  projectStandardizations: [] as any[],
  webSources: [] as any[],
  webDocs: [] as any[],
  externalCompanies: [] as any[],
  externalCompanySignals: [] as any[],
  sourcingMatches: [] as any[],
  projectChangeLogs: [] as any[],
  recentErrors: [] as any[],

  // User methods
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const user: User = {
      id: `user_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };
    storage.users.push(user);
    return user;
  },

  getUser: (id: string) => storage.users.find(u => u.id === id),
  getUsers: () => storage.users,

  // Project methods
  createProject: (data: {
    title: string;
    description: string;
    category: string;
    budget: string;
    status: string;
    clientId: string;
    deadline?: string | null;
    location?: string;
    tags?: string[];
  }) => {
    const project = {
      id: `project_${Date.now()}`,
      title: data.title,
      description: data.description,
      category: data.category,
      budget: data.budget,
      status: data.status,
      clientId: data.clientId,
      deadline: data.deadline || null,
      location: data.location || 'Remote',
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    storage.projects.push(project as Project);
    return project as Project;
  },

  getProject: (id: string) => storage.projects.find(p => p.id === id),
  getProjects: () => storage.projects,
  updateProject: (id: string, updates: Partial<Project>) => {
    const index = storage.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      storage.projects[index] = { ...storage.projects[index], ...updates, updatedAt: new Date() };
      return storage.projects[index];
    }
    return null;
  },

  // Bid methods
  createBid: (bidData: Omit<Bid, 'id' | 'createdAt'>) => {
    const bid: Bid = {
      id: `bid_${Date.now()}`,
      createdAt: new Date(),
      ...bidData
    };
    storage.bids.push(bid);
    return bid;
  },

  getBid: (id: string) => storage.bids.find(b => b.id === id),
  getBids: () => storage.bids,

  // ProjectStandardization methods
  saveProjectStandardization: (standardization: any) => {
    const existing = storage.projectStandardizations.findIndex(s => s.projectId === standardization.projectId);
    if (existing !== -1) {
      storage.projectStandardizations[existing] = {
        ...standardization,
        updatedAt: new Date()
      };
    } else {
      storage.projectStandardizations.push({
        ...standardization,
        id: `std_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return standardization;
  },

  getProjectStandardization: (projectId: string) =>
    storage.projectStandardizations.find(s => s.projectId === projectId),

  getProjectStandardizations: () => storage.projectStandardizations,

  updateProjectStandardization: (projectId: string, updates: any) => {
    const index = storage.projectStandardizations.findIndex(s => s.projectId === projectId);
    if (index !== -1) {
      storage.projectStandardizations[index] = {
        ...storage.projectStandardizations[index],
        ...updates,
        updatedAt: new Date()
      };
      return storage.projectStandardizations[index];
    }
    return null;
  },

  // WebSource methods
  saveWebSource: (source: any) => {
    const existing = storage.webSources.findIndex(s => s.domain === source.domain);
    if (existing !== -1) {
      storage.webSources[existing] = { ...source, updatedAt: new Date() };
    } else {
      storage.webSources.push({
        ...source,
        id: `src_${Date.now()}`,
        createdAt: new Date()
      });
    }
    return source;
  },

  getWebSources: () => storage.webSources,
  getWebSource: (id: string) => storage.webSources.find(s => s.id === id),

  // WebDoc methods
  saveWebDoc: (doc: any) => {
    const existing = storage.webDocs.findIndex(d => d.url === doc.url);
    if (existing !== -1) {
      storage.webDocs[existing] = { ...doc, updatedAt: new Date() };
    } else {
      storage.webDocs.push({
        ...doc,
        id: `doc_${Date.now()}`,
        createdAt: new Date()
      });
    }
    return doc;
  },

  getWebDocs: () => storage.webDocs,
  getWebDoc: (id: string) => storage.webDocs.find(d => d.id === id),

  // ExternalCompany methods
  saveExternalCompany: (company: any) => {
    const existing = storage.externalCompanies.findIndex(c =>
      c.name === company.name || (c.email && c.email === company.email)
    );

    if (existing !== -1) {
      storage.externalCompanies[existing] = {
        ...storage.externalCompanies[existing],
        ...company,
        lastSeenAt: new Date(),
        updatedAt: new Date()
      };
      return storage.externalCompanies[existing];
    } else {
      const newCompany = {
        ...company,
        id: `ext_company_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        firstSeenAt: new Date(),
        lastSeenAt: new Date()
      };
      storage.externalCompanies.push(newCompany);
      return newCompany;
    }
  },

  getExternalCompany: (id: string) => storage.externalCompanies.find(c => c.id === id),
  getExternalCompanies: () => storage.externalCompanies,

  // ExternalCompanySignal methods
  saveExternalCompanySignal: (signal: any) => {
    const newSignal = {
      ...signal,
      id: `signal_${Date.now()}`,
      createdAt: new Date()
    };
    storage.externalCompanySignals.push(newSignal);
    return newSignal;
  },

  getExternalCompanySignals: (companyId: string) =>
    storage.externalCompanySignals.filter(s => s.companyId === companyId),

  // SourcingMatch methods
  saveSourcingMatch: (match: any) => {
    const existing = storage.sourcingMatches.findIndex(m =>
      m.projectId === match.projectId && m.companyId === match.companyId
    );

    if (existing !== -1) {
      storage.sourcingMatches[existing] = {
        ...storage.sourcingMatches[existing],
        ...match,
        updatedAt: new Date()
      };
      return storage.sourcingMatches[existing];
    } else {
      const newMatch = {
        ...match,
        id: `match_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      storage.sourcingMatches.push(newMatch);
      return newMatch;
    }
  },

  getSourcingMatches: (projectId: string, filters: any = {}) => {
    let matches = storage.sourcingMatches.filter(m => m.projectId === projectId);

    if (filters.minScore) {
      matches = matches.filter(m => m.leadScore >= filters.minScore);
    }

    if (filters.status) {
      matches = matches.filter(m => m.status === filters.status);
    }

    // Tri par score décroissant
    matches.sort((a, b) => b.leadScore - a.leadScore);

    if (filters.limit) {
      matches = matches.slice(0, filters.limit);
    }

    return matches;
  },

  // ProjectChangeLog methods
  saveProjectChangeLog: (log: any) => {
    const newLog = {
      ...log,
      id: log.id || `log_${Date.now()}`,
      createdAt: log.createdAt || new Date()
    };
    storage.projectChangeLogs.push(newLog);

    // Garder seulement les 1000 derniers logs
    if (storage.projectChangeLogs.length > 1000) {
      storage.projectChangeLogs = storage.projectChangeLogs.slice(-1000);
    }

    return newLog;
  },

  getProjectChangeLogs: (projectId: string) =>
    storage.projectChangeLogs.filter(l => l.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  // Error logging
  logError: (error: any) => {
    const errorLog = {
      id: `error_${Date.now()}`,
      timestamp: new Date(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context: error.context || {}
    };

    storage.recentErrors.push(errorLog);

    // Garder seulement les 100 dernières erreurs
    if (storage.recentErrors.length > 100) {
      storage.recentErrors = storage.recentErrors.slice(-100);
    }

    return errorLog;
  },

  getRecentErrors: () => storage.recentErrors
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),

  // Statistics
  getStats: () => ({
    total_users: storage.users.length,
    total_projects: storage.projects.length,
    total_bids: storage.bids.length,
    projects_with_ai: storage.projectStandardizations.length,
    external_companies: storage.externalCompanies.length,
    sourcing_matches: storage.sourcingMatches.length,
    change_logs: storage.projectChangeLogs.length,
    recent_errors: storage.recentErrors.length
  }),

  // Cleanup old data
  cleanup: () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Nettoyer les logs anciens
    storage.projectChangeLogs = storage.projectChangeLogs.filter(
      log => new Date(log.createdAt) > oneWeekAgo
    );

    // Nettoyer les erreurs anciennes
    storage.recentErrors = storage.recentErrors.filter(
      error => new Date(error.timestamp) > oneWeekAgo
    );

    console.log('Cleanup completed');
  }
};

// Initialisation avec des données de test
if (storage.users.length === 0) {
  storage.createUser({
    email: 'client@test.com',
    role: 'CLIENT'
  });

  storage.createUser({
    email: 'pro@test.com',
    role: 'PRO',
    rating_mean: 4.5,
    rating_count: 12
  });
}

// Nettoyage périodique (toutes les heures)
setInterval(() => {
  storage.cleanup();
}, 60 * 60 * 1000);