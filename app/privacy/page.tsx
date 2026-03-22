export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
        Política de Privacidad
      </h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            En CreationX, recopilamos la información necesaria para proporcionarte nuestros servicios:
          </p>
          <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
            <li>Información de cuenta (email, nombre)</li>
            <li>Proyectos creativos que creas en la plataforma</li>
            <li>Preferencias y configuraciones</li>
            <li>Datos de uso de la aplicación</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Uso de la Información</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Utilizamos tu información para:
          </p>
          <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Personalizar tu experiencia</li>
            <li>Comunicarnos contigo sobre actualizaciones</li>
            <li>Garantizar la seguridad de la plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Protección de Datos</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Implementamos medidas de seguridad para proteger tu información personal. 
            Tus datos están almacenados de forma segura y encriptada.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Tus Derechos</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Tienes derecho a:
          </p>
          <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
            <li>Acceder a tu información personal</li>
            <li>Corregir datos inexactos</li>
            <li>Solicitar la eliminación de tu cuenta</li>
            <li>Exportar tus datos</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Contacto</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Si tienes preguntas sobre esta política de privacidad, contáctanos a través de 
            nuestros canales de soporte.
          </p>
        </section>

        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-12">
          Última actualización: {new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </main>
  );
}
