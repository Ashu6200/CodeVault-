export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your workspace. Here's what's happening.
      </p>
      {/* Activity Feed, Recent Documents, etc. will go here */}
    </div>
  );
}
