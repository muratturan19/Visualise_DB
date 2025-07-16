export default function ProgressBar() {
  return (
    <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-2/5 bg-gradient-to-r from-primary to-secondary animate-progress" />
    </div>
  )
}
