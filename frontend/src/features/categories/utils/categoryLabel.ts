import type { TranslationKey } from "../../../shared/i18n";
import type { Category } from "../types";

const DEFAULT_CATEGORY_KEYS: Record<string, TranslationKey> = {
  개인: "categoryPersonal",
  업무: "categoryWork",
  일반: "categoryGeneral",
  학습: "categoryStudy"
};

export function getCategoryDisplayName(
  category: Category,
  t: (key: TranslationKey) => string
) {
  if (!category.isDefault) {
    return category.name;
  }

  const translationKey = DEFAULT_CATEGORY_KEYS[category.name];
  return translationKey ? t(translationKey) : category.name;
}
