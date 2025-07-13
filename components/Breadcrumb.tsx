import Link from 'next/link';
import { useRouter } from 'next/router';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items = [] }: BreadcrumbProps) {
  const { pathname } = useRouter();

  // Global breadcrumb for _app.tsx
  if (!items.length) {
    if (pathname === '/') return null; // hide on landing
    
    return (
      <nav className="sticky top-0 z-20 bg-white/60 backdrop-blur shadow-sm text-sm px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
        </div>
      </nav>
    );
  }

  // Page-specific breadcrumb
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 mb-6">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:text-green-600 transition-colors">
              Dashboard
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              {item.href ? (
                <Link 
                  href={item.href}
                  className="hover:text-green-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
} 