import React, { useState } from 'react';
import type { UserRole } from '../../services/types/store.types';
import Button from '../../components/ui/Button';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface RoleListProps {
  roles: UserRole[];
  isLoading: boolean;
  onViewRole: (roleId: string) => void;
  onEditRole: (roleId: string) => void;
  onDeleteRole: (roleId: string) => void;
}

const RoleList: React.FC<RoleListProps> = ({
  roles,
  isLoading,
  onViewRole,
  onEditRole,
  onDeleteRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'admin' | 'manager' | 'staff'>('all');

  const formatRoleName = (roleName: string): string => {
    return roleName.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getRoleTypeBadge = (role: UserRole) => {
    const permissionCount = role.permissions.length;
    
    if (permissionCount >= 20) {
      return { label: 'Admin', color: 'bg-red-100 text-red-800', icon: ShieldCheckIcon };
    } else if (permissionCount >= 10) {
      return { label: 'Manager', color: 'bg-blue-100 text-blue-800', icon: UserGroupIcon };
    } else {
      return { label: 'Staff', color: 'bg-green-100 text-green-800', icon: ClockIcon };
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    
    const roleType = getRoleTypeBadge(role).label.toLowerCase();
    return matchesSearch && roleType === filterBy;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Modern Loading State */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                <div className="flex gap-2 pt-4">
                  <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'admin' | 'manager' | 'staff')}
                className="pl-10 pr-8 py-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Roles Grid */}
      {filteredRoles.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 border border-white/20 text-center">
          <UserGroupIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No roles found</h3>
          <p className="text-slate-500">
            {searchTerm || filterBy !== 'all' 
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first role"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => {
            const badge = getRoleTypeBadge(role);
            const IconComponent = badge.icon;
            
            return (
              <div
                key={role.role_id}
                className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-[1.02] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                      {formatRoleName(role.role_name)}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {role.description || 'No description provided'}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Permissions</span>
                      <span className="font-medium text-slate-700">{role.permissions.length}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => onViewRole(role.role_id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-50/50 hover:bg-blue-100/50 border-blue-200/50 text-blue-600 hover:text-blue-700 transition-all duration-200"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => onEditRole(role.role_id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-200/50 text-emerald-600 hover:text-emerald-700 transition-all duration-200"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => onDeleteRole(role.role_id)}
                      variant="outline"
                      size="sm"
                      className="bg-red-50/50 hover:bg-red-100/50 border-red-200/50 text-red-600 hover:text-red-700 transition-all duration-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { RoleList };
