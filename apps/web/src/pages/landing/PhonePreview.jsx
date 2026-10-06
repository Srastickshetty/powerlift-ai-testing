import React from "react";

export default function PhonePreview({ t }) {
  return (
    <div className="mx-auto w-[260px] rounded-[2rem] border border-line bg-surface p-3 shadow-2xl sm:w-[290px]" aria-hidden="true">
      <div className="rounded-[1.5rem] bg-bg p-4">
        <div className="flex justify-between text-xs text-muted"><span>{t.lift}</span><span>Rest 1:12</span></div>
        <div className="mt-1 text-xs text-muted">Target {t.target}</div>
        <div className="my-4 flex items-center justify-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-line bg-raised text-xl select-none">−</span>
          <span className="num text-5xl font-semibold">{t.w}</span>
          <span className="grid h-11 w-11 place-items-center rounded-md border border-line bg-raised text-xl select-none">+</span>
        </div>
        <div className="flex justify-center gap-1.5">
          {[6, 7, 8, 9, 10].map((r) => (
            <span
              key={r}
              className={`num grid h-9 w-9 place-items-center rounded-md border text-sm font-bold ${
                r === 8 ? "border-accent bg-accent text-accent-ink" : "border-line bg-raised text-ink"
              }`}
            >
              {r}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-md bg-accent py-3 text-center font-bold text-accent-ink shadow-sm">
          ✓ Log set
        </div>
        <div className="mt-3 space-y-1.5 text-xs text-muted">
          <div className="flex justify-between"><span>Set 1</span><span className="num text-ink">{t.w - 20} × {t.r}</span></div>
          <div className="flex justify-between"><span>Set 2</span><span className="num text-ink">{t.w - 10} × {t.r}</span></div>
        </div>
      </div>
    </div>
  );
}
