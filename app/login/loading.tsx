import { LoadingSpinner } from "@/components/loading-spinner"

export default function LoginLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <LoadingSpinner />
    </div>
  )
}

