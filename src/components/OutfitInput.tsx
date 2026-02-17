import { Textarea } from "@/components/ui/textarea";
import { Shirt, Palette, Sparkles } from "lucide-react";

interface OutfitInputProps {
  value: string;
  onChange: (value: string) => void;
}

const suggestions = [
  {
    icon: Shirt,
    title: "Formal Suit",
    description: "Navy blue three-piece suit with silk tie",
  },
  {
    icon: Palette,
    title: "Casual Chic",
    description: "White linen shirt with beige chinos",
  },
  {
    icon: Sparkles,
    title: "Evening Gown",
    description: "Emerald green satin evening dress",
  },
];

const OutfitInput = ({ value, onChange }: OutfitInputProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block font-serif text-lg font-medium text-foreground mb-2">
          Describe Your Outfit
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          Be specific about colors, fabrics, fit, and details
        </p>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Red formal suit with golden buttons, tailored fit, premium wool fabric, double-breasted design with peak lapels..."
          className="min-h-[140px] resize-none bg-surface-sunken border-border focus:border-accent focus:ring-accent/20 text-foreground placeholder:text-muted-foreground/60"
        />
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Quick Suggestions
        </p>
        <div className="grid gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              onClick={() => onChange(suggestion.description)}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-elevated hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <suggestion.icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {suggestion.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {suggestion.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutfitInput;
