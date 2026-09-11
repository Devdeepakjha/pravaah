import { CommandCenterView } from '@/features/command-center/CommandCenterView';

export const metadata = {
  title: 'Command Center — PRAVAAH Landslide Risk Intelligence',
  description: 'Regional GIS Early Warning & ML Risk Intelligence Command Center for Northeast India',
};

export default function CommandCenterPage() {
  return (
    <main className="h-full w-full overflow-hidden">
      <CommandCenterView />
    </main>
  );
}
