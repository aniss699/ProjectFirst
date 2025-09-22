function LogoComparison() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Comparaison des logos SwipDEAL</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Logo actuel */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Logo actuel</h2>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <img 
                src="/swideal-logo.png" 
                alt="Logo actuel SwipDEAL" 
                className="max-w-full h-auto mx-auto"
                style={{ maxHeight: '200px' }}
              />
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Logo avec poignée de main et symboles dollar - concept deal/échange
            </p>
          </div>

          {/* Nouvelle idée de logo */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Nouvelle idée de logo</h2>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <img 
                src="/nouvelle-idee-logo.jpeg" 
                alt="Nouvelle idée de logo SwipDEAL" 
                className="max-w-full h-auto mx-auto"
                style={{ maxHeight: '200px' }}
              />
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Votre nouvelle proposition de logo
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Analyse comparative</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Cette page nous permet de comparer les deux versions et de voir comment elles s'intègrent dans l'interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoComparison;