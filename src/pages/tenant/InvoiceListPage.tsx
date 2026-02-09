/**
 * InvoiceListPage
 *
 * Full paginated list of all invoices with status filtering
 * and links to individual invoice detail pages.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Widget,
  Button,
  Badge,
  Loading,
} from '../../components/ui';
import { billingService } from '../../services/billing/billingService';
import { useError } from '../../hooks/useError';
import type { Invoice, InvoiceStatus } from '../../services/types/billing.types';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const statusConfig: Record<string, { color: 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  paid: { color: 'green', label: 'Paid' },
  open: { color: 'yellow', label: 'Open' },
  void: { color: 'gray', label: 'Void' },
  uncollectible: { color: 'red', label: 'Uncollectible' },
  draft: { color: 'gray', label: 'Draft' },
};

const STATUS_FILTERS: { label: string; value: InvoiceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Open', value: 'open' },
  { label: 'Void', value: 'void' },
  { label: 'Uncollectible', value: 'uncollectible' },
];

const PAGE_SIZE = 10;

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useError();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const result = await billingService.getInvoices(1, 100); // fetch all for client-side filtering
      setInvoices(result.invoices);
      setTotal(result.total);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and paginate client-side
  const filtered = statusFilter === 'all'
    ? invoices
    : invoices.filter((inv) => inv.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageInvoices = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  if (loading) {
    return <Loading title="Loading Invoices" description="Fetching invoice history..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice History"
        description={`${total} invoice${total !== 1 ? 's' : ''} total`}
      >
        <Button variant="outline" onClick={() => navigate('/tenant/billing')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Billing
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <FunnelIcon className="h-4 w-4 text-gray-400" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-60">
                ({invoices.filter((inv) => inv.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <Widget title="" variant="default">
        {pageInvoices.length > 0 ? (
          <div className="space-y-0">
            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-7 gap-4 px-4 py-3 bg-gray-50 rounded-t-lg text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>Invoice</span>
              <span>Date</span>
              <span>Period</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Payment</span>
              <span className="text-right">Actions</span>
            </div>

            {pageInvoices.map((invoice) => {
              const cfg = statusConfig[invoice.status] || statusConfig.draft;
              return (
                <div
                  key={invoice.id}
                  className="grid grid-cols-2 sm:grid-cols-7 gap-2 sm:gap-4 items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/tenant/billing/invoices/${invoice.id}`)}
                >
                  <span className="text-sm font-medium text-gray-900">{invoice.number}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </span>
                  <span className="hidden sm:block text-sm text-gray-400">
                    {new Date(invoice.period_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {' – '}
                    {new Date(invoice.period_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {billingService.formatAmount(invoice.total)}
                  </span>
                  <span>
                    <Badge color={cfg.color} size="sm">{cfg.label}</Badge>
                  </span>
                  <span className="hidden sm:block text-sm text-gray-500">
                    {invoice.payment_method_brand && invoice.payment_method_last4
                      ? `${invoice.payment_method_brand.charAt(0).toUpperCase() + invoice.payment_method_brand.slice(1)} •••• ${invoice.payment_method_last4}`
                      : '—'}
                  </span>
                  <span className="text-right flex justify-end gap-2">
                    {invoice.invoice_pdf_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(invoice.invoice_pdf_url, '_blank');
                        }}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tenant/billing/invoices/${invoice.id}`);
                      }}
                    >
                      View
                    </Button>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {statusFilter === 'all' ? 'No invoices found.' : `No ${statusFilter} invoices found.`}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 px-4 border-t border-gray-100 mt-4">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Widget>
    </div>
  );
};

export default InvoiceListPage;
