const V = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  secondary: "bg-raised text-ink border border-line hover:bg-line",
  ghost: "text-ink hover:bg-raised",
  danger: "bg-danger text-white hover:brightness-110",
};
const S = { md: "h-11 px-4 text-sm", lg: "h-14 px-6 text-base" };
export default function Button({ variant = "primary", size = "md", className = "", as: Tag = "button", ...p }) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition active:scale-[.98] disabled:opacity-50 ${V[variant]} ${S[size]} ${className}`}
      {...p}
    />
  );
}
