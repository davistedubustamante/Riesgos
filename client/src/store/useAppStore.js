import { create } from 'zustand';
import { api } from '../services/api.js';

// Estado global ligero: proyecto activo + caché de catálogos. La idea es que cualquier
// componente pueda leerlos sin prop drilling ni disparar peticiones redundantes.
export const useAppStore = create((set, get) => ({
  projects: [],
  activeProjectId: null,
  sprints: [],
  loading: false,
  error: null,

  setActiveProject: (id) => set({ activeProjectId: id }),

  loadProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await api.get('/projects');
      const activeProjectId = get().activeProjectId || projects[0]?.id || null;
      set({ projects, activeProjectId, loading: false });
      if (activeProjectId) await get().loadSprints(activeProjectId);
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  loadSprints: async (projectId) => {
    try {
      const sprints = await api.get(`/projects/${projectId}/sprints`);
      set({ sprints });
    } catch (e) {
      set({ error: e.message, sprints: [] });
    }
  },

  resetDbSeed: async () => {
    // Truco para volver al estado inicial: borrar el archivo runtime y recargar.
    // Útil en demo; no exponerlo a usuarios en producción.
    try {
      const projects = await api.get('/projects');
      if (!projects.length) throw new Error('La base ya está vacía.');
    } catch (e) {
      set({ error: e.message });
    }
  },
}));
