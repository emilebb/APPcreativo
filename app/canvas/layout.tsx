export const metadata = {
  title: 'Canvas - CreacionX',
  description: 'Tu pizarra creativa digital',
};

export const viewport = {
  themeColor: '#a855f7',
  width: 'device-width',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
