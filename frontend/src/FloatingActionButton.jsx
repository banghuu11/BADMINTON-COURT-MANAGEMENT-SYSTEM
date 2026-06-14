import { Plus } from "lucide-react";

const FloatingActionButton = () => {
  return (
    <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-[#0b1c30] rounded-full shadow-[0_0_20px_rgba(191,240,0,0.4)] flex items-center justify-center z-40 cursor-pointer hover:bg-[#a8d800] active:scale-90 transition-all">
      <Plus className="w-8 h-8" strokeWidth={3} />
    </button>
  );
};

export default FloatingActionButton;
