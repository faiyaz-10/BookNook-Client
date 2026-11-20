# BookNook

**Live website:** [https://book-nook-client-mu.vercel.app](https://book-nook-client-mu.vercel.app)

BookNook is a community-powered online bookshelf for readers to discover, share, and borrow books. Browse the collection, check availability, and keep track of books you have contributed or borrowed. The site includes account registration and sign-in so readers can manage their own books and borrowing activity.

## Features

- Browse the community's book collection and view details such as author, category, description, and available copies.
- Search books by title or author and filter the catalog by category.
- Register and sign in with email and password; Google sign-in is available when OAuth credentials are configured.
- Add books with a cover image, description, category, and copy count.
- Borrow one or more available copies. A return date is set seven days from the borrow date.
- View borrowed books and return all or part of a multi-copy borrow.
- Manage books you have added: review availability, edit details, replace a cover image, or delete a book when it has no active borrows.
- View your profile, update your display name, and review your borrowed books and return dates.
- Discover recent additions and featured reading categories on the home page.

## Technologies

- **Next.js 15** (App Router) and **React 19**
- **TypeScript**
- **Better Auth** for email/password authentication and optional Google OAuth
- **MongoDB** and the Better Auth MongoDB adapter
- **CSS** using a global stylesheet and CSS Modules
- **Swiper** for the home-page carousel
- **Lucide React** for icons and **Sonner** for notifications
- **ESLint** for linting

> The current implementation does not include Tailwind CSS; styling is implemented with regular CSS and CSS Modules.

## Main pages

| Page | Path | Access |
| --- | --- | --- |
| Home and new arrivals | `/` | Public |
| Book catalog | `/books` | Public |
| Book details | `/books/[id]` | Public |
| Register | `/register` | Public |
| Login | `/login` | Public |
| Add a book | `/add-book` | Sign-in required |
| My books | `/my-books` | Sign-in required |
| My borrows | `/my-borrows` | Sign-in required |
| Profile | `/profile` | Sign-in required |

## Screenshots

Screenshots are not currently included in this repository. Add screenshots here when they are available.

## Getting started

### Prerequisites

- Node.js and npm
- A MongoDB connection for Better Auth
- The BookNook backend API, either running locally or available at the deployed API URL

### Install dependencies

From the client repository root:

```bash
npm install
```

### Configure environment variables

Create a local environment file from the example. In PowerShell:

```powershell
Copy-Item .env.example .env.local
```

On macOS or Linux:

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace placeholder values with your own configuration:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/?retryWrites=true&w=majority
MONGODB_DB=booknook
BETTER_AUTH_SECRET=<your-random-secret-at-least-32-characters-long>
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:5000
```

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string used by Better Auth. Required. |
| `MONGODB_DB` | MongoDB database name. Defaults to `booknook` if omitted. |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth. Configure a unique secret of at least 32 characters for production. |
| `BETTER_AUTH_URL` | Base URL for the Better Auth server. Use the local client origin during development and the deployed client origin in production. |
| `NEXT_PUBLIC_API_URL` | Base URL for the backend API. The development fallback is `http://localhost:5000`; set it to the deployed API URL when using the hosted backend. |
| `GOOGLE_CLIENT_ID` | Optional Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Optional Google OAuth client secret. Google sign-in is enabled only when both Google variables are set. |

Do not commit `.env.local` or share credentials. The values above are placeholders; use your own MongoDB and authentication configuration. For production, the app requires a configured `NEXT_PUBLIC_API_URL`, an HTTPS `BETTER_AUTH_URL`, and a strong `BETTER_AUTH_SECRET`.

### Run the development server

Start the backend API separately if using a local backend. Make sure `NEXT_PUBLIC_API_URL` points to that API, then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production server after building. |
| `npm run lint` | Run ESLint on `src`. |

## Project structure

```text
src/
├── app/                 # App Router pages, layouts, and Better Auth route
│   ├── api/auth/        # Better Auth API handler
│   ├── books/           # Catalog and book detail routes
│   └── ...              # Home, login, register, profile, and user pages
├── components/          # Page, form, navigation, and reusable UI components
└── lib/                 # API client, Better Auth setup, MongoDB, and image upload
```

The client uses the configured backend API for book and borrow operations. Authentication is handled through Better Auth, with its server-side user data stored in MongoDB.
