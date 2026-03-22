// Sistema de detección automática de idioma basado en país/navegador

export type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪'
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹'
  }
};

// Mapeo de países a idiomas
const COUNTRY_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  // Español
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'CL': 'es',
  'PE': 'es', 'VE': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es',
  'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'SV': 'es',
  'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es', 'PR': 'es',
  
  // Inglés
  'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en',
  'IE': 'en', 'ZA': 'en', 'IN': 'en', 'SG': 'en', 'PH': 'en',
  
  // Portugués
  'BR': 'pt', 'PT': 'pt', 'AO': 'pt', 'MZ': 'pt',
  
  // Francés
  'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'LU': 'fr', 'MC': 'fr',
  
  // Alemán
  'DE': 'de', 'AT': 'de', 'LI': 'de',
  
  // Italiano
  'IT': 'it', 'SM': 'it', 'VA': 'it'
};

// Detectar idioma automáticamente
export function detectLanguage(): SupportedLanguage {
  // 1. Verificar idioma guardado en localStorage
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('user_language') as SupportedLanguage;
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      return savedLanguage;
    }
  }

  // 2. Detectar por geolocalización (país)
  const country = detectCountry();
  if (country && COUNTRY_TO_LANGUAGE[country]) {
    return COUNTRY_TO_LANGUAGE[country];
  }

  // 3. Detectar por idioma del navegador
  const browserLanguage = detectBrowserLanguage();
  if (browserLanguage) {
    return browserLanguage;
  }

  // 4. Fallback a español (idioma por defecto)
  return 'es';
}

// Detectar país del usuario
function detectCountry(): string | null {
  if (typeof window === 'undefined') return null;

  // Intentar detectar por timezone
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Mapeo de timezones a países comunes
    const timezoneToCountry: Record<string, string> = {
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Mexico_City': 'MX',
      'America/Bogota': 'CO',
      'America/Lima': 'PE',
      'America/Santiago': 'CL',
      'America/Buenos_Aires': 'AR',
      'America/Sao_Paulo': 'BR',
      'Europe/Madrid': 'ES',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT',
      'Europe/Lisbon': 'PT',
    };

    if (timezoneToCountry[timezone]) {
      return timezoneToCountry[timezone];
    }
  } catch (error) {
    console.log('Error detecting timezone:', error);
  }

  return null;
}

// Detectar idioma del navegador
function detectBrowserLanguage(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null;

  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  if (!browserLang) return null;

  // Extraer código de idioma (ej: 'es-MX' -> 'es')
  const langCode = browserLang.split('-')[0].toLowerCase();

  // Verificar si es un idioma soportado
  if (SUPPORTED_LANGUAGES[langCode as SupportedLanguage]) {
    return langCode as SupportedLanguage;
  }

  return null;
}

// Guardar idioma seleccionado
export function setLanguage(language: SupportedLanguage): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_language', language);
    // Recargar página para aplicar cambios
    window.location.reload();
  }
}

// Obtener idioma actual
export function getCurrentLanguage(): SupportedLanguage {
  return detectLanguage();
}

// Obtener configuración del idioma actual
export function getCurrentLanguageConfig(): LanguageConfig {
  const lang = getCurrentLanguage();
  return SUPPORTED_LANGUAGES[lang];
}

// Verificar si el navegador está en modo RTL (Right-to-Left)
export function isRTL(): boolean {
  const lang = getCurrentLanguage();
  // Agregar idiomas RTL si se soportan en el futuro (árabe, hebreo, etc.)
  return false;
}

// Obtener textos traducidos
export function getTranslation(key: string, lang?: SupportedLanguage): string {
  const currentLang = lang || getCurrentLanguage();
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['es'][key] || key;
}

// Traducciones básicas de la interfaz
const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  es: {
    'welcome': '¡Bienvenido!',
    'start': 'Comenzar',
    'login': 'Iniciar Sesión',
    'register': 'Registrarse',
    'logout': 'Cerrar Sesión',
    'canvas': 'Lienzo',
    'moodboard': 'Tablero de Inspiración',
    'mindmap': 'Mapa Mental',
    'chat': 'Chat con IA',
    'projects': 'Proyectos',
    'profile': 'Perfil',
    'settings': 'Configuración',
    'language': 'Idioma',
    'theme': 'Tema',
    'help': 'Ayuda',
    'about': 'Acerca de',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'share': 'Compartir',
    'download': 'Descargar',
    'upload': 'Subir',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'ai_coach': 'Coach IA',
    'creative_block': 'Bloqueo Creativo',
    'generate_ideas': 'Generar Ideas',
    'analyze_image': 'Analizar Imagen',
  },
  en: {
    'welcome': 'Welcome!',
    'start': 'Start',
    'login': 'Login',
    'register': 'Sign Up',
    'logout': 'Logout',
    'canvas': 'Canvas',
    'moodboard': 'Moodboard',
    'mindmap': 'Mind Map',
    'chat': 'AI Chat',
    'projects': 'Projects',
    'profile': 'Profile',
    'settings': 'Settings',
    'language': 'Language',
    'theme': 'Theme',
    'help': 'Help',
    'about': 'About',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'share': 'Share',
    'download': 'Download',
    'upload': 'Upload',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'ai_coach': 'AI Coach',
    'creative_block': 'Creative Block',
    'generate_ideas': 'Generate Ideas',
    'analyze_image': 'Analyze Image',
  },
  pt: {
    'welcome': 'Bem-vindo!',
    'start': 'Começar',
    'login': 'Entrar',
    'register': 'Registrar',
    'logout': 'Sair',
    'canvas': 'Tela',
    'moodboard': 'Painel de Inspiração',
    'mindmap': 'Mapa Mental',
    'chat': 'Chat com IA',
    'projects': 'Projetos',
    'profile': 'Perfil',
    'settings': 'Configurações',
    'language': 'Idioma',
    'theme': 'Tema',
    'help': 'Ajuda',
    'about': 'Sobre',
    'save': 'Salvar',
    'cancel': 'Cancelar',
    'delete': 'Excluir',
    'edit': 'Editar',
    'share': 'Compartilhar',
    'download': 'Baixar',
    'upload': 'Enviar',
    'loading': 'Carregando...',
    'error': 'Erro',
    'success': 'Sucesso',
    'ai_coach': 'Coach IA',
    'creative_block': 'Bloqueio Criativo',
    'generate_ideas': 'Gerar Ideias',
    'analyze_image': 'Analisar Imagem',
  },
  fr: {
    'welcome': 'Bienvenue!',
    'start': 'Commencer',
    'login': 'Connexion',
    'register': 'S\'inscrire',
    'logout': 'Déconnexion',
    'canvas': 'Toile',
    'moodboard': 'Tableau d\'Inspiration',
    'mindmap': 'Carte Mentale',
    'chat': 'Chat IA',
    'projects': 'Projets',
    'profile': 'Profil',
    'settings': 'Paramètres',
    'language': 'Langue',
    'theme': 'Thème',
    'help': 'Aide',
    'about': 'À propos',
    'save': 'Sauvegarder',
    'cancel': 'Annuler',
    'delete': 'Supprimer',
    'edit': 'Modifier',
    'share': 'Partager',
    'download': 'Télécharger',
    'upload': 'Téléverser',
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
    'ai_coach': 'Coach IA',
    'creative_block': 'Blocage Créatif',
    'generate_ideas': 'Générer des Idées',
    'analyze_image': 'Analyser l\'Image',
  },
  de: {
    'welcome': 'Willkommen!',
    'start': 'Starten',
    'login': 'Anmelden',
    'register': 'Registrieren',
    'logout': 'Abmelden',
    'canvas': 'Leinwand',
    'moodboard': 'Inspirationstafel',
    'mindmap': 'Mindmap',
    'chat': 'KI-Chat',
    'projects': 'Projekte',
    'profile': 'Profil',
    'settings': 'Einstellungen',
    'language': 'Sprache',
    'theme': 'Thema',
    'help': 'Hilfe',
    'about': 'Über',
    'save': 'Speichern',
    'cancel': 'Abbrechen',
    'delete': 'Löschen',
    'edit': 'Bearbeiten',
    'share': 'Teilen',
    'download': 'Herunterladen',
    'upload': 'Hochladen',
    'loading': 'Laden...',
    'error': 'Fehler',
    'success': 'Erfolg',
    'ai_coach': 'KI-Coach',
    'creative_block': 'Kreative Blockade',
    'generate_ideas': 'Ideen Generieren',
    'analyze_image': 'Bild Analysieren',
  },
  it: {
    'welcome': 'Benvenuto!',
    'start': 'Inizia',
    'login': 'Accedi',
    'register': 'Registrati',
    'logout': 'Esci',
    'canvas': 'Tela',
    'moodboard': 'Tavola di Ispirazione',
    'mindmap': 'Mappa Mentale',
    'chat': 'Chat IA',
    'projects': 'Progetti',
    'profile': 'Profilo',
    'settings': 'Impostazioni',
    'language': 'Lingua',
    'theme': 'Tema',
    'help': 'Aiuto',
    'about': 'Informazioni',
    'save': 'Salva',
    'cancel': 'Annulla',
    'delete': 'Elimina',
    'edit': 'Modifica',
    'share': 'Condividi',
    'download': 'Scarica',
    'upload': 'Carica',
    'loading': 'Caricamento...',
    'error': 'Errore',
    'success': 'Successo',
    'ai_coach': 'Coach IA',
    'creative_block': 'Blocco Creativo',
    'generate_ideas': 'Genera Idee',
    'analyze_image': 'Analizza Immagine',
  }
};
