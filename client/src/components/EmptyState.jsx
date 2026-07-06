import { Card, CardContent } from '@/components/ui/card';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="p-10 text-center border-dashed">
      {Icon ? (
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <Icon size={26} />
        </div>
      ) : null}
      <h3 className="mt-4 font-semibold text-card-foreground">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
