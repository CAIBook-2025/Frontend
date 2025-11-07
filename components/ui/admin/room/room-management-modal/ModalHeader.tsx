import { XIcon } from 'lucide-react';

interface ModalHeaderProps {
  roomName: string;
  onClose: () => void;
}

export const ModalHeader = ({ roomName, onClose }: ModalHeaderProps) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-200">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Gestionar Sala</h2>
      <p className="text-sm text-gray-600 mt-1">{roomName}</p>
    </div>
    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <XIcon />
    </button>
  </div>
);
