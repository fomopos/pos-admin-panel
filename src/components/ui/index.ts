// UI Components Index
// This file provides a centralized export for all UI components

export { default as Button } from './Button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { default as Input } from './Input';
export { default as DataTable } from './DataTable';
export { default as Pagination } from './Pagination';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from './Table';
export { default as LanguageSwitcher } from './LanguageSwitcher';
export { default as Calendar } from './Calendar';
export { default as TimeSlotPicker } from './TimeSlotPicker';

// New unified components
export { Tabs, TabsList, TabsTrigger, TabsContent, EnhancedTabs } from './Tabs';
export { PageHeader } from './PageHeader';
export { default as PageContainer } from './PageContainer';
export { Alert } from './Alert';
export { ConfirmDialog } from './ConfirmDialog';
export { Modal } from './Modal';
export { Loading } from './Loading';
export { PropertyCheckbox } from './PropertyCheckbox';
export { InputTextField } from './InputTextField';
export { InputTextArea } from './InputTextArea';
export { InputMoneyField } from './InputMoneyField';
export { DropdownSearch } from './DropdownSearch';
export { MultipleDropdownSearch } from './MultipleDropdownSearch';
export { CompactToggle } from './CompactToggle';
export { IconPicker } from './IconPicker';
export { Widget } from './Widget';
export { SearchAndFilter } from './SearchAndFilter';
export { AdvancedSearchFilter } from './AdvancedSearchFilter';
export { Badge } from './Badge';
export { TagsInput } from './TagsInput';
export { default as PermissionGuard, AdminGuard, RoleManagerGuard, UserManagerGuard } from './PermissionGuard';
export { default as VersionDisplay } from './VersionDisplay';
export { default as JsonViewerEditor } from './JsonViewerEditor';
export { default as ResizablePanels } from './ResizablePanels';
export { 
  Typography, 
  H1, 
  H2, 
  H3, 
  H4, 
  H5, 
  H6, 
  Body1, 
  Body2, 
  Subtitle1, 
  Subtitle2, 
  Caption, 
  Overline, 
  Label 
} from './Typography';

// Re-export types
export type { ButtonProps } from './Button';
export type { BadgeProps } from './Badge';
export type { PageContainerProps } from './PageContainer';
export type { TypographyProps, TypographyVariant, TypographyColor, TypographyAlign, TypographyWeight } from './Typography';
export type { Column } from './DataTable';
export type { AdvancedSearchFilterProps, ViewMode, FilterConfig } from './AdvancedSearchFilter';
