import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export function LoadingSpinner({ size = 24, className = "" }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center w-full py-6">
      <Loader2 className={`animate-spin text-primary ${className}`} size={size} />
    </div>
  )
}

