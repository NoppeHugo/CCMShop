import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const NotreHistoire = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-champagne">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <HeartIcon className="mx-auto h-16 w-16 text-primary-600 mb-6" />
            <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">
              Notre Histoire
            </h1>
            <p className="text-2xl text-gray-700 font-light leading-relaxed max-w-3xl mx-auto">
              Chaque bijou raconte une histoire, chaque création porte en elle l'âme d'une artisane 
              passionnée qui transforme la matière en émotion depuis 2015.
            </p>
          </div>
        </div>
      </div>

      {/* Histoire principale */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Le début */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
              <SparklesIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              Tout a commencé par une étincelle...
            </h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="text-xl mb-6">
              En 2015, dans une petite pièce de sa maison à Mouscron, <strong>Sylvie</strong> découvre 
              la pâte Fimo. Ce qui devait être un simple loisir créatif devient rapidement une passion 
              dévorante. Le moment déclencheur ? Offrir à sa meilleure amie un petit pendentif fait main 
              pour son anniversaire et voir ses yeux s'illuminer.
            </p>
            
            <p className="text-lg mb-6">
              "Je n'avais jamais ressenti quelque chose d'aussi fort", se souvient-elle. 
              "Voir cette joie, cette émotion sur son visage... J'ai compris que créer, 
              c'était bien plus que façonner de la matière. C'était transmettre une part de soi."
            </p>
          </div>
        </div>

        {/* Les étapes clés */}
        <div className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
            Les étapes qui ont façonné CCM
          </h2>
          
          <div className="space-y-12">
            {/* Étape 1 */}
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="md:w-1/3">
                <div className="bg-primary-100 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">2015-2017</div>
                  <div className="text-primary-800 font-medium">L'Atelier naît</div>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Des premiers pas à l'atelier
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  De la pâte Fimo aux premières techniques de bijouterie, Sylvie transforme son salon 
                  en véritable atelier. Elle apprend l'art du métal, découvre l'argent 925, 
                  et ses créations évoluent vers des pièces plus sophistiquées. Chaque week-end, 
                  elle perfectionne ses techniques, guidée par sa seule passion.
                </p>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="flex flex-col md:flex-row-reverse items-start gap-8">
              <div className="md:w-1/3">
                <div className="bg-accent-rose/20 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-accent-rose mb-2">2018-2020</div>
                  <div className="text-gray-800 font-medium">Premier marché</div>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  L'aventure des marchés artisanaux
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Le premier marché de Noël à Mouscron marque un tournant. Ses bijoux délicats 
                  et uniques trouvent leur public. Les commandes personnalisées se multiplient, 
                  et CCM (Créations & Créativité de Marie, en hommage à sa grand-mère) 
                  devient officiellement une marque artisanale reconnue localement.
                </p>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="md:w-1/3">
                <div className="bg-accent-champagne rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-primary-700 mb-2">2021-2025</div>
                  <div className="text-primary-800 font-medium">Ère numérique</div>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Le virage digital et l'héritage
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  La pandémie pousse CCM vers le digital. Hugo, son fils, rejoint l'aventure 
                  pour créer cette boutique en ligne. Ensemble, ils imaginent un e-commerce 
                  qui préserve l'âme artisanale tout en touchant une clientèle européenne. 
                  Une belle transmission entre générations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aujourd'hui */}
        <div className="mb-16 bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
            CCM aujourd'hui
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">Notre vision</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Créer des bijoux qui accompagnent les moments précieux de la vie. 
                Chaque pièce est pensée pour sublimer qui vous êtes, célébrer vos émotions 
                et marquer vos souvenirs les plus chers.
              </p>
              
              <h3 className="text-xl font-semibold text-primary-600 mb-4">Nos valeurs</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-center">
                  <HeartIcon className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                  Authenticité et savoir-faire artisanal
                </li>
                <li className="flex items-center">
                  <HeartIcon className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                  Qualité des matériaux (argent 925, or)
                </li>
                <li className="flex items-center">
                  <HeartIcon className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                  Créations uniques et personnalisables
                </li>
                <li className="flex items-center">
                  <HeartIcon className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                  Proximité et relation humaine
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">Notre finalité</h3>
              <p className="text-gray-700 leading-relaxed">
                Nos bijoux ne sont pas de simples accessoires. Ils sont les témoins silencieux 
                de vos plus beaux moments : une demande en mariage, un anniversaire, 
                une réussite, une réconciliation... Ils portent vos émotions et racontent votre histoire.
              </p>
              
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <p className="text-primary-800 font-medium italic">
                  "Chaque création doit avoir une âme. Si elle ne raconte pas d'histoire, 
                  elle n'a pas sa place dans mes mains."
                </p>
                <p className="text-primary-600 text-sm mt-2">— Sylvie, fondatrice CCM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Portrait et citation */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-primary-50 to-accent-champagne rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3">
                {/* Placeholder pour photo */}
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-primary-200 to-accent-rose rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <HeartIcon className="h-16 w-16 text-primary-600 mx-auto mb-2" />
                    <p className="text-primary-700 font-medium">Photo de Sylvie</p>
                    <p className="text-primary-600 text-sm">dans son atelier</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <blockquote className="text-2xl font-serif text-gray-800 italic leading-relaxed mb-4">
                  "Créer, c'est transmettre une part de son âme. Chaque bijou qui sort de mes mains 
                  porte mes émotions, mes espoirs, ma vision de la beauté. Quand une femme porte 
                  une de mes créations, elle porte aussi un peu de ma passion."
                </blockquote>
                <footer className="text-primary-700 font-medium">
                  — Sylvie Catteau, Fondatrice et artisane CCM
                </footer>
                
                <div className="mt-6 text-gray-600">
                  <p className="mb-2">
                    <strong>Depuis son atelier à Mouscron</strong>, Sylvie continue de créer 
                    chaque bijou à la main, perpétuant un savoir-faire authentique dans un monde 
                    de plus en plus industrialisé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-sm">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
            Découvrez l'univers CCM
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Nos collections sont inspirées des émotions humaines, des moments précieux 
            et de la beauté du quotidien. Chaque pièce attend de rencontrer son histoire.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/collections"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Découvrir nos collections
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors"
            >
              Commande personnalisée
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              📍 Atelier situé à Mouscron, Belgique • 💎 Livraison dans toute l'Europe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotreHistoire;
