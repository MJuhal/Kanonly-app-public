import { useEffect, useRef, useState } from 'react';
import { Smile, X } from 'lucide-react';

const emojiCategories = [
  {
    name: 'Caritas',
    emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  },
  {
    name: 'Gestos',
    emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌','🤞','🫰','🤟','🤘','🤙','🫵','👈','👉','👆','🖕','👇','☝','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍','💪','🦾','🦵','🦶','👂','🦻','👃','🧠','👀','👁','👅','👄','👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵'],
  },
  {
    name: 'Corazones',
    emojis: ['❤','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣','💕','💞','💓','💗','💖','💘','💝','💟','♥','♡'],
  },
  {
    name: 'Símbolos',
    emojis: ['☮','✝','☪','🕉','☸','✡','🔯','🕎','☯','☦','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛','☑','✔','✅','❎','➕','➖','➗','✖','💲','💱','©','®','™','🔙','🔚','🔛','🔜','🔝','🔄','▶','⏸','⏹','⏺','⏏','🎦','🔅','🔆','📶','📳','📴','♀','♂','⚧'],
  },
  {
    name: 'Objetos',
    emojis: ['💼','📁','📂','🗂','📄','📃','📑','🧾','📊','📈','📉','🗒','🗓','📆','📅','🗑','🖇','✂','📝','💻','🖥','🖨','⌨','🖱','💿','📀','🎥','🎬','📺','📷','📸','📹','📼','🔍','🔎','🕯','💡','🔦','🏮','📔','📕','📖','📗','📘','📙','📚','📓','📒','📜','📰','🔖','🏷','💰','🪙','💵','💸','💳','🧮'],
  },
  {
    name: 'Naturaleza',
    emojis: ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌙','🌚','🌛','🌜','☀','🌝','🌞','⭐','🌟','🌠','☁','⛅','⛈','🌤','🌥','🌦','🌧','🌨','❄','🌬','💨','🌪','🌫','🌈','☂','☔','⚡','🔥','💧','🌊','☄','🌍','🌎','🌏','🪐','💫'],
  },
];

export function EmojiPicker({ selected, onSelect, onClear, children }) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  const handleSelect = (emoji) => {
    onSelect(emoji);
    setOpen(false);
  };

  const handleClear = () => {
    onClear();
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-kb-border bg-kb-card text-kb-text-secondary hover:text-kb-text hover:border-kb-text-secondary transition-colors"
        title="Agregar icono"
      >
        {selected ? (
          <span className="text-lg leading-none">{selected}</span>
        ) : (
          <Smile size={18} />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-kb-card border border-kb-border rounded-xl shadow-2xl z-50 w-[300px] p-3">
          {/* Tabs de categoría */}
          <div className="flex gap-1 mb-2 overflow-x-auto pb-1 scrollbar-hide">
            {emojiCategories.map((cat, idx) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(idx)}
                className={`px-2 py-1 text-[10px] font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeCategory === idx
                    ? 'bg-white text-black'
                    : 'text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid de emojis */}
          <div className="grid grid-cols-7 gap-1 max-h-[200px] overflow-y-auto pr-1">
            {emojiCategories[activeCategory].emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className={`h-8 flex items-center justify-center rounded-md text-lg hover:bg-kb-hover transition-colors ${
                  selected === emoji ? 'bg-white/10 ring-1 ring-kb-text-secondary' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Botón quitar */}
          {selected && (
            <div className="mt-2 pt-2 border-t border-kb-border flex justify-end">
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-[10px] text-kb-text-secondary hover:text-red-400 transition-colors"
              >
                <X size={12} />
                Quitar icono
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
