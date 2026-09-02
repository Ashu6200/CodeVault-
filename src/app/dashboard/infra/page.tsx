import { Database, Shield } from 'lucide-react';
import Link from 'next/link';

export default function InfraPage() {
  const cards = [
    {
      title: 'API Keys',
      description: 'Manage authentication keys for programmatic access to your documents.',
      href: '/dashboard/apikey',
      icon: Shield,
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Infrastructure</h1>
        <p className="text-muted-foreground mt-2">
          Configure your developer tools, API access, and external integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative rounded-xl border bg-card p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{card.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {card.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-muted/30 p-8 flex flex-col items-center text-center gap-4">
        <Database className="h-10 w-10 text-muted-foreground/50" />
        <div>
          <h3 className="font-semibold">Need custom infra?</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            We are expanding our infrastructure offerings. Contact support for dedicated instance requests or custom integration needs.
          </p>
        </div>
      </div>
    </div>
  );
}
