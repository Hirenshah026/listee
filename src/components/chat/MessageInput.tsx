import { useState } from "react";

type Props = {
  onSend: (text: string) => void;
};

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;

    onSend(text); // ✅ ONLY STRING
    setText("");
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        placeholder="Type a message"
        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
      />

      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded-full text-sm"
      >
        Send
      </button>
    </div>
  );
}
