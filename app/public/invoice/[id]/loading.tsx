import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <LoadingSpinner />
    </div>
  )
}

