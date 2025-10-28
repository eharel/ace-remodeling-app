# ACE Remodeling App

## Project Title & Purpose

The **ACE Remodeling App** is a custom business application designed specifically for Project Managers to use during client meetings and site visits. This iPad-optimized app helps PMs showcase completed projects, manage client information, and demonstrate the company's capabilities when meeting with potential leads.

**Primary Use Case**: Project Managers use this app on iPads during client consultations to:

- Showcase completed bathroom and kitchen renovations
- Search and filter projects by various criteria
- Present before/after photos and project details
- Demonstrate the company's expertise and quality of work
- Build trust and confidence with potential clients

## Features & Functionality

### Core Features

#### **Project Showcase**

- **Bathroom Projects**: Dedicated gallery of completed bathroom renovations
- **Kitchen Projects**: Comprehensive kitchen remodel portfolio
- **Project Details**: Full project information including descriptions, costs, and timelines
- **Before/After Photos**: Visual comparison of completed work
- **Client Information**: Project location, client details, and contact information

#### **Advanced Search**

- **Multi-field Search**: Search across project names, descriptions, locations, client names, and tags
- **Tokenized Search**: Find projects using multiple keywords (e.g., "bathroom henry" finds projects with both terms)
- **Real-time Results**: Instant search with debounced input for smooth performance
- **Accessibility**: Full screen reader support for all search functionality

#### **Project Management**

- **Project Status Tracking**: Planning, In Progress, Completed, On Hold
- **Project Categories**: Bathroom, Kitchen, General Remodeling, Outdoor, Basement, Attic
- **Document Management**: Contracts, permits, invoices, warranties, and manuals
- **Project Logs**: Milestones, updates, issues, and completion notes
- **Cost Tracking**: Estimated vs. actual project costs

#### **User Interface**

- **iPad Optimized**: Designed specifically for tablet use during client meetings
- **Professional Design**: Clean, modern interface that reflects company quality
- **Theme Support**: Light, dark, and blue themes for different preferences
- **Responsive Layout**: Adapts to different screen sizes and orientations
- **Touch-Friendly**: Large buttons and intuitive navigation

## User Guide

### Main Workflows for Project Managers

#### **1. Client Meeting Preparation**

1. Open the app on your iPad
2. Navigate to the **Home** tab to see the company branding
3. Use the **Portfolio** tab to browse projects by category
4. Use the **Search** tab to find relevant projects for the client's needs
5. Review project details and photos before the meeting

#### **2. During Client Meetings**

1. **Showcasing Work**: Navigate to **Portfolio** tab to show projects by category (Bathroom, Kitchen, Outdoor, etc.)
2. **Project Details**: Tap any project to view full details, photos, and client information
3. **Search Functionality**: Use the search feature to quickly find projects matching client requirements
4. **Meeting Checklist**: Use the floating checklist button to track meeting progress
5. **Professional Presentation**: The clean interface helps maintain a professional appearance

#### **3. Project Information Access**

- **Project Cards**: Show project name, brief description, and status
- **Detailed Views**: Access full project information including:
  - Complete project descriptions
  - Before/after photo galleries
  - Client information and location
  - Project timeline and costs
  - Related documents and logs

### Navigation Structure

#### **Tab Navigation**

- **Home**: Company branding and service overview
- **Portfolio**: Browse projects by category (Bathroom, Kitchen, Outdoor, etc.)
- **Search**: Advanced search functionality across all projects
- **Settings**: App preferences and theme selection

#### **Search Best Practices**

- Use specific keywords: "master bathroom", "kitchen island", "quartz countertops"
- Search by location: "Austin", "Northwest", "78750"
- Search by client name: "Chen", "Johnson"
- Combine terms: "bathroom renovation austin"

## Technical Overview

### Architecture

#### **Framework & Technologies**

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and deployment system
- **TypeScript**: Type-safe development
- **Expo Router**: File-based navigation system
- **React Navigation**: Tab and stack navigation

#### **Key Dependencies**

- **@expo/vector-icons**: Material Design icons
- **expo-image**: Optimized image loading (external URLs)
- **use-debounce**: Search input optimization
- **@react-native-async-storage/async-storage**: Local data persistence

#### **App Structure**

The app uses a **feature-first architecture** for better organization and maintainability:

```
app/                      # Expo Router screens
├── (tabs)/              # Tab navigation
│   ├── index.tsx        # Home screen
│   ├── portfolio.tsx    # Portfolio by category
│   ├── search.tsx       # Search functionality
│   └── settings.tsx     # App settings
├── category/[category].tsx  # Category detail pages
├── project/[id].tsx     # Project detail screen
└── _layout.tsx          # Root layout and theme

features/                # Feature modules
├── category/            # Category browsing
├── checklist/           # Meeting checklist
├── gallery/             # Image gallery with performance optimization
├── pdf/                 # PDF document viewing
├── projects/            # Project display components
└── search/              # Search and filtering

shared/                  # Shared across features
├── components/          # Reusable UI components
├── contexts/            # React contexts (Theme, Projects)
└── utils/               # Utility functions

core/                    # App infrastructure
├── config/              # Firebase configuration
├── constants/           # App constants
├── themes/              # Design system and theming
└── types/               # TypeScript type definitions

scripts/                 # Build and upload scripts
└── uploadPhotos.ts      # Upload local photos to Firebase
```

### Data Management

#### **Project Data Structure**

Each project contains:

- **Basic Info**: Name, category, descriptions, thumbnail
- **Media**: Pictures (before/after), documents, project logs
- **Client Info**: Name, address, phone, email
- **Project Details**: Location, dates, status, costs
- **Metadata**: Creation date, tags, completion status

#### **Data Storage**

- **Firebase Integration**: Cloud-based data storage using Firebase Firestore
- **Firebase Storage**: Project photos and documents stored in Firebase Storage
- **Real-time Sync**: Projects sync from Firebase database on app load
- **Local Scripts**: Upload local project photos using `npm run upload`

## Business-Focused Documentation

### Deployment Notes

#### **iPad Installation**

1. **Development Build**: Currently in development phase
2. **Future Deployment**: Will be deployed via Apple App Store when ready
3. **Device Setup**: Simple installation on company iPads
4. **Updates**: Manual updates through app store

#### **Device Requirements**

- **iPad**: Optimized for iPad (tablet support enabled)
- **Storage**: Minimum 100MB available space
- **Network**: Requires internet for photos, works offline for data

### Configuration

#### **Business Customization**

- **Company Branding**: ACE Remodeling logo and colors
- **Project Categories**: Customizable service categories
- **Theme Options**: Light, dark, and blue themes
- **Search Settings**: Configurable search behavior

#### **Data Configuration**

- **Project Categories**: Bathroom, Kitchen, General Remodeling, Outdoor, Basement, Attic
- **Project Statuses**: Planning, In Progress, Completed, On Hold
- **Document Types**: Contract, Permit, Invoice, Warranty, Manual, Other

### Data Management

#### **Client Data Storage**

- **Firebase Firestore**: All project data stored in cloud database
- **Privacy**: Data transmitted securely via Firebase
- **Automatic Backup**: Data backed up by Firebase infrastructure
- **Data Retention**: Projects maintained for portfolio purposes

#### **Project Data Sync**

- **Current State**: Cloud-based Firebase sync
- **Multi-Device**: Projects accessible from all devices with the app
- **Data Upload**: Use `npm run upload` script to upload local photos to Firebase

### Offline Capabilities

#### **Internet Connection Required**

- **Project Data**: Requires internet to load projects from Firebase
- **Photo Viewing**: Photos loaded from Firebase Storage
- **Real-time Updates**: Projects sync when online
- **Image Caching**: expo-image provides automatic caching for viewed photos

#### **Offline Limitations**

- **Initial Load**: Requires internet connection on first app launch
- **Photo Loading**: New photos require internet connection
- **Data Sync**: Cannot fetch updates without connection
- **Cached Content**: Previously viewed photos may be available offline via cache

## Maintenance & Support

### Troubleshooting

#### **Common Issues**

**App Won't Start**

- Restart the iPad
- Check available storage space
- Reinstall the app if necessary

**Search Not Working**

- Clear search field and try again
- Check for typos in search terms
- Restart the app if search remains unresponsive

**Photos Not Loading**

- Check internet connection
- Verify Firebase Storage access
- Restart the app to retry loading

**Performance Issues**

- Close other apps to free memory
- Restart the iPad
- Check for app updates

#### **Performance Optimization**

- **Memory Management**: Gallery automatically manages memory with lazy loading
- **Image Loading**: Optimized loading with expo-image and Firebase Storage
- **Search Optimization**: Debounced search prevents performance issues
- **Lazy Loading**: Images load only when needed to save bandwidth and memory
- **Image Preloading**: Adjacent images preloaded for smooth navigation

### Known Limitations

#### **Current Restrictions**

- **Data Entry**: No ability to add new projects from the app
- **Photo Upload**: Cannot add new photos to existing projects
- **Client Editing**: Cannot modify client information
- **Offline Sync**: No multi-device synchronization

#### **Planned Improvements**

- **Project Creation**: Ability to add new projects
- **Photo Management**: Upload and manage project photos
- **Client Management**: Edit and update client information
- **Cloud Sync**: Multi-device data synchronization
- **Reporting**: Project analytics and reporting features
- **Integration**: Connect with business management systems

---

**Version**: 1.0.0  
**Last Updated**: [Current Date]  
**Next Review**: [Next Review Date]
