type MatchScoreItem = {
  label: string;
  value: number;
  max: number;
  tip?: string;
};

type MatchScoreBreakdownProps = {
  title?: string;
  total: number;
  items: MatchScoreItem[];
};

const MatchScoreBreakdown = ({ title = 'Match Score', total, items }: MatchScoreBreakdownProps) => (
  <>
    <div className="text-center mb-6">
      <div className="text-5xl font-bold text-[var(--sp-accent)] mb-2">{total}%</div>
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
    </div>
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="group relative" title={item.tip}>
          <div className="flex justify-between text-xs mb-1 gap-3">
            <span className="text-[var(--text-secondary)] border-b border-dashed border-white/20 cursor-help">
              {item.label}
            </span>
            <span className="text-[var(--text-primary)] font-bold shrink-0">
              {Math.round((item.value / item.max) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--sp-accent)] rounded-full transition-all duration-1000"
              style={{ width: `${(item.value / item.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </>
);

export default MatchScoreBreakdown;
