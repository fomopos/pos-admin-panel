import React, { useState, useEffect } from 'react';
import {
  Widget,
  Button,
  Badge,
  Modal,
  InputTextField,
  DropdownSearch,
  ConfirmDialog,
  Loading,
  SearchAndFilter,
} from '../ui';
import { useTenantRole } from '../../hooks/useTenantRole';
import { useError } from '../../hooks/useError';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { tenantUserService } from '../../services/tenant-dashboard/tenantDashboardService';
import type { TenantUser, TenantRole, InviteUserRequest } from '../../services/types/tenant-dashboard.types';
import {
  UserGroupIcon,
  PlusIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserMinusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const roleOptions = [
  { id: 'owner', label: 'Owner', description: 'Full access — billing, users, stores, settings' },
  { id: 'admin', label: 'Admin', description: 'Users + stores + settings (read-only billing)' },
  { id: 'staff', label: 'Staff', description: 'No tenant dashboard access' },
  { id: 'viewer', label: 'Viewer', description: 'No tenant dashboard access' },
];

const roleColorMap: Record<string, 'purple' | 'blue' | 'green' | 'gray'> = {
  owner: 'purple',
  admin: 'blue',
  staff: 'green',
  viewer: 'gray',
};

const statusColorMap: Record<string, 'green' | 'yellow' | 'gray'> = {
  active: 'green',
  invited: 'yellow',
  deactivated: 'gray',
};

const UserManagement: React.FC = () => {
  const { can, isOwner } = useTenantRole();
  const { showError, showInfo } = useError();
  const confirmDialog = useConfirmDialog();

  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteUserRequest>({ email: '', role: 'staff' });
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});
  const [inviting, setInviting] = useState(false);

  // Role edit state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<TenantRole>('staff');
  const [updatingRole, setUpdatingRole] = useState(false);

  const canManageUsers = can('canManageUsers');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await tenantUserService.getUsers();
      setUsers(data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // ── Invite User ─────────────────────────────────────────────────────

  const validateInviteForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!inviteForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (users.some((u) => u.email.toLowerCase() === inviteForm.email.toLowerCase())) {
      errors.email = 'This user is already a member of this tenant';
    }
    setInviteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInviteUser = async () => {
    if (!validateInviteForm()) return;

    try {
      setInviting(true);
      const newUser = await tenantUserService.inviteUser(inviteForm);
      setUsers((prev) => [...prev, newUser]);
      setInviteModalOpen(false);
      setInviteForm({ email: '', role: 'staff' });
      setInviteErrors({});
      showInfo(`Invitation sent to ${inviteForm.email}`);
    } catch (error) {
      showError(error);
    } finally {
      setInviting(false);
    }
  };

  // ── Update Role ─────────────────────────────────────────────────────

  const handleStartRoleEdit = (user: TenantUser) => {
    setEditingUserId(user.id);
    setEditingRole(user.role);
  };

  const handleSaveRoleChange = async (userId: string) => {
    try {
      setUpdatingRole(true);
      const updatedUser = await tenantUserService.updateUserRole(userId, { role: editingRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updatedUser.role } : u)));
      setEditingUserId(null);
      showInfo('User role updated successfully');
    } catch (error) {
      showError(error);
    } finally {
      setUpdatingRole(false);
    }
  };

  // ── Remove User ─────────────────────────────────────────────────────

  const handleRemoveUser = (user: TenantUser) => {
    confirmDialog.openDialog(
      async () => {
        try {
          await tenantUserService.removeUser(user.id);
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
          showInfo(`${user.name} has been removed from the tenant`);
        } catch (error) {
          showError(error);
        }
      },
      {
        title: 'Remove User',
        message: `Are you sure you want to remove "${user.name}" (${user.email}) from this tenant? They will lose access to all tenant resources.`,
        variant: 'danger',
        confirmText: 'Remove User',
      }
    );
  };

  // ── Resend Invite ───────────────────────────────────────────────────

  const handleResendInvite = async (user: TenantUser) => {
    try {
      await tenantUserService.resendInvite(user.id);
      showInfo(`Invitation resent to ${user.email}`);
    } catch (error) {
      showError(error);
    }
  };

  if (loading) {
    return <Loading title="Loading Users" description="Fetching tenant members..." />;
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search users by name or email..."
        filterValue={roleFilter}
        onFilterChange={setRoleFilter}
        filterOptions={roleOptions.map((r) => ({ id: r.id, label: r.label }))}
        filterPlaceholder="All Roles"
        actions={
          canManageUsers ? (
            <Button variant="primary" className="h-12" onClick={() => setInviteModalOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          ) : undefined
        }
      />

      {/* Users List */}
      <Widget
        title={`Team Members (${filteredUsers.length})`}
        description="Users with access to this tenant"
        icon={UserGroupIcon}
      >
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {users.length === 0 ? 'No team members yet. Invite your first user.' : 'No users match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              const isCurrentUserOwner = user.role === 'owner';

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h4>
                        <Badge color={roleColorMap[user.role] || 'gray'} size="sm">
                          {user.role}
                        </Badge>
                        <Badge color={statusColorMap[user.status] || 'gray'} size="sm">
                          {user.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      {user.status === 'invited' && user.invited_at && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                          <ClockIcon className="h-3 w-3" />
                          Invited {new Date(user.invited_at).toLocaleDateString()}
                        </p>
                      )}
                      {user.last_login && user.status === 'active' && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Last login: {new Date(user.last_login).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {canManageUsers && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <DropdownSearch
                            label=""
                            value={editingRole}
                            options={roleOptions}
                            onSelect={(option) => setEditingRole((option?.id as TenantRole) || 'staff')}
                            placeholder="Select role"
                            buttonClassName="py-1 text-xs min-w-[120px]"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveRoleChange(user.id)}
                            isLoading={updatingRole}
                            disabled={updatingRole || editingRole === user.role}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUserId(null)}
                            disabled={updatingRole}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          {user.status === 'invited' && (
                            <Button variant="ghost" size="sm" onClick={() => handleResendInvite(user)}>
                              <ArrowPathIcon className="h-4 w-4 mr-1" />
                              Resend
                            </Button>
                          )}
                          {/* Don't allow changing owner role unless current user is also owner */}
                          {(!isCurrentUserOwner || isOwner) && user.status !== 'invited' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartRoleEdit(user)}
                            >
                              <ShieldCheckIcon className="h-4 w-4 mr-1" />
                              Change Role
                            </Button>
                          )}
                          {!isCurrentUserOwner && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveUser(user)}
                            >
                              <UserMinusIcon className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Widget>

      {/* Invite User Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false);
          setInviteForm({ email: '', role: 'staff' });
          setInviteErrors({});
        }}
        title="Invite User"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setInviteModalOpen(false);
                setInviteForm({ email: '', role: 'staff' });
                setInviteErrors({});
              }}
              disabled={inviting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInviteUser}
              isLoading={inviting}
              disabled={inviting}
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <InputTextField
            label="Email Address"
            required
            value={inviteForm.email}
            onChange={(value) => {
              setInviteForm((prev) => ({ ...prev, email: value }));
              if (inviteErrors.email) setInviteErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="colleague@company.com"
            error={inviteErrors.email}
          />
          <DropdownSearch
            label="Role"
            value={inviteForm.role}
            options={roleOptions}
            onSelect={(option) => setInviteForm((prev) => ({ ...prev, role: (option?.id as TenantRole) || 'staff' }))}
            placeholder="Select role"
            required
          />
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Role Permissions:</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li><strong>Owner:</strong> Full access — billing, users, stores, settings</li>
              <li><strong>Admin:</strong> Users + stores + settings (read-only billing)</li>
              <li><strong>Staff:</strong> No tenant dashboard access</li>
              <li><strong>Viewer:</strong> No tenant dashboard access</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.dialogState.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.dialogState.title}
        message={confirmDialog.dialogState.message}
        confirmText={confirmDialog.dialogState.confirmText}
        cancelText={confirmDialog.dialogState.cancelText}
        variant={confirmDialog.dialogState.variant}
        isLoading={confirmDialog.dialogState.isLoading}
      />
    </div>
  );
};

export default UserManagement;
