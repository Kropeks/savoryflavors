import { Providers } from '../providers';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100">
      <Providers>
        {children}
      </Providers>
    </div>
  );
}
