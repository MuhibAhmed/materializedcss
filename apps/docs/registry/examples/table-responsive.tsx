import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const rows = [
  { region: "North", sales: [12, 14, 13, 15, 18, 21, 24, 22, 19, 17, 15, 20] },
  { region: "South", sales: [9, 10, 12, 11, 13, 16, 19, 18, 15, 14, 12, 16] },
  { region: "West", sales: [15, 13, 14, 17, 19, 22, 26, 25, 21, 18, 17, 23] },
];

export function TableResponsive() {
  return (
    <Table containerProps={{ tabIndex: 0, "aria-label": "Monthly sales (scrollable)" }} className="min-w-[56rem]">
      <TableCaption>Monthly sales in thousands of units.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Region</TableHead>
          {months.map((month) => (
            <TableHead key={month}>{month}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.region}>
            <TableHead scope="row">{row.region}</TableHead>
            {row.sales.map((value, index) => (
              <TableCell key={months[index]}>{value}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableHead scope="row">Total</TableHead>
          {months.map((month, index) => (
            <TableCell key={month}>{rows.reduce((sum, row) => sum + (row.sales[index] ?? 0), 0)}</TableCell>
          ))}
        </TableRow>
      </TableFooter>
    </Table>
  );
}
