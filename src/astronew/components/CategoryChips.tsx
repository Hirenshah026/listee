interface Props {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

const CategoryChips: React.FC<Props> = ({ categories, selected, onSelect }) => {
  return (
    <div className="bg-white px-3 py-2 flex gap-2 overflow-x-auto">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`px-4 py-1 rounded-full border text-sm whitespace-nowrap ${
            selected === cat ? "border-pink-400 text-pink-500" : "text-gray-600"
          }`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryChips;
