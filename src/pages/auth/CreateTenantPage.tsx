import React from 'react';
import CreateTenantForm from './CreateTenantForm';

const CreateTenantPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-2xl mx-auto">
        <CreateTenantForm />
      </div>
    </div>
  );
};

export default CreateTenantPage;
