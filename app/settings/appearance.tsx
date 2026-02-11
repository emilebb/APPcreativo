import SettingsLayout from "@/components/SettingsLayout";

export default function AppearanceSettings() {
  return (
    <SettingsLayout>
      <h1 className="text-2xl font-bold mb-4">Apariencia</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tema
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => document.documentElement.setAttribute("data-theme", "light")}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              ☀ Claro
            </button>
            <button
              onClick={() => document.documentElement.setAttribute("data-theme", "dark")}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-800 text-white"
            >
              🌙 Oscuro
            </button>
            <button
              onClick={() => document.documentElement.setAttribute("data-theme", "system")}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700"
            >
              🖥 Sistema
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Densidad de interfaz
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option>Compacta</option>
            <option>Cómoda</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Animaciones activas
          </label>
          <input type="checkbox" className="mt-1" />
        </div>
      </div>
    </SettingsLayout>
  );
}