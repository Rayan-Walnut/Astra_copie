export default function IndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-800/90 backdrop-blur-md border-b border-gray-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-400">Astra</span>
            <span className="text-white">IDE</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition">Fonctionnalités</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Tarifs</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Documentation</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Contact</a>
          </nav>
          <button className="bg-indigo-800 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition">
            Se connecter
          </button>
        </div>
      </header>
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">
          Collaborez en temps réel avec <span className="text-indigo-600">Astra IDE</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          L'IDE collaboratif nouvelle génération pour développer en équipe avec fluidité.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-indigo-800 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition">
            Essayer gratuitement
          </button>
          <button className="border border-gray-600 hover:bg-gray-700 text-gray-200 font-medium py-3 px-6 rounded-lg transition">
            Voir la démo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Fonctionnalités puissantes
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Édition en temps réel",
              description: "Collaborez simultanément sur le même code avec vos coéquipiers.",
              icon: "💻"
            },
            {
              title: "Partage instantané",
              description: "Partagez votre session de développement en un clic.",
              icon: "🚀"
            },
            {
              title: "Intégrations",
              description: "Connectez vos outils préférés comme GitHub, GitLab et plus.",
              icon: "🔌"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-indigo-500 transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-800 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à transformer votre workflow ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de développeurs qui collaborent déjà avec Astra IDE.
          </p>
          <button className="bg-gray-800 hover:bg-gray-100 text-indigo-600 font-medium py-3 px-8 rounded-lg transition">
            Commencer maintenant
          </button>
        </div>
      </section>
    </div>
  )
}