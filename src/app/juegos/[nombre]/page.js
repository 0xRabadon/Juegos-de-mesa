// Obtiene los datos del producto (Google Sheet)
export async function getStaticProps({ params }) {
  const { nombre } = params;

  // 1. Lógica para conectar y obtener TODOS los datos del Google Sheet.
  // En un proyecto real, se usa una librería (como 'google-spreadsheet')
  // o se llama a una API que devuelva un JSON.
  const allGames = [
    { Nombre: 'Catan', Jugadores_Min: 3, Desc: 'Juego de estrategia...' },
    { Nombre: 'Saboteur', Jugadores_Min: 3, Desc: 'Juego de cartas de engaño...' },
    // ... tus datos del Google Sheet
  ];

  // 2. Busca el juego que coincide con el nombre de la URL
  const gameData = allGames.find(game => game.Nombre === nombre);

  if (!gameData) {
    return { notFound: true };
  }

  return {
    props: {
      gameData, // Esto pasa toda la información del Google Sheet al componente
    },
    revalidate: 3600, // Regenerar la página si el Google Sheet cambia cada hora
  };
}

// Necesario para las Rutas Dinámicas
export async function getStaticPaths() {
    // Aquí obtienes la lista de todos los 'Nombres' de tu Google Sheet
    const gameNames = ['Catan', 'Saboteur', 'Power Hungry P'];
    
    const paths = gameNames.map(name => ({
        params: { nombre: name }
    }));

    return { paths, fallback: 'blocking' };
}