import Link from 'next/link';

interface FabProps {
  /** URL to navigate when clicked */
  href: string;
  /** Tooltip text (optional) */
  title?: string;
}

export default function StickyFab({ href, title = 'Add' }: FabProps) {
  return (
    <Link
      href={href}
      title={title}
      className="fixed bottom-5 right-5 flex items-center justify-center
                 w-14 h-14 rounded-full bg-green-600 text-white text-3xl
                 shadow-lg hover:shadow-xl focus:outline-none
                 transition-all duration-200 hover:bg-green-700
                 hover:scale-110 z-50"
    >
      +
    </Link>
  );
} 