import { themeQuartz } from "ag-grid-community";

/**
 * AG Grid themed from the Undo tokens (globals.css @theme): DM Sans, ink text, Rewind Mist hover, 30px radius.
 * Changed cells flash in Rewind lime, so live updates read as the brand's "something just moved".
 */
export const gridTheme = themeQuartz.withParams({
  fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui",
  fontSize: 14,
  headerFontSize: 13,
  headerFontWeight: 500,
  foregroundColor: "var(--color-ink)",
  backgroundColor: "var(--color-paper)",
  headerBackgroundColor: "var(--color-paper)",
  headerTextColor: "var(--color-muted)",
  borderColor: "color-mix(in srgb, var(--color-ink) 8%, transparent)",
  rowHoverColor: "var(--color-mist)",
  selectedRowBackgroundColor: "var(--color-mist)",
  accentColor: "var(--color-deep)",
  wrapperBorderRadius: 30,
  wrapperBorder: false,
  rowHeight: 64,
  headerHeight: 48,
  spacing: 6,
  valueChangeValueHighlightBackgroundColor: "color-mix(in srgb, var(--color-field) 70%, transparent)",
  pinnedRowBorder: { width: 2, color: "var(--color-ink)" },
});
