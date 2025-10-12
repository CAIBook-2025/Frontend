export const ActivityCard = ({
  status,
  details,
  variant = 'green',
}: {
  status: string;
  details: string;
  variant?: 'green' | 'yellow' | 'blue';
}) => {
  const dotColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`w-2 h-2 rounded-full ${dotColors[variant]} mt-2 flex-shrink-0`} />
      <div>
        <p className="font-medium text-gray-800 text-sm">{status}</p>
        <p className="text-gray-500 text-xs mt-1">{details}</p>
      </div>
    </div>
  );
};
