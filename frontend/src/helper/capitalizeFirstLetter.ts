export function capitalizeFirstLetter(
  text: string | null | undefined
): string {
  if (!text) return "";

  const separator = text.includes("_")
    ? "_"
    : text.includes("-")
    ? "-"
    : " ";

  return text
    .split(separator)
    .map(
      word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}
