import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTenantStore } from '../tenants/tenantStore';
import { authService } from '../auth/authService';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  UserIcon,
  RectangleStackIcon,
  UsersIcon,
  TableCellsIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
  hasDropdown?: boolean;
}

interface NavigationSection {
  category: string | null;
  items: NavigationItem[];
}

const DashboardLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTenant, tenants, switchTenant, fetchTenants } = useTenantStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Fetch tenants on component mount
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail && tenants.length === 0) {
      fetchTenants(userEmail);
    }
  }, [fetchTenants, tenants.length]);

  const navigation: NavigationSection[] = [
    {
      category: 'DASHBOARD',
      items: [
        { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon },
      ]
    },
    {
      category: 'POS MANAGEMENT',
      items: [
        { name: t('nav.sales'), href: '/sales', icon: ShoppingCartIcon },
        { name: t('nav.products'), href: '/products', icon: CubeIcon },
        { name: t('nav.categories'), href: '/categories', icon: TagIcon },
        { name: t('nav.customers'), href: '/customers', icon: UserGroupIcon },
      ]
    },
    {
      category: 'REPORTS & ANALYTICS',
      items: [
        { name: 'Sales Reports', href: '/reports/sales', icon: ChartBarIcon },
        { name: 'Inventory Reports', href: '/reports/inventory', icon: RectangleStackIcon },
        { name: 'Customer Analytics', href: '/reports/customers', icon: UsersIcon },
        { name: 'Financial Reports', href: '/reports/financial', icon: DocumentTextIcon },
      ]
    },
    {
      category: 'DEVELOPMENT',
      items: [
        { name: t('demo.title'), href: '/demo', icon: Cog6ToothIcon },
      ]
    },
    {
      category: t('nav.settings'),
      items: [
        { name: 'Store Settings', href: '/settings/store', icon: BuildingStorefrontIcon },
        { name: 'User Management', href: '/settings/users', icon: UserIcon },
        { name: 'Payment Methods', href: '/settings/payments', icon: CreditCardIcon },
        { name: 'Tax Settings', href: '/tax-settings', icon: TableCellsIcon },
        { name: 'System Settings', href: '/settings/system', icon: Cog6ToothIcon },
      ]
    }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      await authService.signOut();
      navigate('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      navigate('/auth/signin');
    }
  };

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setLanguageMenuOpen(false);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const handleTenantSwitch = (tenantId: string) => {
    switchTenant(tenantId);
    setTenantMenuOpen(false);
  };

  const userEmail = localStorage.getItem('userEmail') || 'demo@example.com';
  const userName = userEmail.split('@')[0] || 'Demo User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar - Always visible on medium screens and above */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out border-r border-gray-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mr-3">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">POS Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tenant Selector */}
          {tenants.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="relative">
                <button
                  onClick={() => setTenantMenuOpen(!tenantMenuOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <BuildingStorefrontIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {currentTenant?.name || 'Select Store'}
                    </span>
                  </div>
                  <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
                </button>
                {tenantMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {tenants.map((tenant) => (
                      <button
                        key={tenant.id}
                        onClick={() => handleTenantSwitch(tenant.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          currentTenant?.id === tenant.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                          {tenant.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.category && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.category}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.active || isCurrentPath(item.href);
                    const isExpanded = expandedMenus.includes(item.name);
                    
                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => {
                            if (item.hasDropdown) {
                              toggleMenu(item.name);
                            } else {
                              navigate(item.href);
                              setSidebarOpen(false);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                            {item.name}
                          </div>
                          {item.hasDropdown && (
                            <ChevronDownIcon 
                              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`} 
                            />
                          )}
                        </button>
                        {item.hasDropdown && isExpanded && (
                          <div className="ml-8 mt-1 space-y-1">
                            <button className="w-full text-left px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                              Submenu 1
                            </button>
                            <button className="w-full text-left px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                              Submenu 2
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {sectionIndex < navigation.length - 1 && <div className="my-4" />}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Search */}
              <div className="hidden md:block ml-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                  className="flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-lg">{getCurrentLanguage().flag}</span>
                </button>
                {languageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span className="mr-3">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative transition-colors">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* Settings */}
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => navigate('/profile')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Your Profile
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Settings
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Click outside handlers */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
      )}
      {languageMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setLanguageMenuOpen(false)} />
      )}
      {tenantMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setTenantMenuOpen(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
