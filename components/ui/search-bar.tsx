"use client"

import { SearchInput } from "@/components/ui/shared/search-input"

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ")

interface SearchBarProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export const SearchBar = ({ placeholder, value, onChange, className }: SearchBarProps) => (
  <SearchInput
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    wrapperClassName={cx("mb-6", className)}
  />
)
