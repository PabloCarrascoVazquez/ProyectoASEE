import { AdminEvents } from './AdminEvents';
import { AdminVendors } from './AdminVendors';
import { AdminMerch } from './AdminMerch'; 

export const AdminPanel = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-indigo-900">System Dashboard</h1>
        <span className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
          ADMIN MODE
        </span>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminEvents />
        <AdminVendors />
      </div>

      {/* Sección de Merch ocupando todo el ancho abajo */}
      <div className="mt-8">
        <AdminMerch />
      </div>
    </div>
  );
};