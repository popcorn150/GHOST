# 🎮 Ghost Frontend - Gaming Account Marketplace

> **Modern React.js frontend for Ghost marketplace with seamless email notification integration**

A responsive, feature-rich frontend application for the Ghost gaming account marketplace, built with React.js and integrated with Postmark email notifications for enhanced user communication and engagement.

## 🚀 Live Production

- **Live Application**: [https://www.ghostplay.store](https://www.ghostplay.store)
- **Status**: Production deployment serving real users
- **Performance**: Optimized for mobile and desktop
- **Uptime**: 99.9% availability with CDN acceleration

---

## ✨ Core Features

### 🎯 **User Experience**
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Real-time Updates**: Live notifications and status updates
- **Intuitive Navigation**: Clean, gaming-focused UI/UX
- **Fast Loading**: Optimized images and lazy loading
- **Search & Filters**: Advanced account discovery tools

### 📧 **Email Integration Frontend**
- **Email Preferences**: User notification settings management
- **Email Status Tracking**: Real-time delivery confirmations
- **Notification History**: View past email communications
- **Unsubscribe Management**: One-click preference updates
- **Email Templates Preview**: User-friendly email previews

### 🛍️ **Marketplace Features**
- **Account Listings**: Browse gaming accounts with detailed info
- **Purchase Flow**: Streamlined buying experience with escrow
- **Seller Dashboard**: Account management and analytics
- **User Profiles**: Reputation system and transaction history
- **Wishlist & Favorites**: Save accounts for later

### 🔐 **Security & Authentication**
- **Firebase Authentication**: Secure login with multiple providers
- **Profile Management**: Secure account settings and preferences
- **Two-Factor Authentication**: Optional 2FA setup
- **Session Management**: Automatic logout and security alerts
- **Privacy Controls**: Data management and export options

---

## 🛠 Technical Stack

### **Frontend Technologies**
- **React.js 18**: Modern React with hooks and context
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **React Query**: Server state management
- **Firebase SDK**: Authentication and real-time data

### **Development Tools**
- **Vite**: Fast build tool and dev server
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality control
- **Jest & React Testing Library**: Unit and integration testing

---

## 🔧 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (Button, Modal, etc.)
│   ├── forms/           # Form components with validation
│   ├── layout/          # Layout components (Header, Footer, etc.)
│   └── ui/              # UI-specific components
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── marketplace/     # Marketplace browsing
│   ├── dashboard/       # User dashboard
│   ├── account/         # Account management
│   └── settings/        # User settings and preferences
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication hook
│   ├── useApi.js        # API communication hook
│   └── useEmail.js      # Email notification hook
├── services/            # API and external service integrations
│   ├── api.js           # Backend API client
│   ├── firebase.js      # Firebase configuration
│   └── email.js         # Email service integration
├── context/             # React context providers
│   ├── AuthContext.js   # Authentication state
│   ├── UIContext.js     # UI state management
│   └── EmailContext.js  # Email notification state
├── utils/               # Utility functions
│   ├── formatters.js    # Data formatting utilities
│   ├── validators.js    # Form validation
│   └── constants.js     # Application constants
└── assets/              # Static assets
    ├── images/          # Images and icons
    ├── fonts/           # Custom fonts
    └── styles/          # Global styles
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager
- Firebase project setup
- Backend API running

### **Installation**

```bash
# Clone repository
git clone https://github.com/popcorn150/GHOST.git
cd GHOST

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### **Environment Configuration**

```bash
# API Configuration
VITE_API_BASE_URL=https://api.ghostplay.store
VITE_APP_ENV=production

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=ghost-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ghost-production
VITE_FIREBASE_STORAGE_BUCKET=ghost-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Email Service Integration
VITE_POSTMARK_SERVER_TOKEN=your_postmark_token
VITE_EMAIL_FROM_ADDRESS=noreply@ghostplay.store

# Application Settings
VITE_APP_NAME=Ghost Marketplace
VITE_APP_VERSION=1.0.0
VITE_SUPPORT_EMAIL=support@ghostplay.store

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_LIVE_CHAT=true

# Payment Integration
VITE_PAYMENT_PUBLIC_KEY=your_payment_public_key

# Social Media & SEO
VITE_SITE_URL=https://www.ghostplay.store
VITE_SOCIAL_TWITTER=@ghostplaystore
VITE_SOCIAL_DISCORD=discord_invite_link
```

### **Development Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Type checking
npm run type-check

# Analyze bundle size
npm run analyze
```

---

## 📧 Email Integration Features

### **Email Service Integration**

```javascript
// Email service hook
import { useEmail } from '../hooks/useEmail';

const EmailNotificationSettings = () => {
  const { 
    preferences, 
    updatePreferences, 
    unsubscribe,
    emailHistory 
  } = useEmail();

  return (
    <div className="email-settings">
      <h3>Email Notifications</h3>
      
      {/* Notification Preferences */}
      <div className="preference-toggles">
        <label>
          <input 
            type="checkbox"
            checked={preferences.purchaseNotifications}
            onChange={(e) => updatePreferences({
              purchaseNotifications: e.target.checked
            })}
          />
          Purchase Confirmations
        </label>
        
        <label>
          <input 
            type="checkbox"
            checked={preferences.newAccountAlerts}
            onChange={(e) => updatePreferences({
              newAccountAlerts: e.target.checked
            })}
          />
          New Account Alerts
        </label>
      </div>

      {/* Email History */}
      <div className="email-history">
        <h4>Recent Emails</h4>
        {emailHistory.map(email => (
          <div key={email.id} className="email-item">
            <span className="subject">{email.subject}</span>
            <span className="status">{email.status}</span>
            <span className="date">{email.sentAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **Email Preference Management**

```javascript
// Email preferences service
class EmailPreferencesService {
  static async updatePreferences(userId, preferences) {
    const response = await api.put(`/users/${userId}/email-preferences`, {
      purchaseNotifications: preferences.purchaseNotifications,
      newAccountAlerts: preferences.newAccountAlerts,
      weeklyReports: preferences.weeklyReports,
      securityAlerts: preferences.securityAlerts,
      marketingEmails: preferences.marketingEmails
    });
    
    return response.data;
  }

  static async unsubscribe(userId, emailType) {
    return await api.post(`/email/unsubscribe`, {
      userId,
      emailType
    });
  }

  static async getEmailHistory(userId) {
    const response = await api.get(`/users/${userId}/email-history`);
    return response.data;
  }
}
```

---

## 🎨 UI Components

### **Key Components**

#### Account Card Component
```javascript
const AccountCard = ({ account, onPurchase, onWishlist }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={account.imageUrl} 
          alt={account.title}
          className="w-full h-48 object-cover rounded-md"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
            {account.platform}
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {account.title}
        </h3>
        <p className="text-gray-600 mt-1">
          Level {account.level} • {account.region}
        </p>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-green-600">
            ₦{account.price.toLocaleString()}
          </span>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onWishlist(account.id)}
              className="p-2 text-gray-500 hover:text-red-500"
            >
              <HeartIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onPurchase(account.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### Email Status Indicator
```javascript
const EmailStatusIndicator = ({ emailId, status }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'text-green-600';
      case 'opened': return 'text-blue-600';
      case 'clicked': return 'text-purple-600';
      case 'bounced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${getStatusColor(status)}`}>
      <div className={`w-2 h-2 rounded-full bg-current`} />
      <span className="text-sm capitalize">{status}</span>
    </div>
  );
};
```

---

## 🔒 Security Features

### **Frontend Security**
- **Environment Variables**: Secure configuration management
- **API Token Management**: Secure token storage and rotation
- **Input Validation**: Client-side validation with server verification
- **XSS Protection**: Content sanitization and CSP headers
- **HTTPS Enforcement**: All communications encrypted

### **Authentication Flow**
- **Firebase Auth**: Secure authentication with multiple providers
- **Token Refresh**: Automatic token management
- **Route Protection**: Private route guards
- **Session Monitoring**: Automatic logout on suspicious activity

---

## 📱 Responsive Design

### **Mobile Optimization**
- **Touch-friendly Interface**: Large buttons and easy navigation
- **Responsive Images**: Optimized for different screen sizes
- **Fast Loading**: Compressed assets and lazy loading
- **Offline Support**: Service worker for basic offline functionality

### **Desktop Features**
- **Multi-column Layouts**: Efficient use of screen space
- **Keyboard Shortcuts**: Power user navigation
- **Advanced Filters**: Comprehensive search and sorting
- **Bulk Operations**: Multiple account management

---

## 📊 Performance Optimization

### **Build Optimization**
- **Code Splitting**: Lazy loading for route-based chunks
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image compression and format selection
- **Bundle Analysis**: Regular bundle size monitoring

### **Runtime Performance**
- **React.memo**: Component memoization for expensive renders
- **useMemo/useCallback**: Hook optimization for performance
- **Virtual Scrolling**: Efficient large list rendering
- **Image Lazy Loading**: Progressive image loading

---



### **Environment Setup**
- **CDN Configuration**: Asset delivery optimization
- **DNS Configuration**: Custom domain setup
- **SSL Certificate**: HTTPS enforcement
- **Monitoring**: Error tracking and analytics

---

## 🧪 Testing

### **Testing Strategy**
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: User flow and API integration testing
- **E2E Tests**: Complete user journey validation
- **Visual Regression**: UI consistency checks

### **Test Commands**

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Visual regression tests
npm run test:visual
```

---

## 📈 Analytics & Monitoring

### **User Analytics**
- **Page Views**: Track popular sections and user journeys
- **Conversion Funnel**: Monitor purchase completion rates
- **User Engagement**: Email open rates and click tracking
- **Performance Metrics**: Load times and user experience

### **Error Monitoring**
- **Crash Reporting**: Automatic error capture and reporting
- **Performance Monitoring**: Real-time performance metrics
- **User Feedback**: Built-in feedback collection system

---

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

---

## 📞 Support & Contact

- **Live Application**: [https://www.ghostplay.store](https://www.ghostplay.store)
- **API Documentation**: [Backend Repository](https://github.com/GHOST-INCORPORATED/ghost-backend)
- **Issue Tracking**: GitHub Issues
- **Email Support**: support@ghostplay.store

---

**Built with ❤️ for the gaming community**

*Ghost Frontend delivers a seamless marketplace experience with intelligent email notifications powered by Postmark, connecting gamers worldwide through secure, efficient account trading.*
