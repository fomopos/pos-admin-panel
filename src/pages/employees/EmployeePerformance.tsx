import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { PageHeader, Button, Card } from '../../components/ui';

const EmployeePerformance: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Employee Performance"
        description="Track employee performance metrics and analytics"
      >
        <Button
          variant="outline"
          onClick={() => navigate('/employees')}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>
      </PageHeader>

      <Card className="p-6 text-center">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Performance Analytics
        </h3>
        <p className="text-gray-500 mb-6">
          Performance tracking features will be available soon. This will include sales metrics, productivity reports, and performance reviews.
        </p>
        <Button onClick={() => navigate(`/employees/${id}/edit`)}>
          Edit Employee Details
        </Button>
      </Card>
    </div>
  );
};

export default EmployeePerformance;
