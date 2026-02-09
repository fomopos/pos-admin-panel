/**
 * InvoiceDetailPage
 *
 * Shows full invoice details: header, line items table, tax breakdown,
 * payment method info, and links to PDF / hosted invoice.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageHeader,
  Widget,
  Button,
  Badge,
  Loading,
} from '../../components/ui';
import { billingService } from '../../services/billing/billingService';
import { useError } from '../../hooks/useError';
import type { Invoice } from '../../services/types/billing.types';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

const statusConfig: Record<string, { color: 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  paid: { color: 'green', label: 'Paid' },
  open: { color: 'yellow', label: 'Open' },
  void: { color: 'gray', label: 'Void' },
  uncollectible: { color: 'red', label: 'Uncollectible' },
  draft: { color: 'gray', label: 'Draft' },
};

const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { showError } = useError();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!invoiceId) return;
      try {
        setLoading(true);
        const data = await billingService.getInvoiceById(invoiceId);
        setInvoice(data);
      } catch (error) {
        showError(error);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  if (loading) {
    return <Loading title="Loading Invoice" description="Fetching invoice details..." />;
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice Not Found" description="The requested invoice could not be found.">
          <Button variant="outline" onClick={() => navigate('/tenant/billing/invoices')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </PageHeader>
        <div className="text-center py-16">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">This invoice does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[invoice.status] || statusConfig.draft;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.number}`}
        description={`Created ${new Date(invoice.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}`}
      >
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/tenant/billing/invoices')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            All Invoices
          </Button>
          {invoice.invoice_pdf_url && (
            <Button
              variant="outline"
              onClick={() => window.open(invoice.invoice_pdf_url, '_blank')}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
          {invoice.hosted_invoice_url && (
            <Button
              variant="primary"
              onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
              View on Stripe
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Status" value={<Badge color={status.color} size="md">{status.label}</Badge>} />
        <SummaryCard label="Amount Due" value={billingService.formatAmount(invoice.amount_due)} />
        <SummaryCard label="Amount Paid" value={billingService.formatAmount(invoice.amount_paid)} valueColor="text-green-600" />
        <SummaryCard label="Amount Remaining" value={billingService.formatAmount(invoice.amount_remaining)} valueColor={invoice.amount_remaining > 0 ? 'text-red-600' : 'text-gray-900'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Items */}
        <Widget title="Line Items" icon={DocumentTextIcon} variant="default" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Description</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Qty</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Unit Price</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line) => (
                  <tr key={line.id} className="border-b border-gray-100">
                    <td className="py-3 px-2">
                      <p className="text-gray-900">{line.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(line.period_start).toLocaleDateString()} – {new Date(line.period_end).toLocaleDateString()}
                        {line.proration && <Badge color="yellow" size="sm" className="ml-2">Prorated</Badge>}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-right text-gray-700">{line.quantity}</td>
                    <td className="py-3 px-2 text-right text-gray-700">{billingService.formatAmount(line.unit_amount)}</td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900">{billingService.formatAmount(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-b border-gray-200">
                  <td colSpan={3} className="py-2 px-2 text-right text-gray-500">Subtotal</td>
                  <td className="py-2 px-2 text-right font-medium text-gray-900">{billingService.formatAmount(invoice.subtotal)}</td>
                </tr>
                {invoice.tax > 0 && (
                  <tr className="border-b border-gray-200">
                    <td colSpan={3} className="py-2 px-2 text-right text-gray-500">Tax</td>
                    <td className="py-2 px-2 text-right font-medium text-gray-900">{billingService.formatAmount(invoice.tax)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="py-3 px-2 text-right text-gray-900 font-semibold">Total</td>
                  <td className="py-3 px-2 text-right text-lg font-bold text-gray-900">{billingService.formatAmount(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Widget>

        {/* Invoice Details Sidebar */}
        <div className="space-y-6">
          <Widget title="Invoice Details" icon={DocumentTextIcon} variant="default">
            <div className="space-y-3">
              <DetailRow label="Invoice #" value={invoice.number} />
              <DetailRow label="Invoice Date" value={new Date(invoice.created_at).toLocaleDateString()} />
              {invoice.due_date && (
                <DetailRow label="Due Date" value={new Date(invoice.due_date).toLocaleDateString()} />
              )}
              {invoice.paid_at && (
                <DetailRow label="Paid On" value={new Date(invoice.paid_at).toLocaleDateString()} />
              )}
              <DetailRow label="Currency" value={invoice.currency.toUpperCase()} />
              <DetailRow
                label="Billing Period"
                value={`${new Date(invoice.period_start).toLocaleDateString()} – ${new Date(invoice.period_end).toLocaleDateString()}`}
              />
              <DetailRow label="Billing Reason" value={invoice.billing_reason.replace(/_/g, ' ')} />
              <DetailRow label="Attempts" value={String(invoice.attempt_count)} />
            </div>
          </Widget>

          {/* Payment Method */}
          {(invoice.payment_method_brand || invoice.payment_method_last4) && (
            <Widget title="Payment Method" icon={CreditCardIcon} variant="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-white text-xs font-bold">
                  {invoice.payment_method_brand?.slice(0, 2).toUpperCase() ?? '??'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {invoice.payment_method_brand
                      ? invoice.payment_method_brand.charAt(0).toUpperCase() + invoice.payment_method_brand.slice(1)
                      : 'Card'}{' '}
                    •••• {invoice.payment_method_last4}
                  </p>
                </div>
              </div>
            </Widget>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const SummaryCard: React.FC<{ label: string; value: React.ReactNode; valueColor?: string }> = ({
  label,
  value,
  valueColor = 'text-gray-900',
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
    <div className={`mt-1 text-lg font-bold ${valueColor}`}>{value}</div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900 capitalize">{value}</span>
  </div>
);

export default InvoiceDetailPage;
