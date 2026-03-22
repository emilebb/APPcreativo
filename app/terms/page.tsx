export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
        Términos y Condiciones
      </h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Aceptación de Términos</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Al acceder y utilizar CreationX, aceptas estar sujeto a estos términos y condiciones. 
            Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Uso del Servicio</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            CreationX es una plataforma para la creación y gestión de proyectos creativos. 
            Te comprometes a:
          </p>
          <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
            <li>Usar el servicio de manera legal y ética</li>
            <li>No compartir contenido ofensivo o ilegal</li>
            <li>Mantener la seguridad de tu cuenta</li>
            <li>Respetar los derechos de propiedad intelectual</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Propiedad Intelectual</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Mantienes todos los derechos sobre el contenido que creas en CreationX. 
            Nos otorgas una licencia para almacenar y mostrar tu contenido con el fin de 
            proporcionar nuestros servicios.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Limitación de Responsabilidad</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            CreationX se proporciona "tal cual". No garantizamos que el servicio será 
            ininterrumpido o libre de errores. No somos responsables de pérdidas de datos 
            o daños derivados del uso del servicio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Modificaciones del Servicio</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, 
            con o sin previo aviso.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Terminación</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Podemos suspender o terminar tu acceso al servicio si violas estos términos. 
            Puedes cancelar tu cuenta en cualquier momento desde la configuración.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cambios en los Términos</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Podemos actualizar estos términos ocasionalmente. Te notificaremos de cambios 
            significativos a través del servicio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Para preguntas sobre estos términos, contáctanos a través de nuestros 
            canales de soporte.
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
