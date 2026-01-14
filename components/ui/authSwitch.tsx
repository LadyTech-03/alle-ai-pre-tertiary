import { useAuth } from '@/components/providers/authTest';
import { Switch } from '@/components/ui/switch';

export function AuthSwitch() {
  const { isSubscribed, setIsSubscribed } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {isSubscribed ? (
          <span className="text-sm">Subscribed</span>
        ) : (
          <span className="text-sm">Not Subscribed</span>
        )}
        <Switch
          checked={isSubscribed}
          onCheckedChange={setIsSubscribed}
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-white"
        />
      </div>
    </div>
  );
}