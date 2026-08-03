# SSS Modernization Demo - Frontend

React + TypeScript frontend for user registration, authentication, and exemption management.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

App runs on `http://localhost:3000`

Backend API should be running on `http://localhost:3001`

## Available Scripts

- `npm start` / `npm run dev` - Start development server
- `npm test` - Run Jest tests
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Registration.tsx      # STORY-001 registration form
│   │   ├── Login.tsx             # Login page
│   │   └── Profile.tsx           # User profile (STORY-002)
│   ├── components/
│   │   └── ProtectedRoute.tsx    # Auth guard
│   ├── services/
│   │   └── api.ts                # Axios API client
│   ├── store/
│   │   └── authStore.ts          # Zustand auth state
│   ├── utils/
│   │   └── validators.ts         # Form validation
│   ├── App.tsx                   # Main component + routing
│   ├── App.css                   # Global styles
│   └── index.tsx                 # React entry point
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── jest.config.js
└── README.md
```

## Pages

### /register
User registration form (STORY-001)
- Email validation
- Strong password requirements
- SSN format (XXX-XX-XXXX)
- Age validation (18+)
- Real-time validation feedback

### /login
User login page
- Email + password authentication
- Error messaging

### /profile
User profile page (protected route)
- Display user information
- Logout button

## Features

### Registration Form (STORY-001)
- Email format validation
- Password strength requirements (12+ chars, uppercase, digit, special)
- SSN format validation with auto-formatting
- Date of birth with age validation
- Real-time field validation feedback
- Password strength indicator
- Error display with field-level details
- Confirmation password matching
- Accessible form (WCAG 2.1 AA)
- Loading state during submission

### Authentication
- JWT token storage in localStorage
- Auto-logout on 401 response
- Protected routes
- Persistent login (refresh page keeps user logged in)

### State Management
- Zustand for auth state
- Persisted to localStorage
- Global auth context

### Styling
- Tailwind CSS
- Responsive design
- Accessible color contrast
- Focus indicators

## Authentication Flow

1. User fills registration form
2. Form validates in real-time
3. Submit calls `POST /auth/register`
4. Backend returns user + JWT token
5. Token stored in localStorage
6. User redirected to `/profile`
7. Auth state persisted (survives refresh)

## Form Validation

### Email
- Required
- Valid email format

### Password
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 digit
- At least 1 special character (!@#$%^&*)

### Full Name
- Required
- At least 2 characters

### SSN
- Required
- Format: XXX-XX-XXXX
- Auto-formatted as user types

### Date of Birth
- Required
- Must be at least 18 years old
- Valid date format

## Accessibility

- Semantic HTML
- Proper label associations
- ARIA attributes (aria-invalid, aria-describedby, role="alert")
- Keyboard navigation
- Focus indicators
- Color contrast 4.5:1 for text
- Form error messages associated with fields

## Testing

Run tests:
```bash
npm test
```

Tests cover:
- Form renders correctly
- Validation logic
- Error messages display
- SSN formatting
- Password strength meter
- Age validation
- Form submission
- Navigation to login page

## Environment Variables

Create `.env.local`:
```
REACT_APP_API_URL=http://localhost:3001
```

## Development Tips

### Adding a new page
1. Create file in `src/pages/`
2. Export component
3. Add route in `App.tsx`
4. Create tests

### Adding validation
1. Add validator function in `src/utils/validators.ts`
2. Use in form component
3. Add tests

### Styling
- Use Tailwind classes
- Extend theme in `tailwind.config.js`
- Global styles in `App.css`

## Troubleshooting

**API connection error:**
- Check backend is running on port 3001
- Check REACT_APP_API_URL in `.env.local`

**Port 3000 already in use:**
- Change port: `PORT=3001 npm start`
- Or kill process: `lsof -ti:3000 | xargs kill -9`

**Module not found:**
- Run `npm install`
- Clear cache: `rm -rf node_modules && npm install`

**TypeScript errors:**
- Run `npm run lint`
- Check `tsconfig.json`
