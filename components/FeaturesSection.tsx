import { AlertTriangle, BrainCircuit, CheckCircle } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: AlertTriangle,
      title: 'La fin des faux avis',
      description: 'Les avis 5 étoiles sont souvent manipulés. Nous les ignorons pour chercher la vérité ailleurs.',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: BrainCircuit,
      title: "L'IA + Reddit",
      description: 'Notre algorithme scanne des milliers de discussions réelles pour extraire le consensus de la communauté.',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: CheckCircle,
      title: 'Gain de temps',
      description: 'Ne perdez plus 3h à comparer. Obtenez le verdict final et les défauts cachés en un coup d\'œil.',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ];

  return (
    <section className="relative py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 z-10">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-4"
              >
                {/* Icône */}
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${feature.iconBg} ${feature.iconColor} mb-2`}>
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                </div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

