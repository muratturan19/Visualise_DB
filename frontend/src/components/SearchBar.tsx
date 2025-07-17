import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from './ui/Input'

export default function SearchBar() {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
      <Input
        type="text"
        placeholder="Search..."
        className="pl-8 w-48"
      />
    </div>
  )
}
