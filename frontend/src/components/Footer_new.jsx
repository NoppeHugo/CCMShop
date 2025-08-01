import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Navigation",
      links: [
        { name: "Accueil", href: "/" },
        { name: "Boutique", href: "/boutique" },
        { name: "Notre histoire", href: "/notre-histoire" },
        { name: "Contact", href: "/contact" }
      ]
    },
    {
      title: "Collections",
      links: [
        { name: "Bagues", href: "/boutique?category=bagues" },
        { name: "Colliers", href: "/boutique?category=colliers" },
        { name: "Boucles d'oreilles", href: "/boutique?category=boucles-oreilles" },
        { name: "Bracelets", href: "/boutique?category=bracelets" }
      ]
    },
    {
      title: "Service client",
      links: [
        { name: "FAQ", href: "/faq" },
        { name: "Avis clients", href: "/avis" },
        { name: "Livraisons", href: "/livraisons" },
        { name: "Retours", href: "/retours" }
      ]
    }
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      {/* Section principale */}
      <div className="container-padding section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Informations de l'entreprise */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-xl font-medium text-white mb-6">
              Créations Clémence Marie
            </h3>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Bijoux artisanaux créés avec passion dans notre atelier de Mouscron. 
              Chaque pièce raconte une histoire unique.
            </p>
            
            {/* Informations de contact */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Mouscron, Belgique</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contact@clemencemarie.be" className="hover:text-white transition-colors">
                  contact@clemencemarie.be
                </a>
              </div>
            </div>
          </div>

          {/* Sections de navigation */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-medium text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Section réseaux sociaux */}
      <div className="border-t border-neutral-800">
        <div className="container-padding py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <span className="text-sm text-neutral-500">Suivez-nous</span>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-9 h-9 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.534l1.714-1.388c.394.622 1.101 1.042 1.906 1.042 1.242 0 2.25-1.008 2.25-2.25s-1.008-2.25-2.25-2.25c-.805 0-1.512.42-1.906 1.042L5.244 10.262c.757-.938 1.908-1.534 3.205-1.534 2.206 0 3.994 1.788 3.994 3.994s-1.788 3.994-3.994 3.994z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="text-sm text-neutral-500">
              Paiement sécurisé • Livraison soignée • Satisfaction garantie
            </div>
          </div>
        </div>
      </div>

      {/* Section copyright */}
      <div className="border-t border-neutral-800">
        <div className="container-padding py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
            <div>
              © {currentYear} Créations Clémence Marie. Tous droits réservés.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/mentions-legales" className="hover:text-neutral-300 transition-colors">
                Mentions légales
              </a>
              <a href="/confidentialite" className="hover:text-neutral-300 transition-colors">
                Confidentialité
              </a>
              <a href="/cgu" className="hover:text-neutral-300 transition-colors">
                CGU
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
