import {
  Settings,
  MessagesSquare,
  Video,
  Music,
  Handshake,
  LogOut,
  Braces,
  Heart,
  Sun,
  Building,
  Rocket,
  Waves,
  Shield,
  Droplets,
  Bird,
  Building2,
  Flame,
  PawPrint,
  Code2,
  Zap,
  Orbit,
  Landmark,
  Snowflake,
  Gamepad,
  Hand,
  Umbrella,
  Sparkles,
  Ship,
  CloudLightning,
  Fish,
  Cpu,
  Flower2,
  Aperture,
  CloudMoon,
  Castle,
  Moon,
  Car,
  Cat,
  Trees,
  Sword,
  Droplet,
  Train,
  Smile,
  Clock9,
  Cloud,
  Brush,
  Coffee,
  Mountain,
  Lamp,
  Sunrise,
  TreePine,
  Cog,
  Shapes,
  Gem,
  Leaf,
  Palmtree,
  Infinity,
  CircleDollarSign,
  Wine,
  Anchor,
  MessageCircleWarning,

} from "lucide-react";
import { IoImageOutline, IoBalloonOutline} from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { IoPlanetOutline } from "react-icons/io5";
import { PiIslandFill } from "react-icons/pi";
import { PiButterfly } from "react-icons/pi";


import { NotificationItem } from "@/lib/types";
import { TbMessageReport } from "react-icons/tb";


export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  responses?: {
    model: string;
    content: string;
    icon: string;
  }[];
}

export interface ReleaseNote {
  id: string
  version: string
  date: string
  translations: {
    [key: string]: {
      title: string
      description: string
      details: {
        summary: string
        changes: string[]
        impact?: string
        technicalNotes?: string[]
      }
    }
  }
  type: "security" | "solve" | "error" | "testing"| "feature" | "fix" | "bug" | "improvement"
  image?: string
}

export const notifications: NotificationItem[] = [
  // {
  //   id: "1",
  //   title: "New Model Available",
  //   message: "Claude 3 Opus is now available for all users. Experience state-of-the-art AI with improved reasoning, coding, and mathematical capabilities.",
  //   timestamp: new Date(Date.now() - 1000 * 60 * 5),
  //   read: false,
  //   type: 'feature',
  //   priority: 'high',
  //   actionUrl: '/',
  //   actionLabel: 'Try it now',
  //   metadata: {
  //     category: 'AI Models',
  //     tags: ['claude', 'new-feature', 'ai'],
  //     relatedFeature: 'text-generation'
  //   }
  // },
  // {
  //   id: "2",
  //   title: "Security Update Required",
  //   message: "To ensure the security of your account, please enable two-factor authentication. This helps protect your data and access.",
  //   timestamp: new Date(Date.now() - 1000 * 60 * 24),
  //   read: false,
  //   type: 'security',
  //   priority: 'high',
  //   actionUrl: '/',
  //   actionLabel: 'Enable 2FA',
  //   metadata: {
  //     category: 'Security',
  //     tags: ['security', '2fa', 'account'],
  //   }
  // },
  // {
  //   id: "3",
  //   title: "Security Update Required",
  //   message: "To ensure the security of your account, please enable two-factor authentication. This helps protect your data and access.",
  //   timestamp: new Date(Date.now() - 1000 * 60 * 24),
  //   read: true,
  //   type: 'security',
  //   priority: 'high',
  //   actionUrl: '/',
  //   actionLabel: 'Enable 2FA',
  //   metadata: {
  //     category: 'Security',
  //     tags: ['security', '2fa', 'account'],
  //   }
  // },
];

export const navItems = [
  // {
  //   type: ALargeSmall,
  //   label: "Text size",
  //   interactionType: "modal",
  //   onClick: () => {
      // console.log("Opening Text Size Modal");
  //   },
  // },
  // {
  //   type: HelpCircle,
  //   label: "Help",
  //   interactionType: "function",
  // },
  {
    type: TbMessageReport,
    label: "Feedback",
    interactionType: "modal",
    onClick: () => {
      // console.log("Opening Feedback Modal");
    },
  },
  // {
  //   type: Bell,
  //   label: "Notifications",
  //   interactionType: "dropdown",
  //   dropdownItems: [
  //     {
  //       label: "All Notifications",
  //       icon: Bell,
  //       // onClick: () => console.log("All Notifications")
  //     },
  //   ],
  // },
];

export const sidebarMenuItems = [
  // { icon: MessagesSquare, label: "Chat", href: "/chat" },
  // { icon: IoImageOutline, label: "Image", href: "/image" },
  // { icon: Music, label: "Audio", beta: true, href: "/audio" },
  // { icon: Video, label: "Video", beta: true, href: "/video" },
];

export const userMenuItems = [
  // {
  //   label: "Organization",
  //   icon: Users,
  //   interactionType: "modal",
  //   shortcut: "O",
  //   onClick: () => {
  //   },
  // },
  // {
  //   label: "Developer",
  //   icon: Braces,
  //   interactionType: "link",
  //   href: `/developer`,
  //   openInNewTab: true,
  // },
  // {
  //   label: "Refer",
  //   icon: Handshake,
  //   interactionType: "modal",
  //   onClick: () => {
  //   },
  // },
  {
    label: "Favorites",
    icon: Heart,
    interactionType: "modal",
    onClick: () => {
      // console.log('Opening Refer Modal');
    },
  },
  {
    label: "Settings",
    icon: Settings,
    interactionType: "modal",
    onClick: () => {
      // console.log('Opening Settings Modal');
    },
  },
  {
    label: "End Session",
    icon: LogOut,
    interactionType: "function",
    onClick: () => {
      // console.log('Logging out...');
    },
  },
];

export const initialMessages: Message[] = [];

export const socialMediaOptions = [
  {
    name: 'X',
    icon: '/svgs/x_white.png',
    color: 'bg-[#0088cc]/10',
    hoverColor: 'hover:bg-[#0088cc]/20',
    textColor: 'text-[#4267B2]',
    handler: (text: string) => `https://x.com/intent/tweet?url=${encodeURIComponent(text)}`
  },
  {
    name: 'Facebook',
    icon: '/svgs/facebook.svg',
    color: 'bg-[#4267B2]/10',
    hoverColor: 'hover:bg-[#4267B2]/20',
    textColor: 'text-[#4267B2]',
    handler: (text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(text)}`
  },
  {
    name: 'Reddit',
    icon: '/svgs/reddit.svg',
    color: 'bg-[#FF4500]/10',
    hoverColor: 'hover:bg-[#FF4500]/20',
    textColor: 'text-[#FF4500]',
    handler: (text: string) => `https://reddit.com/submit?url=${encodeURIComponent(text)}`
  },
  {
    name: 'Discord',
    icon: '/svgs/discord.svg',
    color: 'bg-[#5865F2]/10',
    hoverColor: 'hover:bg-[#5865F2]/20',
    textColor: 'text-[#5865F2]',
    handler: (text: string) => `https://discord.com/channels/@me?text=${encodeURIComponent(text)}`
  },
  {
    name: 'WhatsApp',
    icon: '/svgs/whatsapp.svg',
    color: 'bg-[#25D366]/10',
    hoverColor: 'hover:bg-[#25D366]/20',
    textColor: 'text-[#25D366]',
    handler: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`
  },
  {
    name: 'Telegram',
    icon: '/svgs/telegram.svg',
    color: 'bg-[#0088cc]/10',
    hoverColor: 'hover:bg-[#0088cc]/20',
    textColor: 'text-[#0088cc]',
    handler: (text: string) => `https://t.me/share/url?url=${encodeURIComponent(text)}`
  }
];

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
]


export function getLocalizedContent(release: ReleaseNote, language: string) {
  return release.translations[language] || release.translations['en'];
}

export const releaseNotesData: ReleaseNote[] = [
  {
    id: "1",
    version: "v2.1.0",
    date: "2024-12-01",
    type: "feature",
    translations: {
      en: {
        title: "Launch New User Authentication System",
        description: "Introduced a secure, modern authentication system with multi-factor authentication and social media login integration.",
        details: {
          summary: "A complete overhaul of our authentication system to provide enhanced security and user convenience.",
          changes: [
            "Implemented OAuth 2.0 protocol for social media login",
            "Added support for TOTP-based 2FA",
            "Introduced session management with automatic timeout",
            "Enhanced password policy enforcement"
          ],
          impact: "This update significantly improves platform security while making the login process more convenient for users.",
          technicalNotes: [
            "Migration required for existing authentication tokens",
            "New environment variables needed for OAuth providers",
            "Updated API endpoints for authentication flows"
          ]
        }
      },
      es: {
        title: "Lanzamiento del Nuevo Sistema de Autenticación",
        description: "Se introdujo un sistema de autenticación moderno y seguro con autenticación multifactor e integración de inicio de sesión con redes sociales.",
        details: {
          summary: "Una renovación completa de nuestro sistema de autenticación para mejorar la seguridad y la comodidad del usuario.",
          changes: [
            "Implementación del protocolo OAuth 2.0 para inicio de sesión con redes sociales",
            "Añadido soporte para 2FA basado en TOTP",
            "Introducción de gestión de sesiones con tiempo de espera automático",
            "Mejora en la política de contraseñas"
          ],
          impact: "Esta actualización mejora significativamente la seguridad de la plataforma mientras hace más conveniente el proceso de inicio de sesión.",
          technicalNotes: [
            "Migración requerida para tokens de autenticación existentes",
            "Nuevas variables de entorno necesarias para proveedores OAuth",
            "Endpoints de API actualizados para flujos de autenticación"
          ]
        }
      },
      //other language translations...
    }
  },
  {
    "id": "2",
    "version": "v2.2.0",
    "date": "2024-12-15",
    "type": "feature",
    "translations": {
      "en": {
        "title": "Improved Search Functionality",
        "description": "Enhanced search engine with advanced filtering options and faster response time.",
        "details": {
          "summary": "We have revamped the search functionality, making it faster and more intuitive.",
          "changes": [
            "Added advanced filters (category, price range, rating)",
            "Improved search indexing for faster results",
            "Optimized search algorithm for better accuracy",
            "Introduced an auto-complete feature for search suggestions"
          ],
          "impact": "This update improves the accuracy and speed of search results, offering a better user experience.",
          "technicalNotes": [
            "New search indexing system implemented",
            "Minor database schema changes to support new filters",
            "Improved search query performance"
          ]
        }
      },
      "es": {
        "title": "Funcionalidad de Búsqueda Mejorada",
        "description": "Motor de búsqueda mejorado con opciones avanzadas de filtrado y tiempos de respuesta más rápidos.",
        "details": {
          "summary": "Hemos renovado la funcionalidad de búsqueda, haciéndola más rápida e intuitiva.",
          "changes": [
            "Añadidos filtros avanzados (categoría, rango de precio, calificación)",
            "Mejorada la indexación de búsqueda para obtener resultados más rápidos",
            "Optimizando el algoritmo de búsqueda para mayor precisión",
            "Introducción de la función de autocompletado para sugerencias de búsqueda"
          ],
          "impact": "Esta actualización mejora la precisión y la velocidad de los resultados de búsqueda, ofreciendo una mejor experiencia al usuario.",
          "technicalNotes": [
            "Nuevo sistema de indexación de búsqueda implementado",
            "Pequeños cambios en el esquema de la base de datos para soportar los nuevos filtros",
            "Mejora en el rendimiento de las consultas de búsqueda"
          ]
        }
      }
    }
  },
  {
    "id": "3",
    "version": "v2.1.1",
    "date": "2024-12-05",
    "type": "fix",
    "translations": {
      "en": {
        "title": "Bug Fix for Checkout Process",
        "description": "Resolved an issue where users were unable to complete their purchase due to a payment gateway error.",
        "details": {
          "summary": "A bug was fixed in the checkout flow that was preventing users from finalizing their purchases.",
          "changes": [
            "Fixed an issue causing payment gateway errors during checkout",
            "Improved error handling for failed transactions",
            "Enhanced user feedback during payment processing"
          ],
          "impact": "Users can now complete their purchases without errors, improving overall customer satisfaction.",
          "technicalNotes": [
            "Payment gateway API updated to handle errors more gracefully",
            "Improved logging for transaction failures"
          ]
        }
      },
      "es": {
        "title": "Corrección de Error en el Proceso de Pago",
        "description": "Se resolvió un problema donde los usuarios no podían completar su compra debido a un error en la pasarela de pago.",
        "details": {
          "summary": "Se corrigió un error en el flujo de pago que impedía a los usuarios finalizar sus compras.",
          "changes": [
            "Corrección de un error que causaba fallos en la pasarela de pago durante el proceso de pago",
            "Mejora en el manejo de errores para transacciones fallidas",
            "Mejora en la retroalimentación al usuario durante el procesamiento del pago"
          ],
          "impact": "Los usuarios ahora pueden completar sus compras sin errores, mejorando la satisfacción general del cliente.",
          "technicalNotes": [
            "API de la pasarela de pago actualizada para manejar errores de manera más eficiente",
            "Mejoras en el registro de fallos de transacciones"
          ]
        }
      }
    }
  },
  {
    "id": "4",
    "version": "v2.3.0",
    "date": "2024-12-20",
    "type": "feature",
    "translations": {
      "en": {
        "title": "Mobile App Interface Overhaul",
        "description": "The mobile app interface has been redesigned to provide a more modern and user-friendly experience.",
        "details": {
          "summary": "The user interface of the mobile app has been completely updated for a fresh, clean look and better usability.",
          "changes": [
            "Revamped app navigation with simplified menu structure",
            "Updated design with a more consistent color scheme",
            "Introduced bottom navigation bar for easier access to key features",
            "Redesigned user profiles with updated layout and options"
          ],
          "impact": "The new interface improves overall usability and aesthetic appeal, providing a more modern and streamlined experience.",
          "technicalNotes": [
            "UI/UX team collaborated on new design system",
            "Reworked app components to follow modern design guidelines",
            "Performance optimizations for smoother animations"
          ]
        }
      },
      "es": {
        "title": "Renovación de la Interfaz de la App Móvil",
        "description": "La interfaz de la app móvil ha sido rediseñada para ofrecer una experiencia más moderna y fácil de usar.",
        "details": {
          "summary": "La interfaz de usuario de la app móvil ha sido completamente actualizada para ofrecer un aspecto fresco, limpio y mejor usabilidad.",
          "changes": [
            "Renovación de la navegación de la app con una estructura de menú simplificada",
            "Diseño actualizado con una paleta de colores más consistente",
            "Introducción de una barra de navegación inferior para un acceso más fácil a las funciones clave",
            "Rediseño de perfiles de usuario con un nuevo diseño y opciones"
          ],
          "impact": "La nueva interfaz mejora la usabilidad general y el atractivo estético, ofreciendo una experiencia más moderna y fluida.",
          "technicalNotes": [
            "El equipo de UI/UX colaboró en el nuevo sistema de diseño",
            "Reestructuración de componentes de la app siguiendo las pautas de diseño modernas",
            "Optimizaciones de rendimiento para animaciones más fluidas"
          ]
        }
      }
    }
  },
  {
    "id": "5",
    "version": "v2.1.2",
    "date": "2024-12-10",
    "type": "testing",
    "translations": {
      "en": {
        "title": "New Unit Tests for User Registration",
        "description": "Added unit tests to validate user registration and error handling for new accounts.",
        "details": {
          "summary": "New unit tests were created to ensure the user registration flow works correctly and catches errors.",
          "changes": [
            "Created unit tests for user registration functionality",
            "Tested various edge cases, including duplicate accounts and invalid inputs",
            "Added mock data for testing API responses"
          ],
          "impact": "This ensures that user registration works smoothly and errors are properly handled, improving code quality.",
          "technicalNotes": [
            "New testing framework implemented for unit testing",
            "Test suite integrated into the CI pipeline for continuous validation"
          ]
        }
      },
      "es": {
        "title": "Nuevas Pruebas Unitarias para el Registro de Usuario",
        "description": "Se añadieron pruebas unitarias para validar el registro de usuario y el manejo de errores para nuevas cuentas.",
        "details": {
          "summary": "Se crearon nuevas pruebas unitarias para garantizar que el flujo de registro de usuario funcione correctamente y maneje errores.",
          "changes": [
            "Creación de pruebas unitarias para la funcionalidad de registro de usuario",
            "Se probaron varios casos extremos, incluidos cuentas duplicadas y entradas no válidas",
            "Añadidos datos simulados para probar las respuestas de la API"
          ],
          "impact": "Esto garantiza que el registro de usuarios funcione sin problemas y que los errores se manejen correctamente, mejorando la calidad del código.",
          "technicalNotes": [
            "Nuevo marco de pruebas implementado para pruebas unitarias",
            "La suite de pruebas se integró en la pipeline de CI para validación continua"
          ]
        }
      }
    }
  },  
  {
    "id": "6",
    "version": "v2.4.0",
    "date": "2024-12-25",
    "type": "feature",
    "translations": {
      "en": {
        "title": "Enhanced Email Notifications System",
        "description": "New customizable email notifications with better tracking and user preferences.",
        "details": {
          "summary": "The email notifications system has been improved to give users more control over the emails they receive.",
          "changes": [
            "Added user preferences for customizing notification types",
            "Introduced email tracking to confirm delivery and open rates",
            "Improved email content design for better readability",
            "Added support for rich media in email templates"
          ],
          "impact": "This update allows users to have more control over email communication and improves email engagement.",
          "technicalNotes": [
            "New user preference settings added to profile page",
            "Tracking integration added to the email sending system",
            "Email templates now support HTML5 and embedded media"
          ]
        }
      },
      "es": {
        "title": "Sistema Mejorado de Notificaciones por Correo Electrónico",
        "description": "Nuevas notificaciones por correo electrónico personalizables con mejor seguimiento y preferencias del usuario.",
        "details": {
          "summary": "El sistema de notificaciones por correo electrónico ha sido mejorado para dar a los usuarios más control sobre los correos que reciben.",
          "changes": [
            "Añadidas preferencias de usuario para personalizar los tipos de notificaciones",
            "Introducción de seguimiento de correos electrónicos para confirmar entrega y tasa de aperturas",
            "Mejora en el diseño del contenido de los correos para mayor legibilidad",
            "Añadido soporte para medios enriquecidos en plantillas de correos"
          ],
          "impact": "Esta actualización permite a los usuarios tener más control sobre las comunicaciones por correo electrónico y mejora el compromiso con los correos.",
          "technicalNotes": [
            "Nuevas configuraciones de preferencias de usuario añadidas a la página de perfil",
            "Integración de seguimiento añadida al sistema de envío de correos",
            "Las plantillas de correo ahora soportan HTML5 y medios incrustados"
          ]
        }
      }
    }
  },
  {
    "id": "8",
    "version": "v2.1.3",
    "date": "2024-12-12",
    "type": "security",
    "translations": {
      "en": {
        "title": "Security Patch for Data Encryption Vulnerability",
        "description": "Fixed a vulnerability related to weak data encryption in user communications and storage.",
        "details": {
          "summary": "A security vulnerability was identified and patched to strengthen encryption methods for user data.",
          "changes": [
            "Upgraded encryption algorithms for data at rest and in transit",
            "Implemented AES-256 encryption for sensitive user data",
            "Added additional encryption for API communication and database storage"
          ],
          "impact": "This patch ensures that user data is now better protected against potential attacks, enhancing overall security.",
          "technicalNotes": [
            "Encryption keys were rotated as part of the update",
            "New security protocols were applied for API communications"
          ]
        }
      },
      "es": {
        "title": "Parché de Seguridad para Vulnerabilidad de Cifrado de Datos",
        "description": "Se solucionó una vulnerabilidad relacionada con un cifrado débil de datos en las comunicaciones y almacenamiento de usuarios.",
        "details": {
          "summary": "Se identificó y corrigió una vulnerabilidad de seguridad para fortalecer los métodos de cifrado de los datos de los usuarios.",
          "changes": [
            "Actualización de los algoritmos de cifrado para los datos en reposo y en tránsito",
            "Implementación de cifrado AES-256 para los datos sensibles de los usuarios",
            "Añadido cifrado adicional para la comunicación API y el almacenamiento en base de datos"
          ],
          "impact": "Este parche garantiza que los datos de los usuarios ahora estén mejor protegidos contra posibles ataques, mejorando la seguridad general.",
          "technicalNotes": [
            "Las claves de cifrado fueron rotadas como parte de la actualización",
            "Se aplicaron nuevos protocolos de seguridad para las comunicaciones API"
          ]
        }
      }
    }
  },
  {
    "id": "9",
    "version": "v2.1.3",
    "date": "2024-12-12",
    "type": "security",
    "translations": {
      "en": {
        "title": "Security Patch for Data Encryption Vulnerability",
        "description": "Fixed a vulnerability related to weak data encryption in user communications and storage.",
        "details": {
          "summary": "A security vulnerability was identified and patched to strengthen encryption methods for user data.",
          "changes": [
            "Upgraded encryption algorithms for data at rest and in transit",
            "Implemented AES-256 encryption for sensitive user data",
            "Added additional encryption for API communication and database storage"
          ],
          "impact": "This patch ensures that user data is now better protected against potential attacks, enhancing overall security.",
          "technicalNotes": [
            "Encryption keys were rotated as part of the update",
            "New security protocols were applied for API communications"
          ]
        }
      },
      "es": {
        "title": "Parché de Seguridad para Vulnerabilidad de Cifrado de Datos",
        "description": "Se solucionó una vulnerabilidad relacionada con un cifrado débil de datos en las comunicaciones y almacenamiento de usuarios.",
        "details": {
          "summary": "Se identificó y corrigió una vulnerabilidad de seguridad para fortalecer los métodos de cifrado de los datos de los usuarios.",
          "changes": [
            "Actualización de los algoritmos de cifrado para los datos en reposo y en tránsito",
            "Implementación de cifrado AES-256 para los datos sensibles de los usuarios",
            "Añadido cifrado adicional para la comunicación API y el almacenamiento en base de datos"
          ],
          "impact": "Este parche garantiza que los datos de los usuarios ahora estén mejor protegidos contra posibles ataques, mejorando la seguridad general.",
          "technicalNotes": [
            "Las claves de cifrado fueron rotadas como parte de la actualización",
            "Se aplicaron nuevos protocolos de seguridad para las comunicaciones API"
          ]
        }
      }
    }
  },
  {
    "id": "10",
    "version": "v2.1.3",
    "date": "2024-12-12",
    "type": "security",
    "translations": {
      "en": {
        "title": "Security Patch for Data Encryption Vulnerability",
        "description": "Fixed a vulnerability related to weak data encryption in user communications and storage.",
        "details": {
          "summary": "A security vulnerability was identified and patched to strengthen encryption methods for user data.",
          "changes": [
            "Upgraded encryption algorithms for data at rest and in transit",
            "Implemented AES-256 encryption for sensitive user data",
            "Added additional encryption for API communication and database storage"
          ],
          "impact": "This patch ensures that user data is now better protected against potential attacks, enhancing overall security.",
          "technicalNotes": [
            "Encryption keys were rotated as part of the update",
            "New security protocols were applied for API communications"
          ]
        }
      },
      "es": {
        "title": "Parché de Seguridad para Vulnerabilidad de Cifrado de Datos",
        "description": "Se solucionó una vulnerabilidad relacionada con un cifrado débil de datos en las comunicaciones y almacenamiento de usuarios.",
        "details": {
          "summary": "Se identificó y corrigió una vulnerabilidad de seguridad para fortalecer los métodos de cifrado de los datos de los usuarios.",
          "changes": [
            "Actualización de los algoritmos de cifrado para los datos en reposo y en tránsito",
            "Implementación de cifrado AES-256 para los datos sensibles de los usuarios",
            "Añadido cifrado adicional para la comunicación API y el almacenamiento en base de datos"
          ],
          "impact": "Este parche garantiza que los datos de los usuarios ahora estén mejor protegidos contra posibles ataques, mejorando la seguridad general.",
          "technicalNotes": [
            "Las claves de cifrado fueron rotadas como parte de la actualización",
            "Se aplicaron nuevos protocolos de seguridad para las comunicaciones API"
          ]
        }
      }
    }
  },
  {
    "id": "11",
    "version": "v2.1.3",
    "date": "2024-12-12",
    "type": "security",
    "translations": {
      "en": {
        "title": "Security Patch for Data Encryption Vulnerability",
        "description": "Fixed a vulnerability related to weak data encryption in user communications and storage.",
        "details": {
          "summary": "A security vulnerability was identified and patched to strengthen encryption methods for user data.",
          "changes": [
            "Upgraded encryption algorithms for data at rest and in transit",
            "Implemented AES-256 encryption for sensitive user data",
            "Added additional encryption for API communication and database storage"
          ],
          "impact": "This patch ensures that user data is now better protected against potential attacks, enhancing overall security.",
          "technicalNotes": [
            "Encryption keys were rotated as part of the update",
            "New security protocols were applied for API communications"
          ]
        }
      },
      "es": {
        "title": "Parché de Seguridad para Vulnerabilidad de Cifrado de Datos",
        "description": "Se solucionó una vulnerabilidad relacionada con un cifrado débil de datos en las comunicaciones y almacenamiento de usuarios.",
        "details": {
          "summary": "Se identificó y corrigió una vulnerabilidad de seguridad para fortalecer los métodos de cifrado de los datos de los usuarios.",
          "changes": [
            "Actualización de los algoritmos de cifrado para los datos en reposo y en tránsito",
            "Implementación de cifrado AES-256 para los datos sensibles de los usuarios",
            "Añadido cifrado adicional para la comunicación API y el almacenamiento en base de datos"
          ],
          "impact": "Este parche garantiza que los datos de los usuarios ahora estén mejor protegidos contra posibles ataques, mejorando la seguridad general.",
          "technicalNotes": [
            "Las claves de cifrado fueron rotadas como parte de la actualización",
            "Se aplicaron nuevos protocolos de seguridad para las comunicaciones API"
          ]
        }
      }
    }
  },
  {
    "id": "12",
    "version": "v2.1.3",
    "date": "2024-12-12",
    "type": "security",
    "translations": {
      "en": {
        "title": "Security Patch for Data Encryption Vulnerability",
        "description": "Fixed a vulnerability related to weak data encryption in user communications and storage.",
        "details": {
          "summary": "A security vulnerability was identified and patched to strengthen encryption methods for user data.",
          "changes": [
            "Upgraded encryption algorithms for data at rest and in transit",
            "Implemented AES-256 encryption for sensitive user data",
            "Added additional encryption for API communication and database storage"
          ],
          "impact": "This patch ensures that user data is now better protected against potential attacks, enhancing overall security.",
          "technicalNotes": [
            "Encryption keys were rotated as part of the update",
            "New security protocols were applied for API communications"
          ]
        }
      },
      "es": {
        "title": "Parché de Seguridad para Vulnerabilidad de Cifrado de Datos",
        "description": "Se solucionó una vulnerabilidad relacionada con un cifrado débil de datos en las comunicaciones y almacenamiento de usuarios.",
        "details": {
          "summary": "Se identificó y corrigió una vulnerabilidad de seguridad para fortalecer los métodos de cifrado de los datos de los usuarios.",
          "changes": [
            "Actualización de los algoritmos de cifrado para los datos en reposo y en tránsito",
            "Implementación de cifrado AES-256 para los datos sensibles de los usuarios",
            "Añadido cifrado adicional para la comunicación API y el almacenamiento en base de datos"
          ],
          "impact": "Este parche garantiza que los datos de los usuarios ahora estén mejor protegidos contra posibles ataques, mejorando la seguridad general.",
          "technicalNotes": [
            "Las claves de cifrado fueron rotadas como parte de la actualización",
            "Se aplicaron nuevos protocolos de seguridad para las comunicaciones API"
          ]
        }
      }
    }
  },
  {
    "id": "13",
    "version": "v2.1.3",
    "date": "2024-12-12",
    "type": "security",
    "translations": {
      "en": {
        "title": "Security Patch for Data Encryption Vulnerability",
        "description": "Fixed a vulnerability related to weak data encryption in user communications and storage.",
        "details": {
          "summary": "A security vulnerability was identified and patched to strengthen encryption methods for user data.",
          "changes": [
            "Upgraded encryption algorithms for data at rest and in transit",
            "Implemented AES-256 encryption for sensitive user data",
            "Added additional encryption for API communication and database storage"
          ],
          "impact": "This patch ensures that user data is now better protected against potential attacks, enhancing overall security.",
          "technicalNotes": [
            "Encryption keys were rotated as part of the update",
            "New security protocols were applied for API communications"
          ]
        }
      },
      "es": {
        "title": "Parché de Seguridad para Vulnerabilidad de Cifrado de Datos",
        "description": "Se solucionó una vulnerabilidad relacionada con un cifrado débil de datos en las comunicaciones y almacenamiento de usuarios.",
        "details": {
          "summary": "Se identificó y corrigió una vulnerabilidad de seguridad para fortalecer los métodos de cifrado de los datos de los usuarios.",
          "changes": [
            "Actualización de los algoritmos de cifrado para los datos en reposo y en tránsito",
            "Implementación de cifrado AES-256 para los datos sensibles de los usuarios",
            "Añadido cifrado adicional para la comunicación API y el almacenamiento en base de datos"
          ],
          "impact": "Este parche garantiza que los datos de los usuarios ahora estén mejor protegidos contra posibles ataques, mejorando la seguridad general.",
          "technicalNotes": [
            "Las claves de cifrado fueron rotadas como parte de la actualización",
            "Se aplicaron nuevos protocolos de seguridad para las comunicaciones API"
          ]
        }
      }
    }
  },
  {
    "id": "14",
    "version": "v2.1.3",
    "date": "2024-12-12",
    "type": "security",
    "translations": {
      "en": {
        "title": "Security Patch for Data Encryption Vulnerability",
        "description": "Fixed a vulnerability related to weak data encryption in user communications and storage.",
        "details": {
          "summary": "A security vulnerability was identified and patched to strengthen encryption methods for user data.",
          "changes": [
            "Upgraded encryption algorithms for data at rest and in transit",
            "Implemented AES-256 encryption for sensitive user data",
            "Added additional encryption for API communication and database storage"
          ],
          "impact": "This patch ensures that user data is now better protected against potential attacks, enhancing overall security.",
          "technicalNotes": [
            "Encryption keys were rotated as part of the update",
            "New security protocols were applied for API communications"
          ]
        }
      },
      "es": {
        "title": "Parché de Seguridad para Vulnerabilidad de Cifrado de Datos",
        "description": "Se solucionó una vulnerabilidad relacionada con un cifrado débil de datos en las comunicaciones y almacenamiento de usuarios.",
        "details": {
          "summary": "Se identificó y corrigió una vulnerabilidad de seguridad para fortalecer los métodos de cifrado de los datos de los usuarios.",
          "changes": [
            "Actualización de los algoritmos de cifrado para los datos en reposo y en tránsito",
            "Implementación de cifrado AES-256 para los datos sensibles de los usuarios",
            "Añadido cifrado adicional para la comunicación API y el almacenamiento en base de datos"
          ],
          "impact": "Este parche garantiza que los datos de los usuarios ahora estén mejor protegidos contra posibles ataques, mejorando la seguridad general.",
          "technicalNotes": [
            "Las claves de cifrado fueron rotadas como parte de la actualización",
            "Se aplicaron nuevos protocolos de seguridad para las comunicaciones API"
          ]
        }
      }
    }
  },
  {
    "id": "7",
    "version": "v2.1.3",
    "date": "2024-12-12",
    "type": "security",
    "translations": {
      "en": {
        "title": "Security Patch for Data Encryption Vulnerability",
        "description": "Fixed a vulnerability related to weak data encryption in user communications and storage.",
        "details": {
          "summary": "A security vulnerability was identified and patched to strengthen encryption methods for user data.",
          "changes": [
            "Upgraded encryption algorithms for data at rest and in transit",
            "Implemented AES-256 encryption for sensitive user data",
            "Added additional encryption for API communication and database storage"
          ],
          "impact": "This patch ensures that user data is now better protected against potential attacks, enhancing overall security.",
          "technicalNotes": [
            "Encryption keys were rotated as part of the update",
            "New security protocols were applied for API communications"
          ]
        }
      },
      "es": {
        "title": "Parché de Seguridad para Vulnerabilidad de Cifrado de Datos",
        "description": "Se solucionó una vulnerabilidad relacionada con un cifrado débil de datos en las comunicaciones y almacenamiento de usuarios.",
        "details": {
          "summary": "Se identificó y corrigió una vulnerabilidad de seguridad para fortalecer los métodos de cifrado de los datos de los usuarios.",
          "changes": [
            "Actualización de los algoritmos de cifrado para los datos en reposo y en tránsito",
            "Implementación de cifrado AES-256 para los datos sensibles de los usuarios",
            "Añadido cifrado adicional para la comunicación API y el almacenamiento en base de datos"
          ],
          "impact": "Este parche garantiza que los datos de los usuarios ahora estén mejor protegidos contra posibles ataques, mejorando la seguridad general.",
          "technicalNotes": [
            "Las claves de cifrado fueron rotadas como parte de la actualización",
            "Se aplicaron nuevos protocolos de seguridad para las comunicaciones API"
          ]
        }
      }
    }
  },
  //more release notes...
]

export const SAMPLE_ADS = [
  {
    id: "1",
    title: "Boost Your Business with AI-Powered Automation",
    description: "Automate tasks and scale your business faster with AI-driven solutions. Get started today!",
    imageUrl: "https://plus.unsplash.com/premium_photo-1679397476740-a236a0c87fad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9uZXl8ZW58MHx8MHx8fDA%3D",
    link: "https://automation.ai",
    pill: "🤖 Try Automation Tools"
  },
  {
    id: "2",
    title: "Transform Your Marketing with AI Insights",
    description: "Leverage AI to unlock deep marketing insights, optimize your strategy, and grow your brand.",
    imageUrl: "https://images.unsplash.com/photo-1518183214770-9cffbec72538?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bW9uZXl8ZW58MHx8MHx8fDA%3D",
    link: "https://marketing.ai",
    pill: "📊 Discover Marketing AI"
  },
  {
    id: "3",
    title: "AI Tools for Data-Driven Decisions",
    description: "Make smarter business decisions with powerful AI analytics and data-driven insights.",
    imageUrl: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG1vbmV5fGVufDB8fDB8fHww",
    link: "https://data.ai",
    pill: "📈 Try Data Analytics Tools"
  }
];

// Types for our data and state
type TimeRange = '24h' | '7d' | '30d' | '90d';
type ChartType = 'bar' | 'pie' | 'line';

interface ModelUsage {
  model: string;
  usage: number;
}

interface CategoryUsage {
  label: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  [key: string]: number | string; 
}

export const modelUsageData: ModelUsage[] = [
  { model: 'GPT-4', usage: 450, },
  { model: 'DALL-E', usage: 280 },
  { model: 'Claude', usage: 320 },
  { model: 'Stable Diffusion', usage: 200 },
  { model: 'Whisper', usage: 150 },
];

export const categoryUsageData: CategoryUsage[] = [
  { label: 'Text Generation', value: 45 },
  { label: 'Image Generation', value: 25 },
  { label: 'Audio Generation', value: 15 },
  { label: 'Video Generation', value: 15 },
];

export const timeSeriesData: TimeSeriesData[] = [
  { date: '2024-01', 'GPT-4': 65, 'DALL-E': 28, 'Claude': 45, 'Gemini': 30 },
  { date: '2024-02', 'GPT-4': 59, 'DALL-E': 48, 'Claude': 38, 'Gemini': 49 },
  { date: '2024-03', 'GPT-4': 80, 'DALL-E': 40, 'Claude': 43, 'Gemini': 80 },
  { date: '2024-04', 'GPT-4': 81, 'DALL-E': 35, 'Claude': 52, 'Gemini': 62 },
  { date: '2024-05', 'GPT-4': 56, 'DALL-E': 45, 'Claude': 47, 'Gemini': 35 },
];

export const imageOptions = [
  {
    label: "Generate beautiful artwork",
    icon: <Brush className="w-4 h-4 text-pink-500" />,
    description: "Create stunning artwork with artistic lighting and vivid colors."
  },
  {
    label: "Design a logo for a coffee brand",
    icon: <Coffee className="w-4 h-4 text-amber-600" />,
    description: "Generate a stylish and modern logo for a cozy coffee brand."
  },
  {
    label: "Futuristic city at sunset",
    icon: <Building2 className="w-4 h-4 text-orange-500" />,
    description: "A glowing futuristic metropolis illuminated by the golden hues of sunset."
  },
  {
    label: "Cozy cabin in the woods",
    icon: <IoHomeOutline  className="w-4 h-4 text-amber-400" />,
    description: "A warm wooden cabin surrounded by pine trees and gentle evening light."
  },
  {
    label: "Surreal desert landscape",
    icon: <Sun className="w-4 h-4 text-yellow-500" />,
    description: "Dreamlike desert dunes with strange formations and ethereal colors."
  },
  {
    label: "Cyberpunk street at night",
    icon: <Cpu className="w-4 h-4 text-fuchsia-500" />,
    description: "A neon-drenched cyberpunk alley glowing with holograms and rain reflections."
  },
  {
    label: "Dreamy underwater world",
    icon: <Fish className="w-4 h-4 text-cyan-400" />,
    description: "A serene underwater realm filled with coral reefs, bubbles, and glowing light."
  },
  {
    label: "Castle floating in the clouds",
    icon: <Castle className="w-4 h-4 text-indigo-400" />,
    description: "A magical floating castle drifting among soft white clouds in the sky."
  },
  {
    label: "Colorful galaxy swirl",
    icon: <Orbit className="w-4 h-4 text-purple-500" />,
    description: "A spiral galaxy bursting with colorful cosmic light and star dust."
  },
  {
    label: "Minimalist mountain art",
    icon: <Mountain className="w-4 h-4 text-gray-500" />,
    description: "Clean, minimalist illustration of a tranquil mountain landscape."
  },
  {
    label: "Retro neon diner",
    icon: <Lamp className="w-4 h-4 text-pink-400" />,
    description: "A glowing retro diner with neon signs and 80s-inspired atmosphere."
  },
  {
    label: "Fantasy dragon in flight",
    icon: <Sparkles className="w-4 h-4 text-red-400" />,
    description: "A majestic dragon soaring through stormy skies over a fantasy realm."
  },
  {
    label: "Mystical forest with fog",
    icon: <Trees className="w-4 h-4 text-green-500" />,
    description: "A mysterious fog-covered forest bathed in soft ethereal light."
  },
  {
    label: "Sunrise over snowy peaks",
    icon: <Sunrise className="w-4 h-4 text-amber-300" />,
    description: "Golden sunrise light shining over pristine snow-capped mountains."
  },
  {
    label: "Whimsical treehouse village",
    icon: <TreePine className="w-4 h-4 text-lime-500" />,
    description: "A charming village of interconnected treehouses in a magical forest."
  },
  {
    label: "Golden hour beach waves",
    icon: <Waves className="w-4 h-4 text-orange-400" />,
    description: "Sunset waves glimmering with golden reflections and soft sea breeze."
  },
  {
    label: "Steampunk airship",
    icon: <Cog className="w-4 h-4 text-amber-500" />,
    description: "A massive airship powered by gears and steam floating through cloudy skies."
  },
  {
    label: "Lush jungle waterfall",
    icon: <Droplet className="w-4 h-4 text-green-400" />,
    description: "A tropical jungle with a roaring waterfall and misty sunlight beams."
  },
  {
    label: "Otherworldly alien planet",
    icon: <IoPlanetOutline  className="w-4 h-4 text-purple-400" />,
    description: "An alien landscape with colorful terrain, strange flora, and twin suns."
  },
  {
    label: "Abstract shapes and colors",
    icon: <Shapes className="w-4 h-4 text-fuchsia-400" />,
    description: "A modern abstract composition of dynamic shapes and vibrant gradients."
  },
  {
    label: "Glowing crystal cave",
    icon: <Gem className="w-4 h-4 text-cyan-400" />,
    description: "A mysterious cave filled with glowing crystals and magical reflections."
  },
  {
    label: "Peaceful Zen garden",
    icon: <Leaf className="w-4 h-4 text-green-400" />,
    description: "A tranquil Japanese Zen garden with raked sand and soft sunlight."
  },
  {
    label: "Stormy sea with lighthouse",
    icon: <CloudLightning className="w-4 h-4 text-blue-500" />,
    description: "Waves crashing against rocks as a lighthouse beams through the storm."
  },
  {
    label: "Retro-futuristic skyline",
    icon: <Building className="w-4 h-4 text-pink-400" />,
    description: "A city skyline combining retro 80s design with futuristic neon style."
  },
  {
    label: "Fantasy warrior portrait",
    icon: <Sword className="w-4 h-4 text-red-500" />,
    description: "A dramatic fantasy portrait of a heroic armored warrior."
  },
  {
    label: "Gothic cathedral at night",
    icon: <Landmark className="w-4 h-4 text-gray-500" />,
    description: "A towering Gothic cathedral illuminated by moonlight and mist."
  },
  {
    label: "Cute cartoon animals",
    icon: <Smile className="w-4 h-4 text-yellow-400" />,
    description: "Adorable hand-drawn animals in a colorful and playful cartoon style."
  },
  {
    label: "Otherworldly desert oasis",
    icon: <Palmtree className="w-4 h-4 text-emerald-500" />,
    description: "A surreal oasis with glowing plants and shimmering sand dunes."
  },
  {
    label: "Aurora lights over mountains",
    icon: <CloudMoon className="w-4 h-4 text-teal-400" />,
    description: "Vibrant aurora lights dancing above icy peaks under a starry sky."
  },
  {
    label: "Cybernetic samurai",
    icon: <Cpu className="w-4 h-4 text-fuchsia-600" />,
    description: "A futuristic samurai blending traditional armor with advanced technology."
  },
  {
    label: "Tropical island paradise",
    icon: <PiIslandFill className="w-4 h-4 text-green-500" />,
    description: "Crystal-clear waters and palm trees on a sunny tropical island."
  },
  {
    label: "Neon lights in the rain",
    icon: <Umbrella className="w-4 h-4 text-blue-400" />,
    description: "Cinematic reflections of neon signs glowing through soft falling rain."
  },
  {
    label: "Abstract fractal art",
    icon: <Infinity className="w-4 h-4 text-purple-500" />,
    description: "Mesmerizing digital fractals forming complex colorful geometric patterns."
  },
  {
    label: "Ancient ruins in the jungle",
    icon: <Landmark className="w-4 h-4 text-green-700" />,
    description: "Moss-covered ancient temples hidden deep within a tropical jungle."
  },
  {
    label: "Otherworldly floating islands",
    icon: <Cloud className="w-4 h-4 text-indigo-400" />,
    description: "Mystical floating islands drifting through the misty atmosphere."
  },
  {
    label: "Wild west desert town",
    icon: <CircleDollarSign className="w-4 h-4 text-amber-600" />,
    description: "A dusty western town under a blazing sun, filled with rustic charm."
  },
  {
    label: "Glowing mushrooms forest",
    icon: <Leaf className="w-4 h-4 text-emerald-400" />,
    description: "A mystical forest glowing with luminescent mushrooms and mist."
  },
  {
    label: "Futuristic sports car",
    icon: <Car className="w-4 h-4 text-sky-500" />,
    description: "A sleek futuristic vehicle with neon underglow and aerodynamic curves."
  },
  {
    label: "Space station orbiting Earth",
    icon: <Orbit className="w-4 h-4 text-blue-500" />,
    description: "A detailed sci-fi view of a massive space station orbiting the planet."
  },
  {
    label: "Fantasy castle on a cliff",
    icon: <Castle className="w-4 h-4 text-indigo-500" />,
    description: "A grand fantasy castle perched on a rocky cliff overlooking the sea."
  },
  {
    label: "Abstract watercolor splash",
    icon: <Brush className="w-4 h-4 text-pink-300" />,
    description: "Colorful watercolor splashes blending seamlessly in artistic harmony."
  },
  {
    label: "Snowy village at Christmas",
    icon: <Snowflake className="w-4 h-4 text-blue-300" />,
    description: "A charming Christmas village covered in snow and warm glowing lights."
  },
  {
    label: "Magical glowing butterfly",
    icon: <PiButterfly className="w-4 h-4 text-violet-400" />,
    description: "A luminescent butterfly fluttering through a softly glowing forest."
  },
  {
    label: "Retro 80s synthwave scene",
    icon: <Music className="w-4 h-4 text-pink-500" />,
    description: "A neon synthwave aesthetic with grids, sunsets, and futuristic vibes."
  },
  {
    label: "Fantasy tavern interior",
    icon: <Wine className="w-4 h-4 text-amber-500" />,
    description: "A cozy medieval tavern filled with candlelight, wood, and warm tones."
  },
  {
    label: "Lost city under the ocean",
    icon: <Anchor className="w-4 h-4 text-cyan-500" />,
    description: "An ancient underwater city illuminated by shafts of sunlight and coral."
  },

]

export const videoOptions = [
  {
    label: "Sunset over a futuristic city",
    icon: <Sun className="w-4 h-4 text-orange-500" />,
    description: "A breathtaking cinematic sunset over a futuristic skyline with glowing neon buildings and hovering vehicles."
  },
  {
    label: "A busy Tokyo street at night",
    icon: <Building className="w-4 h-4 text-pink-500" />,
    description: "A vibrant Tokyo street filled with neon lights, bustling crowds, and cinematic reflections after rain."
  },
  {
    label: "Epic space travel through galaxies",
    icon: <Rocket className="w-4 h-4 text-purple-500" />,
    description: "Journey through colorful galaxies and nebulae at light speed with stunning cosmic visuals."
  },
  {
    label: "Waves crashing on rocky cliffs",
    icon: <Waves className="w-4 h-4 text-blue-500" />,
    description: "Powerful ocean waves crashing dramatically against rugged cliffs under a cloudy sky."
  },
  {
    label: "A medieval knight walking through fog",
    icon: <Shield className="w-4 h-4 text-gray-500" />,
    description: "A lone knight in armor emerging from the mist, cinematic and mysterious atmosphere."
  },
  {
    label: "Slow-motion raindrops on glass",
    icon: <Droplets className="w-4 h-4 text-blue-400" />,
    description: "Macro cinematic close-up of raindrops sliding down a glass surface in slow motion."
  },
  {
    label: "Birds migrating across the sky",
    icon: <Bird className="w-4 h-4 text-sky-500" />,
    description: "Aerial view of thousands of birds flying across golden skies during migration."
  },
  {
    label: "Cinematic view of New York skyline",
    icon: <Building2 className="w-4 h-4 text-blue-600" />,
    description: "A sweeping cinematic shot of the New York skyline at dusk with glowing city lights."
  },
  {
    label: "Close-up of a candle burning",
    icon: <Flame className="w-4 h-4 text-amber-500" />,
    description: "A warm, intimate close-up of a candle flame flickering in the dark."
  },
  {
    label: "Spaceship landing on Mars",
    icon: <Rocket className="w-4 h-4 text-red-500" />,
    description: "A detailed cinematic sequence of a spacecraft descending onto the dusty Martian surface."
  },
  {
    label: "Forest morning with mist",
    icon: <Trees className="w-4 h-4 text-green-500" />,
    description: "Soft morning light filtering through misty trees in a peaceful forest setting."
  },
  {
    label: "A dragon flying over mountains",
    icon: <Sparkles className="w-4 h-4 text-rose-500" />,
    description: "A majestic dragon soaring above rugged mountain peaks under dramatic clouds."
  },
  {
    label: "Storm rolling in over desert",
    icon: <CloudLightning className="w-4 h-4 text-yellow-600" />,
    description: "Dark thunderclouds forming above vast sand dunes with cinematic tension."
  },
  {
    label: "Glowing jellyfish underwater",
    icon: <Fish className="w-4 h-4 text-cyan-400" />,
    description: "A mesmerizing underwater view of glowing jellyfish drifting in the deep blue."
  },
  {
    label: "Robot exploring a neon city",
    icon: <Cpu className="w-4 h-4 text-fuchsia-500" />,
    description: "A futuristic robot navigating glowing neon alleys of a cyberpunk metropolis."
  },
  {
    label: "Butterflies in a summer meadow",
    icon: <Flower2 className="w-4 h-4 text-yellow-500" />,
    description: "Colorful butterflies fluttering across a sunlit meadow filled with flowers."
  },
  {
    label: "Cinematic drone shot of a volcano",
    icon: <Aperture className="w-4 h-4 text-red-600" />,
    description: "Epic aerial footage of a smoking volcano surrounded by lava flows and mist."
  },
  {
    label: "Aurora lights dancing in the sky",
    icon: <CloudMoon className="w-4 h-4 text-emerald-400" />,
    description: "Vibrant northern lights shimmering across the night sky above icy landscapes."
  },
  {
    label: "Fantasy castle in the clouds",
    icon: <Castle className="w-4 h-4 text-indigo-400" />,
    description: "A dreamlike floating castle surrounded by clouds and glowing magical light."
  },
  {
    label: "Ocean waves under moonlight",
    icon: <Moon className="w-4 h-4 text-blue-400" />,
    description: "Soft moonlight reflecting off gentle ocean waves in a tranquil night scene."
  },
  {
    label: "Car chase through neon streets",
    icon: <Car className="w-4 h-4 text-pink-600" />,
    description: "A high-speed chase through rain-soaked neon streets in a cyberpunk city."
  },
  {
    label: "Abstract colorful particles",
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    description: "Dynamic flowing motion of colorful glowing particles in an abstract pattern."
  },
  {
    label: "A cat walking on a rooftop",
    icon: <Cat className="w-4 h-4 text-amber-600" />,
    description: "A cinematic shot of a cat gracefully walking across rooftops under twilight skies."
  },
  {
    label: "Surfing giant waves at sunset",
    icon: <Waves className="w-4 h-4 text-orange-400" />,
    description: "A surfer riding massive golden waves under a glowing sunset sky."
  },
  {
    label: "Lava flowing from a volcano",
    icon: <Flame className="w-4 h-4 text-red-500" />,
    description: "Slow-motion shot of glowing lava streams cascading down volcanic slopes."
  },
  {
    label: "Hot air balloons over canyons",
    icon: <IoBalloonOutline className="w-4 h-4 text-orange-300" />,
    description: "Dozens of colorful hot air balloons drifting over dramatic canyon landscapes."
  },
  {
    label: "Space station orbiting Earth",
    icon: <Orbit className="w-4 h-4 text-blue-500" />,
    description: "A detailed cinematic view of a futuristic space station rotating above Earth."
  },
  {
    label: "Slow pan over ancient ruins",
    icon: <Landmark className="w-4 h-4 text-gray-400" />,
    description: "Cinematic slow camera movement over ancient temple ruins and scattered relics."
  },
  {
    label: "Snow falling in a forest",
    icon: <Snowflake className="w-4 h-4 text-blue-300" />,
    description: "Soft snowflakes drifting down through quiet evergreen trees."
  },
  {
    label: "A futuristic sports match",
    icon: <Gamepad className="w-4 h-4 text-violet-500" />,
    description: "Dynamic futuristic arena with neon-lit athletes competing in high-tech sports."
  },
  {
    label: "Robot hand reaching for a flower",
    icon: <Hand className="w-4 h-4 text-pink-400" />,
    description: "A touching cinematic shot of a robotic hand gently reaching for a blooming flower."
  },
  {
    label: "Rain falling in a neon-lit alley",
    icon: <Umbrella className="w-4 h-4 text-blue-500" />,
    description: "Rain-soaked neon-lit alleyway with reflections and moody cyberpunk ambience."
  },
  {
    label: "Fireworks exploding in the sky",
    icon: <Sparkles className="w-4 h-4 text-red-400" />,
    description: "Brilliant fireworks bursting over a night city skyline with reflections on water."
  },
  {
    label: "A pirate ship in stormy seas",
    icon: <Ship className="w-4 h-4 text-gray-500" />,
    description: "A dramatic shot of a pirate ship battling massive waves under lightning skies."
  },
  {
    label: "A cinematic train journey",
    icon: <Train className="w-4 h-4 text-amber-400" />,
    description: "A sweeping view of a train winding through mountains and valleys during golden hour."
  },
  {
    label: "Fantasy dragon breathing fire",
    icon: <Flame className="w-4 h-4 text-orange-500" />,
    description: "An epic fantasy shot of a dragon unleashing flames into the night sky."
  },
  {
    label: "City lights turning on at dusk",
    icon: <Building className="w-4 h-4 text-yellow-400" />,
    description: "Time-lapse of a cityscape transitioning from sunset to glowing night lights."
  },
  {
    label: "Dandelions blowing in the wind",
    icon: <Flower2 className="w-4 h-4 text-lime-400" />,
    description: "Soft focus cinematic shot of dandelion seeds drifting through sunlight."
  },
  {
    label: "Giant whale swimming in the sky",
    icon: <Cloud className="w-4 h-4 text-sky-400" />,
    description: "Surreal dreamlike image of a massive whale gliding gracefully through clouds."
  },
  {
    label: "Kids playing in slow motion",
    icon: <Smile className="w-4 h-4 text-yellow-400" />,
    description: "Joyful slow-motion footage of children playing in the sunshine."
  },
  {
    label: "Timelapse of city traffic",
    icon: <Clock9 className="w-4 h-4 text-blue-400" />,
    description: "A high-speed time-lapse of cars and lights streaking through busy streets."
  },
  {
    label: "Cinematic battle in the desert",
    icon: <Sword className="w-4 h-4 text-red-600" />,
    description: "Epic war scene unfolding across vast desert dunes under a burning sky."
  },
  {
    label: "A waterfall in a jungle",
    icon: <Droplet className="w-4 h-4 text-green-400" />,
    description: "A lush jungle scene with mist and cascading waterfalls surrounded by greenery."
  },
  {
    label: "Rocket launching into space",
    icon: <Rocket className="w-4 h-4 text-orange-500" />,
    description: "A cinematic rocket launch with roaring engines and dramatic liftoff visuals."
  },
  {
    label: "Morning light through blinds",
    icon: <Sun className="w-4 h-4 text-yellow-300" />,
    description: "Soft morning light streaming through window blinds, creating warm patterns."
  },
  {
    label: "A campfire under the stars",
    icon: <Flame className="w-4 h-4 text-amber-500" />,
    description: "Friends gathered around a glowing campfire beneath a clear, starry sky."
  },
  {
    label: "Abstract glitchy visuals",
    icon: <Code2 className="w-4 h-4 text-fuchsia-400" />,
    description: "A series of fast-cut glitch effects and abstract digital distortions."
  },
  {
    label: "A cyberpunk chase scene",
    icon: <Zap className="w-4 h-4 text-pink-500" />,
    description: "Fast-paced chase through neon-lit futuristic streets with intense action."
  },
  {
    label: "Galaxy forming in deep space",
    icon: <Orbit className="w-4 h-4 text-indigo-500" />,
    description: "Cosmic dust and stars swirling together to form a brilliant new galaxy."
  },
  {
    label: "Wolves running through snow",
    icon: <PawPrint className="w-4 h-4 text-gray-400" />,
    description: "A pack of wolves sprinting through a snowy forest in cinematic slow motion."
  },
  {
    label: "Sunlight over wheat fields",
    icon: <Sun className="w-4 h-4 text-yellow-400" />,
    description: "Golden sunlight rippling across vast wheat fields under a bright sky."
  },
];

// Add this after the SUMMARY_RESPONSES constant
export const SUMMARY_DATA = {
  summary: `The models have provided various perspectives on building a wall. Here's a comprehensive overview of their responses, highlighting key agreements and differences in their approaches.`,
  
  consistencies: [
    {
      point: "All models agree that proper foundation is crucial for wall stability",
      models: ["ChatGPT 3.5", "Claude 3 Opus", "Claude 3 Sonnet"]
    },
    {
      point: "Material selection should prioritize durability and local climate conditions",
      models: ["ChatGPT 3.5", "Claude 3 Opus", "Sonar Small"]
    },
    {
      point: "Regular maintenance is essential for long-term wall integrity",
      models: ["Claude 3 Opus", "Claude 3 Sonnet", "Sonar Small"]
    }
  ],
  
  inconsistencies: [
    {
      point: "Recommended wall height varies between models",
      variations: [
        { model: "ChatGPT 3.5", response: "Suggests 6-8 feet for residential purposes" },
        { model: "Claude 3 Opus", response: "Recommends 10-12 feet for maximum security" },
        { model: "Sonar Small", response: "Proposes variable height based on specific needs" }
      ]
    },
    {
      point: "Construction timeline estimates differ",
      variations: [
        { model: "ChatGPT 3.5", response: "2-3 weeks for completion" },
        { model: "Claude 3 Opus", response: "4-6 weeks including preparation" },
        { model: "Claude 3 Sonnet", response: "3-4 weeks with proper planning" }
      ]
    }
  ],
  
  finalAnswer: `Based on the collective analysis, the optimal approach would be to:
  1. Start with a professional soil assessment
  2. Use reinforced concrete foundation
  3. Build with weather-resistant materials
  4. Implement a phased construction approach
  5. Include regular maintenance checkpoints
  
  This balanced approach incorporates the most reliable recommendations while addressing potential concerns raised by different models.`
};
