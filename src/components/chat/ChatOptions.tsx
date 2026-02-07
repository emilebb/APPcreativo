type ChatOptionsProps = {
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
};

export default function ChatOptions({ options, onSelect }: ChatOptionsProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className="rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
