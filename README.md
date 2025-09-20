# POS Admin Panel

A multi-tenant, multi-language Point of Sale (POS) admin panel built with React, Vite, and modern web technologies.

## 🚀 Features

### 🔐 Authentication
- **AWS Cognito Integration**: Complete authentication system with sign-in, sign-up, email verification, and password reset
- **Protected Routes**: All admin routes are protected with authentication guards
- **User Management**: Display logged-in user details in the navbar

### 🏢 Multi-Tenant Support
- **Tenant Management**: Users can belong to one or more tenants (organizations/stores)
- **Tenant Context**: React Context/Zustand for tenant state management
- **Tenant Switcher**: Dropdown in navbar to switch between tenants
- **Scoped Data**: All API calls are scoped to the selected tenant

### 🌐 Multi-Language Support
- **react-i18next**: Complete internationalization setup
- **Dynamic Translations**: Fetch translations via API endpoints
- **Language Switcher**: Navbar component to change languages
- **Persistent Language**: Selected language stored in localStorage
- **Supported Languages**: English (en) and Spanish (es)

### 🎨 Modern UI/UX Design System
- **Tailwind CSS**: Utility-first CSS framework with consistent design tokens
- **Responsive Design**: Fully responsive layout for all screen sizes
- **Modern Components**: Reusable UI components (Button, Card, Input, etc.)
- **Clean Layout**: Professional dashboard layout with sidebar navigation
- **Design Consistency**: Unified design system applied across all pages
- **Color Palette**: Consistent slate color scheme (slate-900, slate-500, slate-200)
- **Typography**: Hierarchical text styling with consistent font weights and sizes
- **Card Design**: Modern cards with rounded-2xl borders, subtle shadows, and hover effects
- **Interactive Elements**: Smooth transitions and hover states throughout the interface

### 📊 Complete Dashboard Features
- **Analytics Dashboard**: Comprehensive summary stats cards and interactive charts
- **ApexCharts Integration**: Interactive charts for sales trends and analytics
- **Recent Transactions**: Real-time transaction monitoring with detailed views

### 🛍️ Product & Inventory Management
- **Product Management**: Complete CRUD operations with advanced filtering and search
  - Product catalog with inventory tracking
  - Category-based organization
  - SKU management and pricing controls
  - Image upload and product descriptions
  - Stock level monitoring with low-stock alerts
  - Advanced product search and filtering
- **Category Management**: Organize products with color-coded categories
  - Visual category cards with custom colors
  - Product count tracking per category
  - Category status management (active/inactive)
  - Category hierarchy and organization

### 💰 Sales & Financial Management
- **Sales Tracking**: Comprehensive sales management and reporting
  - Sales transaction history with detailed views
  - Payment method tracking and status monitoring
  - Receipt generation and printing capabilities
  - Revenue analytics with filtering options
- **Payment Settings**: Complete payment configuration system
  - Multiple tender types (cash, credit card, debit card, gift card)
  - Currency support (USD, EUR, GBP, AED, INR, JPY, CAD, AUD, CHF, CNY)
  - Payment availability settings (sales, returns)
  - Over-tender allowance configuration
- **Tax Management**: Comprehensive tax configuration system
  - Tax authorities management with rates and rounding rules
  - Tax groups for product categorization
  - Tax location settings for store-specific rates
  - Automated tax calculations and reporting

### 👥 Customer & User Management
- **Customer Management**: Complete customer database with CRM features
  - Customer profiles with contact information
  - Purchase history and spending analytics
  - Customer status management
  - Address and demographic information

### ⚙️ Comprehensive Store Settings System
- **Store Information Management**:
  - Business details, registration numbers, tax identification
  - Complete address and contact information
  - Business hours configuration for each day of the week
  - Logo and branding settings
- **Regional & Localization Settings**:
  - Multi-currency support with symbol positioning
  - Timezone configuration and date/time formats
  - Number formatting (decimal places, separators)
  - Tax-inclusive pricing options
- **Receipt Configuration**:
  - Custom header and footer text
  - Receipt content options (logo, barcode, QR code)
  - Paper size selection (thermal 58mm/80mm, A4, letter)
  - Print settings and copy configuration
  - Dynamic custom fields management
- **Hardware Configuration**:
  - Barcode scanner settings with prefix/suffix validation
  - Receipt printer configuration (USB/Network/Bluetooth)
  - Cash drawer automation and trigger events
  - Customer display and scale integration
  - Network printer IP and port settings
- **Operational Settings**:
  - Inventory alerts with stock thresholds
  - Comprehensive return policy configuration
  - Discount settings with approval workflows
  - Transaction limits and approval requirements
- **User Management & Security**:
  - Role-based access control with permissions
  - Password policy enforcement
  - Session management and timeout settings
  - Auto-logout functionality
- **Integration Settings**:
  - Payment processor configuration and test modes
  - Accounting software integration (QuickBooks, Xero, Sage, Zoho)
  - E-commerce platform sync (inventory, customers, orders)
  - Email service configuration with SMTP settings
- **Security & Compliance**:
  - Automated data backup scheduling
  - Comprehensive audit logging with event selection
  - Compliance features (PCI, GDPR, data encryption)
  - Security policies (failed login limits, 2FA, IP whitelist)

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **Charts**: ApexCharts for data visualization
- **Authentication**: AWS Cognito
- **Internationalization**: react-i18next
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Heroicons with consistent styling

## 📁 Project Structure

```
src/
├── auth/               # AWS Cognito setup and authentication
│   ├── config.ts       # Cognito configuration
│   └── authService.ts  # Authentication service methods
├── tenants/            # Multi-tenant functionality
│   └── tenantStore.ts  # Zustand store for tenant management
├── i18n/               # Internationalization setup
│   └── index.ts        # i18next configuration with API fetching
├── components/         # Reusable UI components
│   └── ui/             # Base UI components (Button, Card, Input)
├── layouts/            # Layout components
│   └── DashboardLayout.tsx # Main dashboard layout
├── pages/              # Route-based page components
│   ├── auth/           # Authentication pages
│   ├── Dashboard.tsx   # Main analytics dashboard
│   ├── Products.tsx    # Product management with inventory
│   ├── Categories.tsx  # Category management system
│   ├── Sales.tsx       # Sales tracking and analytics
│   ├── Customers.tsx   # Customer relationship management
│   └── StoreSettings.tsx # Comprehensive store configuration system
├── routes/             # Route protection logic
│   └── ProtectedRoute.tsx # Authentication guard
├── services/           # API and service utilities
├── utils/              # Utility functions
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## 🎨 Design System

### Visual Consistency
All pages follow a unified design system with:

- **Headers**: Consistent typography (text-3xl font-bold text-slate-900) with descriptive subtitles
- **Stats Cards**: Modern cards with colored icon backgrounds and hover effects
- **Tables**: Clean table design with proper spacing, hover states, and responsive layouts
- **Modals**: Consistent modal design with backdrop blur and proper spacing
- **Buttons**: Unified button styling with proper states and transitions
- **Forms**: Consistent form styling with validation states and error handling

### Color Scheme
- **Primary Text**: slate-900 for headings and important content
- **Secondary Text**: slate-500 for descriptions and metadata
- **Borders**: slate-200 for subtle divisions and card borders
- **Backgrounds**: White cards with subtle shadows for depth
- **Accent Colors**: Blue, green, yellow, purple, and red for status indicators and icons

### Interactive Elements
- **Hover Effects**: Subtle shadow increases and color transitions
- **Loading States**: Consistent spinner design across all pages
- **Status Badges**: Color-coded badges for different states (active, inactive, pending, etc.)
- **Action Buttons**: Icon-based actions with consistent hover states

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos-admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS Cognito**
   
   Update `src/auth/config.ts` with your AWS Cognito settings:
   ```typescript
   export const cognitoConfig = {
     region: 'your-aws-region',
     userPoolId: 'your-user-pool-id',
     userPoolWebClientId: 'your-client-id',
   };
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### AWS Cognito Setup

1. **Create a User Pool** in AWS Cognito
2. **Configure App Client** with appropriate settings
3. **Update configuration** in `src/auth/config.ts`
4. **Set up hosted UI** (optional) for additional authentication flows

### Translation API

The application expects translation endpoints at:
- `GET /api/translations/en` - English translations
- `GET /api/translations/es` - Spanish translations

Example response format:
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalSales": "Total Sales"
  }
}
```

### Tenant API

Multi-tenant data should be scoped using tenant ID:
- `GET /api/tenants/{tenantId}/products`
- `GET /api/tenants/{tenantId}/sales`
- `GET /api/tenants/{tenantId}/customers`
- `GET /api/tenants/{tenantId}/categories`

## 🎯 Usage

### Authentication Flow

1. **Sign In**: Users authenticate via AWS Cognito
2. **Route Protection**: Unauthenticated users are redirected to sign-in
3. **User Context**: Authenticated user info is available throughout the app

### Multi-Tenant Workflow

1. **Tenant Selection**: Users select their active tenant from the navbar dropdown
2. **Data Scoping**: All API calls include the selected tenant ID
3. **Context Management**: Tenant state is managed globally via Zustand

### Language Switching

1. **Language Selector**: Users can change language via navbar dropdown
2. **Dynamic Loading**: Translations are fetched from API when language changes
3. **Persistence**: Selected language is saved to localStorage

### Feature Management

#### Product Management
1. **View Products**: Browse all products in a modern, responsive table
2. **Add Product**: Use the comprehensive modal form to add new products with images
3. **Edit Product**: Click edit icon to modify existing products
4. **Delete Product**: Remove products with confirmation dialog
5. **Filter & Search**: Advanced filtering by category, status, and search terms
6. **Inventory Tracking**: Monitor stock levels with low-stock alerts

#### Category Management
1. **Visual Categories**: Browse categories in a modern card-based layout
2. **Color Coding**: Assign custom colors to categories for visual organization
3. **Product Tracking**: View product count per category
4. **Status Management**: Enable/disable categories as needed

#### Sales Management
1. **Transaction History**: View all sales with detailed information
2. **Sales Analytics**: Monitor revenue, transaction counts, and trends
3. **Receipt Management**: View and print receipts for transactions
4. **Payment Tracking**: Monitor different payment methods and statuses
5. **Customer Integration**: Link sales to customer profiles

#### Customer Management
1. **Customer Database**: Comprehensive customer profiles with contact information
2. **Purchase History**: Track customer spending and purchase patterns
3. **Analytics**: View customer lifetime value and purchase frequency
4. **Status Management**: Manage active/inactive customer accounts

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **Components**: Add reusable components to `src/components/`
2. **Pages**: Create new pages in `src/pages/` following the established design patterns
3. **Routes**: Update routing in `src/App.tsx`
4. **Translations**: Add new translation keys to the API responses

### Design System Guidelines

#### Styling Guidelines
- Use Tailwind CSS utility classes consistently
- Follow the established component patterns and design tokens
- Maintain responsive design principles across all screen sizes
- Use the consistent color scheme (slate palette) throughout
- Apply proper spacing using the established scale (space-y-8, p-6, etc.)

#### Component Patterns
- **Cards**: Use `rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow`
- **Headers**: Use `text-3xl font-bold text-slate-900` for main headings
- **Stats Cards**: Include colored icon backgrounds with proper spacing
- **Tables**: Implement hover states and proper cell padding
- **Modals**: Use backdrop blur with consistent padding and spacing

#### Interactive States
- **Hover Effects**: Subtle transitions for better user experience
- **Loading States**: Consistent spinner design across all pages
- **Error States**: Proper error handling with user-friendly messages
- **Empty States**: Informative empty states with clear call-to-actions

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_BASE_URL=https://api.yourapp.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the established design system and component patterns
- Ensure responsive design across all screen sizes
- Maintain consistent styling using the Tailwind CSS utility classes
- Add proper TypeScript types for all new features
- Include proper error handling and loading states
- Test multi-tenant functionality with different tenant contexts

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [Issues](../../issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## 🔮 Roadmap

- [x] ~~Complete implementation of Categories page~~ ✅ **Completed**
- [x] ~~Add Sales analytics and reporting~~ ✅ **Completed**
- [x] ~~Implement Customer management features~~ ✅ **Completed**
- [x] ~~Apply consistent design system across all pages~~ ✅ **Completed**
- [x] ~~Complete Store Settings system with all 8 configuration tabs~~ ✅ **Completed**
- [ ] Implement real-time notifications
- [ ] Add data export functionality (CSV, PDF reports)
- [ ] Mobile app companion
- [ ] Advanced reporting and analytics with date ranges
- [ ] Integration with payment processors
- [ ] Advanced inventory management features
- [ ] Barcode scanning capabilities
- [ ] Multi-location support
- [ ] Role-based access control
- [ ] Automated backup and data sync

---

Built with ❤️ using React, TypeScript, and modern web technologies.
# Pre-push hook test
