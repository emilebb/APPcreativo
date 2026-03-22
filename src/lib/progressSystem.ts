// Sistema de progreso y gamificación para CreationX

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActiveDate: string;
  achievements: Achievement[];
  stats: CreativeStats;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface CreativeStats {
  projectsCreated: number;
  ideasGenerated: number;
  canvasesUsed: number;
  moodboardsCreated: number;
  mindmapsCreated: number;
  blocksOvercome: number;
  totalTimeSpent: number; // en minutos
  favoriteTools: string[];
}

// Niveles y XP
const XP_PER_LEVEL = 100;
const XP_MULTIPLIER = 1.5;

export function calculateXPForLevel(level: number): number {
  return Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
}

export function calculateLevel(totalXP: number): number {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXP) {
    xpNeeded += calculateXPForLevel(level);
    if (xpNeeded <= totalXP) level++;
  }
  
  return level;
}

// Acciones que dan XP
export const XP_REWARDS = {
  CREATE_PROJECT: 10,
  COMPLETE_CANVAS: 25,
  CREATE_MOODBOARD: 20,
  CREATE_MINDMAP: 20,
  GENERATE_IDEA: 5,
  OVERCOME_BLOCK: 30,
  DAILY_STREAK: 15,
  UPLOAD_IMAGE: 5,
  APPLY_AI_SUGGESTION: 10,
  SHARE_PROJECT: 15,
  COMPLETE_ONBOARDING: 50,
};

// Logros disponibles
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_project',
    title: 'Primer Paso',
    description: 'Crea tu primer proyecto',
    icon: '🎯',
    maxProgress: 1,
  },
  {
    id: 'idea_machine',
    title: 'Máquina de Ideas',
    description: 'Genera 50 ideas con IA',
    icon: '💡',
    maxProgress: 50,
  },
  {
    id: 'canvas_master',
    title: 'Maestro del Canvas',
    description: 'Completa 10 canvas',
    icon: '🎨',
    maxProgress: 10,
  },
  {
    id: 'block_breaker',
    title: 'Rompe Bloqueos',
    description: 'Supera 5 bloqueos creativos',
    icon: '⚡',
    maxProgress: 5,
  },
  {
    id: 'streak_7',
    title: 'Racha de Fuego',
    description: 'Mantén una racha de 7 días',
    icon: '🔥',
    maxProgress: 7,
  },
  {
    id: 'explorer',
    title: 'Explorador Creativo',
    description: 'Usa todas las herramientas',
    icon: '🧭',
    maxProgress: 4,
  },
  {
    id: 'productive_day',
    title: 'Día Productivo',
    description: 'Pasa 2 horas creando en un día',
    icon: '⏰',
    maxProgress: 120, // minutos
  },
  {
    id: 'social_creator',
    title: 'Creador Social',
    description: 'Comparte 5 proyectos',
    icon: '🌟',
    maxProgress: 5,
  },
];

// Función para otorgar XP
export function awardXP(currentProgress: UserProgress, xpAmount: number): UserProgress {
  const newTotalXP = currentProgress.xp + xpAmount;
  const newLevel = calculateLevel(newTotalXP);
  const leveledUp = newLevel > currentProgress.level;
  
  return {
    ...currentProgress,
    xp: newTotalXP,
    level: newLevel,
    xpToNextLevel: calculateXPForLevel(newLevel + 1),
  };
}

// Función para actualizar racha
export function updateStreak(currentProgress: UserProgress): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = currentProgress.lastActiveDate;
  
  if (!lastActive) {
    return {
      ...currentProgress,
      streak: 1,
      lastActiveDate: today,
    };
  }
  
  const lastDate = new Date(lastActive);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Mismo día, no cambiar racha
    return currentProgress;
  } else if (diffDays === 1) {
    // Día consecutivo, aumentar racha
    return {
      ...currentProgress,
      streak: currentProgress.streak + 1,
      lastActiveDate: today,
    };
  } else {
    // Racha rota, reiniciar
    return {
      ...currentProgress,
      streak: 1,
      lastActiveDate: today,
    };
  }
}

// Función para verificar y desbloquear logros
export function checkAchievements(
  currentProgress: UserProgress,
  action: string,
  value: number = 1
): UserProgress {
  const updatedAchievements = [...currentProgress.achievements];
  
  ACHIEVEMENTS.forEach((achievement) => {
    const existing = updatedAchievements.find(a => a.id === achievement.id);
    
    if (!existing || !existing.unlockedAt) {
      let progress = existing?.progress || 0;
      
      // Actualizar progreso según la acción
      switch (achievement.id) {
        case 'first_project':
          if (action === 'CREATE_PROJECT') progress = 1;
          break;
        case 'idea_machine':
          if (action === 'GENERATE_IDEA') progress += value;
          break;
        case 'canvas_master':
          if (action === 'COMPLETE_CANVAS') progress += value;
          break;
        case 'block_breaker':
          if (action === 'OVERCOME_BLOCK') progress += value;
          break;
        case 'streak_7':
          progress = currentProgress.streak;
          break;
        case 'explorer':
          progress = currentProgress.stats.favoriteTools.length;
          break;
        case 'productive_day':
          if (action === 'TIME_SPENT') progress += value;
          break;
        case 'social_creator':
          if (action === 'SHARE_PROJECT') progress += value;
          break;
      }
      
      // Verificar si se desbloqueó
      const unlocked = progress >= (achievement.maxProgress || 1);
      
      if (existing) {
        const index = updatedAchievements.findIndex(a => a.id === achievement.id);
        updatedAchievements[index] = {
          ...achievement,
          progress,
          unlockedAt: unlocked ? new Date().toISOString() : undefined,
        };
      } else {
        updatedAchievements.push({
          ...achievement,
          progress,
          unlockedAt: unlocked ? new Date().toISOString() : undefined,
        });
      }
    }
  });
  
  return {
    ...currentProgress,
    achievements: updatedAchievements,
  };
}

// Función para obtener el título según el nivel
export function getLevelTitle(level: number): string {
  if (level < 5) return 'Aprendiz Creativo';
  if (level < 10) return 'Creador Emergente';
  if (level < 20) return 'Artista Experimentado';
  if (level < 30) return 'Maestro Creativo';
  if (level < 50) return 'Visionario';
  return 'Leyenda Creativa';
}

// Función para inicializar progreso de nuevo usuario
export function initializeProgress(): UserProgress {
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: calculateXPForLevel(2),
    streak: 0,
    lastActiveDate: '',
    achievements: [],
    stats: {
      projectsCreated: 0,
      ideasGenerated: 0,
      canvasesUsed: 0,
      moodboardsCreated: 0,
      mindmapsCreated: 0,
      blocksOvercome: 0,
      totalTimeSpent: 0,
      favoriteTools: [],
    },
  };
}
