"use client";

import { useState, useEffect } from 'react';
import { Trophy, Zap, Target, TrendingUp, Award, Star, Flame, Lock } from 'lucide-react';
import { UserProgress, getLevelTitle, ACHIEVEMENTS } from '@/lib/progressSystem';

interface ProgressDashboardProps {
  progress: UserProgress;
  onClose?: () => void;
}

export default function ProgressDashboard({ progress, onClose }: ProgressDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'stats'>('overview');

  const levelProgress = ((progress.xp % progress.xpToNextLevel) / progress.xpToNextLevel) * 100;
  const unlockedAchievements = progress.achievements.filter(a => a.unlockedAt);
  const lockedAchievements = ACHIEVEMENTS.filter(
    a => !progress.achievements.find(pa => pa.id === a.id && pa.unlockedAt)
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Tu Progreso Creativo</h2>
              <p className="text-white/80 text-sm">{getLevelTitle(progress.level)}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Nivel {progress.level}</span>
            <span>{progress.xp} / {progress.xpToNextLevel} XP</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        {[
          { id: 'overview' as const, label: 'Resumen', icon: Target },
          { id: 'achievements' as const, label: 'Logros', icon: Award },
          { id: 'stats' as const, label: 'Estadísticas', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex-1 px-6 py-4 font-medium transition flex items-center justify-center gap-2 ${
              selectedTab === tab.id
                ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 text-center">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {progress.streak}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Días de racha</div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {unlockedAchievements.length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Logros</div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {progress.stats.projectsCreated}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Proyectos</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {progress.stats.blocksOvercome}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Bloqueos superados</div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                Logros Recientes
              </h3>
              {unlockedAchievements.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aún no has desbloqueado logros</p>
                  <p className="text-sm mt-1">¡Sigue creando para desbloquear tu primer logro!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {unlockedAchievements.slice(0, 3).map(achievement => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl border border-violet-200 dark:border-violet-800"
                    >
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {achievement.description}
                        </p>
                      </div>
                      <div className="text-xs text-violet-600 dark:text-violet-400">
                        {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Level Preview */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Próximo Nivel</h3>
              <p className="text-white/80 mb-4">
                Te faltan <strong>{progress.xpToNextLevel - (progress.xp % progress.xpToNextLevel)} XP</strong> para alcanzar el nivel {progress.level + 1}
              </p>
              <div className="text-sm text-white/60">
                Título desbloqueado: <strong>{getLevelTitle(progress.level + 1)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <div className="space-y-6">
            {/* Unlocked */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Desbloqueados ({unlockedAchievements.length})
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {unlockedAchievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className="p-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-violet-200 dark:border-violet-800"
                    >
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {achievement.description}
                      </p>
                      <div className="text-xs text-violet-600 dark:text-violet-400">
                        Desbloqueado el {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-neutral-400" />
                Por Desbloquear ({lockedAchievements.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {lockedAchievements.map(achievement => {
                  const userAchievement = progress.achievements.find(a => a.id === achievement.id);
                  const currentProgress = userAchievement?.progress || 0;
                  const maxProgress = achievement.maxProgress || 1;
                  const progressPercent = (currentProgress / maxProgress) * 100;

                  return (
                    <div
                      key={achievement.id}
                      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 opacity-75"
                    >
                      <div className="text-4xl mb-3 grayscale">{achievement.icon}</div>
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {achievement.description}
                      </p>
                      {maxProgress > 1 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-neutral-500">
                            <span>Progreso</span>
                            <span>{currentProgress} / {maxProgress}</span>
                          </div>
                          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-600 rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {selectedTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Creative Output */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Producción Creativa
                </h3>
                <div className="space-y-2">
                  <StatBar
                    label="Proyectos creados"
                    value={progress.stats.projectsCreated}
                    max={50}
                    color="violet"
                  />
                  <StatBar
                    label="Ideas generadas"
                    value={progress.stats.ideasGenerated}
                    max={100}
                    color="blue"
                  />
                  <StatBar
                    label="Canvas usados"
                    value={progress.stats.canvasesUsed}
                    max={30}
                    color="green"
                  />
                  <StatBar
                    label="Moodboards"
                    value={progress.stats.moodboardsCreated}
                    max={20}
                    color="pink"
                  />
                  <StatBar
                    label="Mindmaps"
                    value={progress.stats.mindmapsCreated}
                    max={20}
                    color="orange"
                  />
                </div>
              </div>

              {/* Performance */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Rendimiento
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Flame className="w-6 h-6 text-orange-500" />
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        Racha actual
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {progress.streak} días
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      ¡Sigue así para mantener tu racha!
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-6 h-6 text-purple-500" />
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        Bloqueos superados
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {progress.stats.blocksOvercome}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Cada bloqueo superado te hace más fuerte
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        Tiempo creando
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.floor(progress.stats.totalTimeSpent / 60)}h {progress.stats.totalTimeSpent % 60}m
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Cada minuto cuenta para tu crecimiento
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors: Record<string, string> = {
    violet: 'bg-violet-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    pink: 'bg-pink-600',
    orange: 'bg-orange-600',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-500 dark:text-neutral-400">{value} / {max}</span>
      </div>
      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
