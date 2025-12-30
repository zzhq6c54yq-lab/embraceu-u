import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserFilterOption } from "@/types/admin";

interface AdminUserSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: UserFilterOption;
  onFilterChange: (filter: UserFilterOption) => void;
  totalCount: number;
  filteredCount: number;
}

const filters: { value: UserFilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pwa', label: 'PWA' },
  { value: 'web', label: 'Web' },
];

const AdminUserSearch = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  totalCount,
  filteredCount
}: AdminUserSearchProps) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9 bg-background"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onSearchChange('')}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {filters.map((filter) => (
          <Badge
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "outline"}
            className="cursor-pointer transition-colors"
            onClick={() => onFilterChange(filter.value)}
          >
            {filter.label}
          </Badge>
        ))}
        {(searchQuery || activeFilter !== 'all') && (
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredCount} of {totalCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminUserSearch;
