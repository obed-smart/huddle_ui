export interface EmojiCategoryData {
  id: string;
  label: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategoryData[] = [
  {
    id: "smileys",
    label: "Smileys",
    emojis: ["😀", "😁", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😗", "😎", "🤩", "🥳", "😏"],
  },
  {
    id: "gestures",
    label: "Gestures",
    emojis: ["👍", "👎", "👏", "🙌", "🙏", "👋", "✋", "🤝", "💪", "🤞", "✌️", "🤙", "👌", "🤘", "👊", "🫶"],
  },
  {
    id: "hearts",
    label: "Hearts",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💖", "💗", "💕", "💞", "💓", "💘", "❣️", "💔"],
  },
  {
    id: "animals",
    label: "Animals",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵", "🐔", "🐧", "🦄"],
  },
  {
    id: "food",
    label: "Food",
    emojis: ["🍎", "🍌", "🍇", "🍕", "🍔", "🍟", "🌮", "🍣", "🍩", "🍪", "☕", "🍰", "🍫", "🍿", "🥐", "🍉"],
  },
  {
    id: "objects",
    label: "Objects",
    emojis: ["🔥", "✨", "🎉", "🎊", "💡", "📌", "📎", "🔔", "🎯", "🏆", "⭐", "🌟", "💯", "🚀", "📷", "🎵"],
  },
];
