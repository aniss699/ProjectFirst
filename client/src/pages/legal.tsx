
export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Mentions Légales & Politique de Confidentialité
        </h1>
        <p className="text-gray-600">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Éditeur du site</h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>Nom de l'entreprise :</strong> AppelsPro</p>
            <p><strong>Adresse :</strong> À définir</p>
            <p><strong>Email :</strong> contact@appelspro.fr</p>
            <p><strong>Directeur de la publication :</strong> À définir</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hébergement</h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>Hébergeur :</strong> Replit</p>
            <p><strong>Adresse :</strong> 767 Bryant Street, San Francisco, CA 94107</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Collecte des données personnelles</h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Dans le cadre de l'utilisation de notre plateforme, nous collectons les données suivantes :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Informations sur vos projets et missions</li>
              <li>Données de navigation (cookies techniques)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Utilisation des données</h2>
          <div className="text-gray-700 space-y-4">
            <p>Vos données personnelles sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Faciliter la mise en relation entre clients et prestataires</li>
              <li>Améliorer nos services</li>
              <li>Vous envoyer des notifications importantes</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vos droits</h2>
          <div className="text-gray-700 space-y-4">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous à l'adresse : 
              <a href="mailto:contact@appelspro.fr" className="text-primary hover:underline ml-1">
                contact@appelspro.fr
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Conditions Générales de Vente</h2>
          <div className="text-gray-700 space-y-4">
            <h3 className="text-lg font-semibold">Article 1 - Objet</h3>
            <p>
              AppelsPro est une plateforme de mise en relation entre clients recherchant des services 
              et prestataires proposant leurs compétences.
            </p>

            <h3 className="text-lg font-semibold mt-6">Article 2 - Services</h3>
            <p>
              Nous proposons deux types de services :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Appels d'offres inverses : les clients publient leurs besoins</li>
              <li>Mise en relation directe : connexion immédiate avec des professionnels</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6">Article 3 - Responsabilités</h3>
            <p>
              AppelsPro agit uniquement en tant qu'intermédiaire. Les contrats sont conclus 
              directement entre clients et prestataires.
            </p>

            <h3 className="text-lg font-semibold mt-6">Article 4 - Tarifs</h3>
            <p>
              L'inscription et la publication de projets sont gratuites pour les clients. 
              Des frais peuvent s'appliquer aux prestataires selon les conditions d'utilisation.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
          <div className="text-gray-700">
            <p>
              Notre site utilise uniquement des cookies techniques nécessaires au fonctionnement 
              de la plateforme. Aucun cookie publicitaire ou de tracking n'est utilisé.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
          <div className="text-gray-700">
            <p>
              Pour toute question concernant ces mentions légales ou notre politique de confidentialité, 
              vous pouvez nous contacter à l'adresse : 
              <a href="mailto:contact@appelspro.fr" className="text-primary hover:underline ml-1">
                contact@appelspro.fr
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
