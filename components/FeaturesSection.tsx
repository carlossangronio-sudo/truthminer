import { AlertTriangle, BrainCircuit, CheckCircle } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: AlertTriangle,
      title: 'La fin des faux avis',
      description: 'Les avis 5 étoiles sont souvent manipulés. Nous les ignorons pour chercher la vérité ailleurs.',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-500/10',
    },
    {
      icon: BrainCircuit,
      title: "L'IA + Reddit",
      description: 'Notre algorithme scanne des milliers de discussions réelles pour extraire le consensus de la communauté.',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-500/10',
    },
    {
      icon: CheckCircle,
      title: 'Gain de temps',
      description: 'Ne perdez plus 3h à comparer. Obtenez le verdict final et les défauts cachés en un coup d\'œil.',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-500/10',
    },
  ];

  return (
    <section className="relative py-16 md:py-24 z-10">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-card-ultra p-8 flex flex-col items-center text-center space-y-6 group hover:scale-105 transition-all duration-300"
              >
                {/* Icône */}
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${feature.iconBg} ${feature.iconColor} mb-2 relative z-10`}>
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                </div>

                {/* Titre */}
                <h3 className="text-xl font-black uppercase italic text-slate-900 relative z-10 tracking-tighter">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base text-slate-700 leading-relaxed max-w-sm font-medium relative z-10">
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

