import Link from "next/link";

interface MetropolitanHeaderProps {
  rightLabel?: string;
  rightHref?: string;
  showProgress?: boolean;
  progressStep?: 1 | 2 | 3;
  dark?: boolean;
}

export default function MetropolitanHeader({
  rightLabel = "Refine",
  rightHref,
  showProgress = false,
  progressStep = 1,
  dark = true,
}: MetropolitanHeaderProps) {
  const bg = dark ? "bg-forest" : "bg-forest";
  const text = "text-cream/80";

  return (
    <header className={`${bg} px-4 py-3 sm:px-6`}>
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className={`flex items-center gap-2 text-xs tracking-widest ${text}`}>
          <span className="deco-diamond shrink-0" />
          <span className="font-body font-medium uppercase">Metropolitan</span>
        </Link>

        {showProgress ? (
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <span key={step} className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rotate-45 border ${
                    step <= progressStep
                      ? "border-lime bg-lime"
                      : "border-cream/40 bg-transparent"
                  }`}
                />
                {step < 3 && (
                  <span className="hidden h-px w-6 bg-cream/20 sm:block" />
                )}
              </span>
            ))}
          </div>
        ) : (
          <div />
        )}

        {rightHref ? (
          <Link href={rightHref} className={`text-xs tracking-widest uppercase ${text}`}>
            {rightLabel}
          </Link>
        ) : (
          <span className={`text-xs tracking-widest uppercase ${text}`}>
            {rightLabel}
          </span>
        )}
      </div>
    </header>
  );
}
