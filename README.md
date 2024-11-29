# Learning-Management-System
`{
  "name": "learning-management", // The name of your project
  "version": "0.1.0", // Initial version of your project
  "private": true, // Marks the project as private to prevent accidental publication to npm
  "scripts": {
    "dev": "next dev", // Command to start the development server
    "build": "next build", // Command to build the production-ready application
    "start": "next start", // Command to start the production server
    "lint": "next lint" // Command to run the Next.js linter
  },
  "dependencies": {
    "@clerk/clerk-js": "^5.33.0", // Clerk authentication library for JavaScript
    "@clerk/nextjs": "^6.3.1", // Clerk integration specifically for Next.js
    "@clerk/themes": "^2.1.43", // Predefined themes for Clerk UI components
    "@hello-pangea/dnd": "^17.0.0", // Library for drag-and-drop functionality
    "@hookform/resolvers": "^3.9.1", // Resolver for integrating Zod or Yup with React Hook Form
    "@radix-ui/react-accordion": "^1.2.1", // Radix UI Accordion component
    "@radix-ui/react-avatar": "^1.1.1", // Radix UI Avatar component
    "@radix-ui/react-dialog": "^1.1.2", // Radix UI Dialog component
    "@radix-ui/react-label": "^2.1.0", // Radix UI Label component
    "@radix-ui/react-navigation-menu": "^1.2.1", // Radix UI Navigation Menu component
    "@radix-ui/react-popover": "^1.1.2", // Radix UI Popover component
    "@radix-ui/react-progress": "^1.1.0", // Radix UI Progress component
    "@radix-ui/react-select": "^2.1.2", // Radix UI Select component
    "@radix-ui/react-separator": "^1.1.0", // Radix UI Separator component
    "@radix-ui/react-slot": "^1.1.0", // Radix UI Slot component for composable components
    "@radix-ui/react-switch": "^1.1.1", // Radix UI Switch component
    "@radix-ui/react-tabs": "^1.1.1", // Radix UI Tabs component
    "@radix-ui/react-toggle": "^1.1.0", // Radix UI Toggle component
    "@radix-ui/react-tooltip": "^1.1.3", // Radix UI Tooltip component
    "@reduxjs/toolkit": "^2.3.0", // Redux Toolkit for state management
    "@stripe/react-stripe-js": "^2.9.0", // React bindings for Stripe.js
    "@stripe/stripe-js": "^4.10.0", // Stripe.js library for integrating payment solutions
    "class-variance-authority": "^0.7.0", // Utility for managing complex Tailwind CSS classes
    "clsx": "^2.1.1", // Utility for conditional className management
    "date-fns": "^4.1.0", // JavaScript date utility library
    "dotenv": "^16.4.5", // Loads environment variables from a `.env` file
    "filepond": "^4.32.1", // File upload library
    "filepond-plugin-image-exif-orientation": "^1.0.11", // FilePond plugin for handling image EXIF orientation
    "filepond-plugin-image-preview": "^4.6.12", // FilePond plugin for image previews
    "framer-motion": "^11.11.11", // Library for animations and gestures in React
    "lucide-react": "^0.456.0", // Icon library for React
    "next": "15.0.3", // Next.js framework for building server-side rendered React applications
    "next-themes": "^0.4.3", // Library for theme toggling in Next.js apps
    "react": "^18.3.1", // React library
    "react-dom": "^18.3.1", // React DOM library for rendering components
    "react-filepond": "^7.1.2", // React bindings for FilePond
    "react-hook-form": "^7.53.2", // Library for managing form state in React
    "react-player": "^2.16.0", // Library for embedding video and audio players
    "react-redux": "^9.1.2", // React bindings for Redux
    "sonner": "^1.7.0", // Toast notification library
    "tailwind-merge": "^2.5.4", // Utility for merging Tailwind CSS classes
    "tailwindcss-animate": "^1.0.7", // Tailwind plugin for animations
    "uuid": "^11.0.3", // Library for generating unique identifiers
    "zod": "^3.23.8" // TypeScript-first schema declaration and validation library
  },
  "devDependencies": {
    "@types/node": "^20.17.6", // TypeScript types for Node.js
    "@types/react": "^18", // TypeScript types for React
    "@types/react-dom": "^18", // TypeScript types for React DOM
    "@types/uuid": "^10.0.0", // TypeScript types for the UUID library
    "eslint": "^8", // Linter for identifying and fixing problems in JavaScript code
    "eslint-config-next": "15.0.3", // Next.js-specific ESLint configuration
    "postcss": "^8", // Tool for transforming CSS with JavaScript plugins
    "prettier-plugin-tailwindcss": "^0.6.8", // Prettier plugin for formatting Tailwind CSS classes
    "tailwindcss": "^3.4.1", // Tailwind CSS framework
    "typescript": "^5" // TypeScript language support
  }
}
`
