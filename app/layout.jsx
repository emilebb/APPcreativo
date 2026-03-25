import { AuthProvider } from '@/contexts/AuthContext';

export const viewport = {
  themeColor: '#a855f7',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'CreacionX - Plataforma Creativa Inteligente',
  description: 'Plataforma creativa inteligente para diseñadores y desarrolladores',
};

// 404 metadata
export const notFoundMetadata = {
  title: '404 - Proyecto No Encontrado | CreacionX',
  description: 'Este proyecto no existe o ha sido eliminado. Crea algo nuevo en CreacionX.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-[#0d0d10] text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
