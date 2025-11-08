interface ModalActionsProps {
  onCancel: () => void;
  onSave: () => void;
  loading: boolean;
}

export const ModalActions = ({ onCancel, onSave, loading }: ModalActionsProps) => (
  <div className="p-6 border-t border-gray-200 flex gap-3">
    <button
      onClick={onCancel}
      type="button"
      disabled={loading}
      className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors border border-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
    >
      Cancelar
    </button>
    <button
      onClick={onSave}
      type="button"
      disabled={loading}
      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
    >
      {loading ? 'Guardando…' : 'Guardar Cambios'}
    </button>
  </div>
);
