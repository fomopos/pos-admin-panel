import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTenantStore } from '../tenants/tenantStore';
import { authService } from '../auth/authService';
import logoSvg from '../assets/logo_border.svg';
import { PermissionManager, usePermissions } from '../utils/permissions';
import { VersionDisplay } from '../components/ui';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  TableCellsIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChevronUpDownIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  PercentBadgeIcon,
  CodeBracketIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
  hasDropdown?: boolean;
  children?: { name: string; href: string }[];
}

interface NavigationSection {
  category: string | null;
  items: NavigationItem[];
}

const DashboardLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTenant, currentStore, tenants, switchTenant, switchStore, getCurrentTenantStores } = useTenantStore();
  const { canManageUsers, canManageRoles } = usePermissions();
  const [permissionsInitialized, setPermissionsInitialized] = React.useState(false);

  // Debug logging for navigation
  React.useEffect(() => {
    console.log('Navigation check:', {
      permissionsInitialized,
      canManageUsers: canManageUsers(),
      canManageRoles: canManageRoles()
    });
  }, [canManageUsers, canManageRoles, permissionsInitialized]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // ── Mode: 'store' or 'tenant' ────────────────────────────────────────────
  type SidebarMode = 'store' | 'tenant';
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => {
    // Auto-detect mode from current URL
    if (location.pathname.startsWith('/tenant/')) return 'tenant';
    return 'store';
  });

  // Keep mode in sync if user navigates via browser back/forward
  React.useEffect(() => {
    if (location.pathname.startsWith('/tenant/')) {
      setSidebarMode('tenant');
    } else {
      setSidebarMode('store');
    }
  }, [location.pathname]);

  const handleModeSwitch = (mode: SidebarMode) => {
    setSidebarMode(mode);
    if (mode === 'tenant') {
      navigate('/tenant/overview');
    } else {
      navigate('/dashboard');
    }
    setSidebarOpen(false);
  };

  // Note: Tenants are loaded via TenantStoreSelection flow before reaching this layout
  // No need to fetch tenants here as it would interfere with the hierarchical auth flow

  // ── Store-mode navigation ────────────────────────────────────────────────
  const storeNavigation: NavigationSection[] = React.useMemo(() => [
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
        { name: t('nav.discounts'), href: '/discounts', icon: PercentBadgeIcon },
        { name: 'Reason Codes', href: '/reason-codes', icon: DocumentTextIcon },
        { name: t('nav.customers'), href: '/customers', icon: UserGroupIcon },
        { name: t('nav.tableManagement'), href: '/tables', icon: TableCellsIcon },
      ]
    },
    {
      category: t('nav.settings'),
      items: [
        { name: t('nav.storeSettings'), href: '/settings/store', icon: BuildingStorefrontIcon },
        { name: t('nav.terminalSettings'), href: '/settings/terminals', icon: ComputerDesktopIcon },
        { name: t('nav.paymentSettings'), href: '/payment-settings', icon: CreditCardIcon },
        { name: t('nav.taxSettings'), href: '/tax-settings', icon: TableCellsIcon },
      ]
    },
    {
      category: 'DEVELOPER',
      items: [
        { name: 'Receipt Builder', href: '/developer/receipt-builder', icon: CodeBracketIcon },
        { name: t('nav.translationManagement'), href: '/developer/translations', icon: LanguageIcon },
      ]
    }
  ], [permissionsInitialized, canManageUsers, canManageRoles, t]);

  // ── Tenant-mode navigation ───────────────────────────────────────────────
  const tenantNavigation: NavigationSection[] = React.useMemo(() => [
    {
      category: 'ORGANIZATION',
      items: [
        { name: 'Overview', href: '/tenant/overview', icon: HomeIcon },
        { name: 'Stores', href: '/tenant/stores', icon: BuildingStorefrontIcon },
        { name: 'Users & Roles', href: '/tenant/users', icon: UserGroupIcon },
      ]
    },
    {
      category: 'BILLING',
      items: [
        {
          name: 'Billing & Subscription',
          href: '/tenant/billing',
          icon: CreditCardIcon,
          hasDropdown: true,
          children: [
            { name: 'Overview', href: '/tenant/billing' },
            { name: 'Change Plan', href: '/tenant/billing/change-plan' },
            { name: 'Invoices', href: '/tenant/billing/invoices' },
            { name: 'Payment Methods', href: '/tenant/billing/payment-methods' },
          ],
        },
      ]
    },
    {
      category: 'ADMINISTRATION',
      items: [
        { name: t('nav.roleManagement'), href: '/tenant/roles', icon: UserGroupIcon },
        { name: 'Activity Log', href: '/tenant/audit-log', icon: ClipboardDocumentListIcon },
        { name: 'Tenant Settings', href: '/tenant/settings', icon: Cog6ToothIcon },
      ]
    }
  ], []);

  // Select which navigation to show
  const navigation = sidebarMode === 'tenant' ? tenantNavigation : storeNavigation;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  ];

  const handleSignOut = async () => {
    try {
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
    if (location.pathname === path) return true;
    // For tenant routes, highlight if pathname starts with the href
    if (path.startsWith('/tenant/') && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const [storeMenuOpen, setStoreMenuOpen] = useState(false);

  const handleTenantSwitch = async (tenantId: string) => {
    try {
      await switchTenant(tenantId);
      setTenantMenuOpen(false);
      setStoreMenuOpen(false); // Close store menu when switching tenant
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      // Keep menus open to allow retry
    }
  };

  const handleStoreSwitch = async (storeId: string) => {
    try {
      await switchStore(storeId);
      setStoreMenuOpen(false);
    } catch (error) {
      console.error('Failed to switch store:', error);
      // Still close the menu even if the switch failed
      setStoreMenuOpen(false);
    }
  };

  // Get user info from Cognito auth service
  const [currentUser, setCurrentUser] = React.useState<{ email: string; name: string } | null>(null);

  // Initialize user info (no tenant fetching - handled by TenantStoreSelection flow)
  React.useEffect(() => {
    const getCurrentUserInfo = async () => {
      const user = await authService.getCurrentUser();
      if (user?.email) {
        setCurrentUser({
          email: user.email,
          name: user.name || user.email.split('@')[0] || 'User'
        });

        // Initialize permission manager
        try {
          await PermissionManager.initialize();
          console.log('Permission manager initialized successfully');
          // Debug permission state
          PermissionManager.debug();
          setPermissionsInitialized(true);
        } catch (error) {
          console.error('Failed to initialize permissions:', error);
        }
      }
    };
    getCurrentUserInfo();
  }, []); // Only run once on mount

  const userName = currentUser?.name || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar - Always visible on medium screens and above */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out border-r border-gray-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <img src={logoSvg} alt="Logo" className="w-8 h-8 mr-3" />
              <span className="text-lg font-semibold text-gray-900">POS Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tenant/Store Selector */}
          {tenants.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-200 space-y-2">
              {/* Tenant Selection */}
              <div className="relative">
                <button
                  onClick={() => setTenantMenuOpen(!tenantMenuOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {currentTenant?.name || t('common.selectOrganization')}
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
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${currentTenant?.id === tenant.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                      >
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                          {tenant.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Store Selection - only show in store mode */}
              {currentTenant && sidebarMode === 'store' && (
                <div className="relative">
                  <button
                    onClick={() => setStoreMenuOpen(!storeMenuOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <BuildingStorefrontIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {currentStore?.store_name || t('common.selectStore')}
                      </span>
                    </div>
                    <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
                  </button>
                  {storeMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {getCurrentTenantStores().map((store) => (
                        <button
                          key={store.store_id}
                          onClick={() => handleStoreSwitch(store.store_id)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${currentStore?.store_id === store.store_id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            }`}
                        >
                          <div className="flex items-center">
                            <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">{store.store_name}</div>
                              <div className="text-xs text-gray-500">{store.location_type}</div>
                            </div>
                          </div>
                        </button>
                      ))}

                      {/* Divider */}
                      {getCurrentTenantStores().length > 0 && (
                        <div className="border-t border-gray-200 my-1"></div>
                      )}

                      {/* Create New Store Option */}
                      <button
                        onClick={() => {
                          setStoreMenuOpen(false);
                          navigate('/create-store');
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-blue-600"
                      >
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <div>
                            <div className="font-medium">{t('common.createNewStore')}</div>
                            <div className="text-xs text-gray-500">{t('common.addAnotherStore')}</div>
                          </div>
                        </div>
                      </button>

                      {getCurrentTenantStores().length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          {t('common.noStoresAvailable')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode Toggle: Store ↔ Tenant */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeSwitch('store')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                  sidebarMode === 'store'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BuildingStorefrontIcon className="h-3.5 w-3.5" />
                Store
              </button>
              <button
                onClick={() => handleModeSwitch('tenant')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                  sidebarMode === 'tenant'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BuildingOfficeIcon className="h-3.5 w-3.5" />
                Tenant
              </button>
            </div>
          </div>

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
                    const hasActiveChild = item.children?.some((child) => location.pathname === child.href) ?? false;
                    const isActive = item.active || isCurrentPath(item.href) || hasActiveChild;
                    const isExpanded = expandedMenus.includes(item.name) || hasActiveChild;
                    
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
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
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
                              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                }`}
                            />
                          )}
                        </button>
                        {item.hasDropdown && isExpanded && item.children && (
                          <div className="ml-8 mt-1 space-y-1">
                            {item.children.map((child) => {
                              const isChildActive = location.pathname === child.href;
                              return (
                                <button
                                  key={child.href}
                                  onClick={() => {
                                    navigate(child.href);
                                    setSidebarOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
                                    isChildActive
                                      ? 'text-blue-700 bg-blue-50 font-medium'
                                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                  }`}
                                >
                                  {child.name}
                                </button>
                              );
                            })}
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

          {/* Version Display */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <VersionDisplay
                style="subtle"
                size="sm"
                className="select-none"
              />
            </div>
          </div>
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
                    placeholder={t('common.searchPlaceholder')}
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
                      {t('common.yourProfile')}
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t('common.settings')}
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t('common.signOut')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-8">
          <Outlet />
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
      {storeMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setStoreMenuOpen(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
