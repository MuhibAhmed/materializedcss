import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const items = [
  { name: "Alvin", item: "Eclair", price: "$0.87" },
  { name: "Alan", item: "Jellybean", price: "$3.76" },
  { name: "Jonathan", item: "Lollipop", price: "$7.00" },
];

export function TableDemo() {
  return (
    <Table className="max-w-2xl">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Item Name</TableHead>
          <TableHead>Item Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.item}</TableCell>
            <TableCell>{row.price}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
