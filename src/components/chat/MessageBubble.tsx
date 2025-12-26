type Props = {
  text: string;
  own?: boolean;
  status?: "sent" | "delivered" | "read";
  chattime?: string; // "18:56" ya "6:56 PM"
};

export default function MessageBubble({
  text,
  own = false,
  status = "sent",
  chattime,
}: Props) {
  const formatTime = (time?: string) => {
    if (!time) {
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const date = new Date(time); // ISO parse
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const getTicks = () => {
    if (!own) return null;

    if (status === "sent") return "✓";
    if (status === "delivered") return "✓✓";
    if (status === "read")
      return <span className="text-blue-500">✓✓</span>;
  };

  return (
    <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-3 py-2 text-[14px] leading-relaxed max-w-[100%] shadow-sm
        ${own
            ? "bg-[#d9fdd3] rounded-l-lg rounded-br-lg"
            : "bg-white rounded-r-lg rounded-bl-lg"
          }`}
      >
        {text}

        <div className="flex justify-end items-center gap-1 mt-1 text-[10px] text-gray-500">
          <span>{formatTime(chattime)}</span>
          {getTicks()}
        </div>
      </div>
    </div>
  );
}
