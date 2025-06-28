import { useEffect } from 'react';

export interface PageMetadata {
  title: string;
  icon?: string;
  description?: string;
}

export const usePageMetadata = (metadata: PageMetadata) => {
  useEffect(() => {
    // Set document title
    document.title = metadata.title;
    
    // Set favicon if provided
    if (metadata.icon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = metadata.icon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Set meta description if provided
    if (metadata.description) {
      let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = metadata.description;
    }
  }, [metadata.title, metadata.icon, metadata.description]);
};

// Predefined metadata for different pages
export const PAGE_METADATA = {
  HOME: {
    title: 'Interv-ia | Préparation IA pour entretiens',
    description: 'Préparez vos entretiens avec l\'intelligence artificielle. Simulez des entretiens réalistes et améliorez vos compétences.',
    icon: '/logo2.jpeg'
  },
  LOGIN: {
    title: 'Connexion | Interv-ia',
    description: 'Connectez-vous à votre compte Interv-ia pour accéder à vos entretiens.',
    icon: '/logo2.jpeg'
  },
  REGISTER: {
    title: 'Inscription | Interv-ia',
    description: 'Créez votre compte Interv-ia et commencez à préparer vos entretiens.',
    icon: '/logo2.jpeg'
  },
  DASHBOARD: {
    title: 'Tableau de bord | Interv-ia',
    description: 'Gérez vos entretiens et suivez vos progrès.',
    icon: '/logo2.jpeg'
  },
  CHAT: {
    title: 'Chat IA | Interv-ia',
    description: 'Discutez avec notre IA pour préparer vos entretiens.',
    icon: '/logo2.jpeg'
  },
  PROFILE: {
    title: 'Profil | Interv-ia',
    description: 'Gérez votre profil et vos paramètres.',
    icon: '/logo2.jpeg'
  },
  PAYMENT: {
    title: 'Paiement | Interv-ia',
    description: 'Choisissez votre plan et effectuez votre paiement.',
    icon: '/logo2.jpeg'
  },
  MEETINGS: {
    title: 'Rendez-vous | Interv-ia',
    description: 'Planifiez et gérez vos rendez-vous d\'entretien.',
    icon: '/logo2.jpeg'
  },
  RESET_PASSWORD: {
    title: 'Réinitialiser le mot de passe | Interv-ia',
    description: 'Réinitialisez votre mot de passe.',
    icon: '/logo2.jpeg'
  },
  ADMIN: {
    title: 'Administration | Interv-ia',
    description: 'Panneau d\'administration Interv-ia.',
    icon: '/logo2.jpeg'
  },
  ADMIN_USERS: {
    title: 'Gestion des utilisateurs | Interv-ia Admin',
    description: 'Gérez les utilisateurs de la plateforme.',
    icon: '/logo2.jpeg'
  },
  ADMIN_PLANS: {
    title: 'Gestion des plans | Interv-ia Admin',
    description: 'Gérez les plans d\'abonnement.',
    icon: '/logo2.jpeg'
  },
  ADMIN_PAYMENTS: {
    title: 'Gestion des paiements | Interv-ia Admin',
    description: 'Suivez les paiements et les revenus.',
    icon: '/logo2.jpeg'
  },
  ADMIN_ANALYTICS: {
    title: 'Analytiques | Interv-ia Admin',
    description: 'Consultez les statistiques de la plateforme.',
    icon: '/logo2.jpeg'
  },
  ADMIN_INTERVIEWS: {
    title: 'Gestion des entretiens | Interv-ia Admin',
    description: 'Gérez les entretiens des utilisateurs.',
    icon: '/logo2.jpeg'
  },
  ADMIN_SETTINGS: {
    title: 'Paramètres | Interv-ia Admin',
    description: 'Configurez les paramètres de la plateforme.',
    icon: '/logo2.jpeg'
  }
}; 