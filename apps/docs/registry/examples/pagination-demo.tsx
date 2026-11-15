import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PaginationDemo() {
  return (
    <Pagination>
      <PaginationList>
        <PaginationItem>
          <PaginationPrevious href="#!" disabled />
        </PaginationItem>
        {[1, 2, 3, 4, 5].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href="#!" isActive={page === 1}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#!" />
        </PaginationItem>
      </PaginationList>
    </Pagination>
  );
}
