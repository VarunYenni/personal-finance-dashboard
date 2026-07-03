import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something needs attention", message = "We could not load this view. Try again in a moment.", onRetry }: ErrorStateProps) {
  return (
    <div className="empty-state error-state">
      <AlertCircle size={28} />
      <p>{title}</p>
      <span>{message}</span>
      {onRetry && <button className="ghost-button" type="button" onClick={onRetry}><RotateCcw size={16} /> Retry</button>}
    </div>
  );
}
