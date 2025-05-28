import React from 'react';
import { cn } from '../../utils/cn';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';

// Table Root Component
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table
        ref={ref}
        className={cn('min-w-full divide-y divide-slate-200', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);
Table.displayName = 'Table';

// Table Header Component
interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('bg-slate-50', className)}
      {...props}
    >
      {children}
    </thead>
  )
);
TableHeader.displayName = 'TableHeader';

// Table Body Component
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('bg-white divide-y divide-slate-200', className)}
      {...props}
    >
      {children}
    </tbody>
  )
);
TableBody.displayName = 'TableBody';

// Table Row Component
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, hoverable = true, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        hoverable && 'hover:bg-slate-50 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
);
TableRow.displayName = 'TableRow';

// Table Head Cell Component
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sortDirection, onSort, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider',
        sortable && 'cursor-pointer select-none hover:text-slate-700 transition-colors',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            {sortDirection === null && (
              <div className="flex flex-col">
                <ChevronUpIcon className="h-3 w-3 text-slate-400" />
                <ChevronDownIcon className="h-3 w-3 text-slate-400 -mt-1" />
              </div>
            )}
            {sortDirection === 'asc' && (
              <ArrowUpIcon className="h-4 w-4 text-slate-600" />
            )}
            {sortDirection === 'desc' && (
              <ArrowDownIcon className="h-4 w-4 text-slate-600" />
            )}
          </div>
        )}
      </div>
    </th>
  )
);
TableHead.displayName = 'TableHead';

// Table Cell Component
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('px-6 py-4 whitespace-nowrap text-sm text-slate-900', className)}
      {...props}
    >
      {children}
    </td>
  )
);
TableCell.displayName = 'TableCell';

// Table Caption Component
interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  children: React.ReactNode;
}

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, children, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-slate-500', className)}
      {...props}
    >
      {children}
    </caption>
  )
);
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
