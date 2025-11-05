'use client';

// Componente de Barra de Navegación (replicado del page.js)
const Navbar = () => {
    
    // Handler para navegación simple
    const navigateTo = (path) => {
        window.location.href = path;
    };

    // Estructura de navegación con enlaces
    return (
        <nav className="fixed top-0 left-0 w-full bg-gray-900 shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                
                {/* Logo / Nombre del Sitio */}
                <div onClick={() => navigateTo("/")} className="text-xl font-bold text-yellow-500 cursor-pointer transition duration-300 hover:text-yellow-400">
                    Juegos de Mesa
                </div>
                
                {/* Enlaces de Navegación */}
                <div className="flex space-x-4">
                    <button 
                        onClick={() => navigateTo("/")} 
                        className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                    >
                        Inicio
                    </button>
                    <button 
                        onClick={() => navigateTo("/juegos-de-mesa")} 
                        className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                    >
                        Catálogo
                    </button>
                    {/* El enlace de Contacto ahora apunta al inicio como marcador */}
                    <button 
                        onClick={() => navigateTo("/")} 
                        className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                    >
                        Contacto
                    </button>
                </div>
            </div>
        </nav>
    );
};

// Componente principal de la página 404
export default function NotFound() {
  
  // Handler de navegación (incluido para el botón principal)
  const navigateTo = (path) => {
      window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      
      {/* 1. Barra de Navegación */}
      <Navbar />

      {/* 2. Contenido de Error Centrado (con padding para evitar la navbar fija) */}
      <div className="flex flex-col items-center justify-center flex-grow p-8 pt-24 text-center">
        <h1 className="text-7xl sm:text-9xl font-extrabold text-red-500 mb-4 animate-pulse">
          404
        </h1>
        
        <h2 className="text-3xl sm:text-5xl font-semibold mb-6 text-gray-200">
          Página No Encontrada
        </h2>
        
        <p className="text-lg text-gray-400 mb-8">
          La ruta a la que intentaste acceder no existe.
        </p>

        <button 
          onClick={() => navigateTo("/")}
          className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-full transition duration-300 shadow-xl transform hover:scale-105"
        >
          Ir a la Página de Inicio
        </button>
      </div>
    </div>
  );
}