import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Fallback translations
const fallbackResources = {
  en: {
    translation: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.products': 'Products',
      'nav.categories': 'Categories',
      'nav.sales': 'Sales',
      'nav.customers': 'Customers',
      'nav.settings': 'Settings',
      
      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      
      // Auth
      'auth.signIn': 'Sign In',
      'auth.signUp': 'Sign Up',
      'auth.signOut': 'Sign Out',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.resetPassword': 'Reset Password',
      'auth.verificationCode': 'Verification Code',
      'auth.name': 'Full Name',
      
      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.totalSales': 'Total Sales',
      'dashboard.totalOrders': 'Total Orders',
      'dashboard.totalCustomers': 'Total Customers',
      'dashboard.totalProducts': 'Total Products',
      'dashboard.salesTrend': 'Sales Trend',
      'dashboard.recentTransactions': 'Recent Transactions',
      
      // Products
      'products.title': 'Products',
      'products.addProduct': 'Add Product',
      'products.editProduct': 'Edit Product',
      'products.productName': 'Product Name',
      'products.sku': 'SKU',
      'products.description': 'Description',
      'products.price': 'Price',
      'products.discount': 'Discount',
      'products.tax': 'Tax',
      'products.category': 'Category',
      'products.inventory': 'Inventory',
      'products.status': 'Status',
      'products.active': 'Active',
      'products.inactive': 'Inactive',
      'products.uploadImage': 'Upload Image',

      // Sales
      'sales.title': 'Sales',
      'sales.newSale': 'New Sale',
      'sales.todaysRevenue': "Today's Revenue",
      'sales.todaysSales': "Today's Sales",
      'sales.completed': 'Completed',
      'sales.pending': 'Pending',
      
      // Tenant
      'tenant.switchTenant': 'Switch Organization',
      'tenant.currentTenant': 'Current Organization',
      
      // Language
      'language.switchLanguage': 'Switch Language',
      'language.english': 'English',
      'language.spanish': 'Spanish',
      
      // Demo
      'demo.title': 'Translation Demo',
      'demo.features': 'Features',
      'demo.feature1': 'Real-time language switching',
      'demo.feature2': 'Persistent language preference',
      'demo.feature3': 'Dynamic content translation',
    },
  },
  es: {
    translation: {
      // Navigation
      'nav.dashboard': 'Panel de Control',
      'nav.products': 'Productos',
      'nav.categories': 'Categorías',
      'nav.sales': 'Ventas',
      'nav.customers': 'Clientes',
      'nav.settings': 'Configuración',
      
      // Common
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.add': 'Agregar',
      'common.search': 'Buscar',
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'common.success': 'Éxito',
      
      // Auth
      'auth.signIn': 'Iniciar Sesión',
      'auth.signUp': 'Registrarse',
      'auth.signOut': 'Cerrar Sesión',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.confirmPassword': 'Confirmar Contraseña',
      'auth.forgotPassword': '¿Olvidaste tu contraseña?',
      'auth.resetPassword': 'Restablecer Contraseña',
      'auth.verificationCode': 'Código de Verificación',
      'auth.name': 'Nombre Completo',
      
      // Dashboard
      'dashboard.title': 'Panel de Control',
      'dashboard.totalSales': 'Ventas Totales',
      'dashboard.totalOrders': 'Pedidos Totales',
      'dashboard.totalCustomers': 'Clientes Totales',
      'dashboard.totalProducts': 'Productos Totales',
      'dashboard.salesTrend': 'Tendencia de Ventas',
      'dashboard.recentTransactions': 'Transacciones Recientes',
      
      // Products
      'products.title': 'Productos',
      'products.addProduct': 'Agregar Producto',
      'products.editProduct': 'Editar Producto',
      'products.productName': 'Nombre del Producto',
      'products.sku': 'SKU',
      'products.description': 'Descripción',
      'products.price': 'Precio',
      'products.discount': 'Descuento',
      'products.tax': 'Impuesto',
      'products.category': 'Categoría',
      'products.inventory': 'Inventario',
      'products.status': 'Estado',
      'products.active': 'Activo',
      'products.inactive': 'Inactivo',
      'products.uploadImage': 'Subir Imagen',

      // Sales
      'sales.title': 'Ventas',
      'sales.newSale': 'Nueva Venta',
      'sales.todaysRevenue': 'Ingresos de Hoy',
      'sales.todaysSales': 'Ventas de Hoy',
      'sales.completed': 'Completadas',
      'sales.pending': 'Pendientes',
      
      // Tenant
      'tenant.switchTenant': 'Cambiar Organización',
      'tenant.currentTenant': 'Organización Actual',
      
      // Language
      'language.switchLanguage': 'Cambiar Idioma',
      'language.english': 'Inglés',
      'language.spanish': 'Español',
      
      // Demo
      'demo.title': 'Demostración de Traducción',
      'demo.features': 'Características',
      'demo.feature1': 'Cambio de idioma en tiempo real',
      'demo.feature2': 'Preferencia de idioma persistente',
      'demo.feature3': 'Traducción dinámica de contenido',
    },
  },
} as const;

// Function to fetch translations from API
async function fetchTranslationsFromApi(language: string): Promise<any> {
  try {
    // In a real app, this would be your API endpoint
    const response = await fetch(`/api/translations/${language}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch translations');
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch translations for ${language}:`, error);
    // Return fallback translations
    return fallbackResources[language as keyof typeof fallbackResources]?.translation || {};
  }
}

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    // Use fallback resources
    resources: fallbackResources,
  });

// Function to load translations dynamically
export async function loadTranslations(language: string) {
  try {
    const translations = await fetchTranslationsFromApi(language);
    i18n.addResourceBundle(language, 'translation', translations, true, true);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Failed to load translations:', error);
    // Fallback to existing translations
    await i18n.changeLanguage(language);
  }
}

export default i18n;
